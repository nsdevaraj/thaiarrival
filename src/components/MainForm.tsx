import { useState, ChangeEvent } from "react";
import { ArrivalData, initialArrivalData } from "../types";
import { CameraScanner } from "./CameraScanner";
import { extractPassportData } from "../lib/gemini";
import { Scan, Copy, CheckCircle2, ChevronRight, Plane, User, Home, AlertCircle } from "lucide-react";

export function MainForm() {
  const [data, setData] = useState<ArrivalData>(initialArrivalData);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64Image: string) => {
    setIsScanning(false);
    setIsProcessing(true);
    setError(null);
    try {
      const passportInfo = await extractPassportData(base64Image);
      setData((prev) => ({
        ...prev,
        firstName: passportInfo.firstName || prev.firstName,
        lastName: passportInfo.lastName || prev.lastName,
        passportNumber: passportInfo.passportNumber || prev.passportNumber,
        nationality: passportInfo.nationality || prev.nationality,
        gender: passportInfo.gender || prev.gender,
        dateOfBirth: passportInfo.dateOfBirth || prev.dateOfBirth,
        expiryDate: passportInfo.expiryDate || prev.expiryDate,
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to extract data. Please try scanning again or enter manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    const textToCopy = `
First Name: ${data.firstName}
Last Name: ${data.lastName}
Passport Number: ${data.passportNumber}
Nationality: ${data.nationality}
Gender: ${data.gender}
DOB: ${data.dateOfBirth}
Expiry: ${data.expiryDate}
Flight: ${data.flightNumber}
Arrival: ${data.arrivalDate}
Port: ${data.entryPort}
Accommodation: ${data.accommodationName}
Address: ${data.addressInThailand}
Email: ${data.email}
Phone: ${data.phone}
Purpose: ${data.purposeOfVisit}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopiedField("all");
    setTimeout(() => setCopiedField(null), 3000);
  };

  const FormField = ({ label, name, placeholder, value, type = "text" }: { label: string; name: keyof ArrivalData; placeholder?: string; value: string; type?: string }) => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            copyToClipboard(value, name);
          }}
          className="absolute right-2 p-1.5 text-gray-400 hover:text-blue-600 transition-colors bg-white"
          title="Copy to clipboard"
          type="button"
        >
          {copiedField === name ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-blue-600 text-white px-6 py-8 shadow-md">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Thai Arrival Card Assistant</h1>
          <p className="text-blue-100 text-sm">
            Scan your passport to auto-fill the required details for the Digital Arrival Card (TM.6).
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Passport Scan</h2>
              <p className="text-sm text-gray-500">Auto-extract your personal info instantly.</p>
            </div>
            <button
              onClick={() => setIsScanning(true)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Scan className="w-5 h-5" />
              Scan Passport
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {isProcessing && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              <p className="text-sm font-medium">Extracting passport details via AI...</p>
            </div>
          )}
        </div>

        <form className="space-y-6">
          {/* Section: Personal Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <User className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="First Name" name="firstName" value={data.firstName} />
              <FormField label="Last Name" name="lastName" value={data.lastName} />
              <FormField label="Passport Number" name="passportNumber" value={data.passportNumber} />
              <FormField label="Nationality" name="nationality" value={data.nationality} />
              
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={data.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="X">Unspecified (X)</option>
                </select>
              </div>

              <FormField label="Date of Birth (YYYY-MM-DD)" name="dateOfBirth" value={data.dateOfBirth} type="date" />
              <FormField label="Expiry Date (YYYY-MM-DD)" name="expiryDate" value={data.expiryDate} type="date" />
            </div>
          </div>

          {/* Section: Arrival Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <Plane className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-900">Travel Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Flight Number" name="flightNumber" value={data.flightNumber} placeholder="e.g. TG123" />
              <FormField label="Arrival Date" name="arrivalDate" value={data.arrivalDate} type="date" />
              <FormField label="Port of Entry" name="entryPort" value={data.entryPort} placeholder="e.g. BKK (Suvarnabhumi)" />
              <FormField label="Purpose of Visit" name="purposeOfVisit" value={data.purposeOfVisit} placeholder="e.g. Tourism" />
            </div>
          </div>

          {/* Section: Contact & Accommodation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex items-center gap-2 mb-4 text-purple-600">
              <Home className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-gray-900">Accommodation & Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Accommodation Name (Hotel)" name="accommodationName" value={data.accommodationName} />
              <FormField label="Address in Thailand" name="addressInThailand" value={data.addressInThailand} />
              <FormField label="Email Address" name="email" value={data.email} type="email" />
              <FormField label="Phone Number" name="phone" value={data.phone} type="tel" />
            </div>
          </div>
        </form>

        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={copyAll}
            className="w-full md:w-auto px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-full font-medium shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copiedField === "all" ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copiedField === "all" ? "Details Copied!" : "Copy All Details"}
          </button>
          <a
            href="https://tdac.immigration.go.th/arrival-card/#/home"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Go to Official TDAC Form <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </main>

      {isScanning && (
        <CameraScanner
          onClose={() => setIsScanning(false)}
          onCapture={handleCapture}
        />
      )}
    </div>
  );
}
