import Tesseract from "tesseract.js";
import { parse } from "mrz";

export interface PassportData {
  firstName: string;
  lastName: string;
  passportNumber: string;
  nationality: string;
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
}

export async function extractPassportData(base64Image: string): Promise<PassportData> {
  const result = await Tesseract.recognize(base64Image, "eng");
  const text = result.data.text;
  
  // Clean up text and split to lines
  const lines = text.split("\n")
    .map(l => l.replace(/\s+/g, "").replace(/«/g, "<").toUpperCase())
    .filter(l => l.length >= 30 && l.includes("<"));

  // Attempt to find a valid MRZ block
  // TD3: 2 lines of 44 chars
  // TD1/TD2: 3 lines of 30 chars or 2 lines of 36 chars
  
  let mrzLines: string[] = [];
  
  // Simple heuristic: find contiguous lines that look like MRZ
  for (let i = 0; i < lines.length; i++) {
    const l1 = lines[i];
    // Check if it's the start of a TD3 passport MRZ
    if (l1.startsWith("P<") || l1.startsWith("P") && l1.length >= 44) {
      if (i + 1 < lines.length) {
        let line1 = l1.substring(0, 44);
        let line2 = lines[i + 1].substring(0, 44);
        // Sometimes OCR misses a character, try to pad it
        if (line1.length < 44) line1 = line1.padEnd(44, '<');
        if (line2.length < 44) line2 = line2.padEnd(44, '<');
        
        mrzLines = [line1, line2];
        break;
      }
    }
  }

  // Fallback to any two/three lines that could be MRZ
  if (mrzLines.length === 0 && lines.length >= 2) {
    // Just take the last 2 lines that look reasonably long
    const candidateLines = lines.slice(-2);
    mrzLines = candidateLines.map(l => l.length < 44 ? l.padEnd(44, '<').substring(0, 44) : l.substring(0, 44));
  }

  if (mrzLines.length === 0) {
    throw new Error("Could not detect an MRZ in the scanned image. Please try again.");
  }

  return parseMrzLines(mrzLines);
}

export function parseMrzLines(mrzLines: string[]): PassportData {
  try {
    const parsed = parse(mrzLines);
    
    // Parse formats MRZ data correctly
    const toDate = (dateStr: string) => {
      // MRZ dates are YYMMDD
      if (!dateStr || dateStr.length !== 6) return "";
      const yearStr = dateStr.substring(0, 2);
      const month = dateStr.substring(2, 4);
      const day = dateStr.substring(4, 6);
      
      const year = parseInt(yearStr, 10);
      const prefix = year > 50 ? "19" : "20"; // simplistic assumption for DOB vs Expiry
      return `${prefix}${yearStr}-${month}-${day}`;
    };

    let gender = parsed.fields.sex;
    if (gender === "male") gender = "M";
    else if (gender === "female") gender = "F";
    else gender = "X";

    return {
      firstName: parsed.fields.firstName || "",
      lastName: parsed.fields.lastName || "",
      passportNumber: parsed.fields.documentNumber || "",
      nationality: parsed.fields.nationality || "",
      gender: gender,
      dateOfBirth: toDate(parsed.fields.birthDate),
      expiryDate: toDate(parsed.fields.expirationDate)
    };
  } catch (error: any) {
    throw new Error("Failed to parse MRZ from the passport. Make sure the bottom part of the passport is well-lit and clearly visible.");
  }
}
