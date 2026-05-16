import { useState } from "react";
import { X } from "lucide-react";
import { parseMrzLines } from "../lib/scanner";

interface MrzInputModalProps {
  onCapture: (passportData: any) => void;
  onClose: () => void;
}

export function MrzInputModal({ onCapture, onClose }: MrzInputModalProps) {
  const [mrzText, setMrzText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const lines = mrzText
        .split("\n")
        .map(l => l.trim().toUpperCase())
        .filter(l => l.length > 0);

      if (lines.length < 2) {
        throw new Error("MRZ must contain at least 2 lines.");
      }

      const parsed = parseMrzLines(lines);
      onCapture(parsed);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to parse MRZ. Please verify the format.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Enter MRZ Manually</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Paste the Machine Readable Zone (MRZ) characters from the bottom of your passport photo page. Typically 2 lines of 44 characters for passports.
          </p>
          
          <textarea
            className="w-full h-32 p-4 font-mono text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-50 uppercase resize-none"
            placeholder="P<USADOE<<JOHN<<<<<<<<<<<<<<<<<<<<...&#10;G582910222USA8505149M2801124<<<<<<..."
            value={mrzText}
            onChange={(e) => setMrzText(e.target.value)}
          />

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Process MRZ
          </button>
        </div>
      </div>
    </div>
  );
}
