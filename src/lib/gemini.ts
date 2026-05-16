import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "Extract the details from this passport image. Focus on the MRZ code at the bottom as well as the text fields to accurately determine the first name, last name, passport number, nationality, gender, date of birth, and date of expiry.",
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          firstName: {
            type: Type.STRING,
            description: "The given name(s) or first name of the person.",
          },
          lastName: {
            type: Type.STRING,
            description: "The surname or last name of the person.",
          },
          passportNumber: {
            type: Type.STRING,
            description: "The alphanumeric passport number.",
          },
          nationality: {
            type: Type.STRING,
            description: "The nationality, typically matching the MRZ abbreviation or spelled out country.",
          },
          gender: {
            type: Type.STRING,
            description: "The gender of the person (e.g., M, F, X).",
          },
          dateOfBirth: {
            type: Type.STRING,
            description: "The date of birth in YYYY-MM-DD format.",
          },
          expiryDate: {
            type: Type.STRING,
            description: "The date of expiry in YYYY-MM-DD format.",
          },
        },
        required: [
          "firstName",
          "lastName",
          "passportNumber",
          "nationality",
          "gender",
          "dateOfBirth",
          "expiryDate",
        ],
      },
      temperature: 0.1,
    },
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("Failed to extract data from passport.");
  }

  return JSON.parse(jsonText) as PassportData;
}
