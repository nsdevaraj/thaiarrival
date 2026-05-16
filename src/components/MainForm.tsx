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
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-white border-slate-200 border p-3 rounded-lg font-medium text-slate-900 focus:border-blue-500 outline-none transition-colors pr-10"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            copyToClipboard(value, name);
          }}
          className="absolute right-3 p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-transparent outline-none"
          title="Copy to clipboard"
          type="button"
        >
          {copiedField === name ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-6 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Thai Arrival Card Assistant</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:block">
              Scan your passport to auto-fill the required details for the Digital Arrival Card (TM.6).
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto overflow-hidden">
        
        {/* Left Section: Scanner Area */}
        <section className="w-full lg:w-[420px] lg:border-r border-slate-200 bg-slate-100/50 p-6 sm:p-8 flex flex-col shrink-0 lg:overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Passport Scan</h2>
            <p className="text-sm text-slate-600">Auto-extract your personal info instantly.</p>
          </div>
          
          <button
            onClick={() => setIsScanning(true)}
            className="w-full py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 shadow-sm flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:bg-slate-100"
          >
            <Scan className="w-6 h-6 text-blue-600" />
            Launch Scanner
          </button>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 font-medium text-sm rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {isProcessing && (
            <div className="mt-6 p-4 bg-blue-50 text-blue-700 font-medium text-sm rounded-xl flex items-center justify-center gap-3 border border-blue-100">
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              <p>Extracting passport details via AI...</p>
            </div>
          )}
        </section>

        {/* Right Section: Form Area */}
        <section className="flex-1 p-6 sm:p-10 lg:overflow-y-auto flex flex-col">

          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Application Details</h2>
              <p className="text-slate-500">Fill missing data to complete</p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs font-bold border border-blue-200">
              DRAFT
            </div>
          </div>

        <form className="space-y-10 flex-1 content-start pb-8">
          {/* Section: Personal Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <User className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="First Name" name="firstName" value={data.firstName} />
              <FormField label="Last Name" name="lastName" value={data.lastName} />
              <FormField label="Passport Number" name="passportNumber" value={data.passportNumber} />
              <FormField label="Nationality" name="nationality" value={data.nationality} />
              
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                <select
                  name="gender"
                  value={data.gender}
                  onChange={handleChange}
                  className="w-full bg-white border-slate-200 border p-3 rounded-lg font-medium text-slate-900 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="X">Unspecified</option>
                </select>
              </div>

              <FormField label="Date of Birth" name="dateOfBirth" value={data.dateOfBirth} type="date" />
              <FormField label="Expiry Date" name="expiryDate" value={data.expiryDate} type="date" />
            </div>
          </div>

          {/* Section: Arrival Info */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Plane className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Travel Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Flight Number" name="flightNumber" value={data.flightNumber} placeholder="e.g. TG123" />
              <FormField label="Arrival Date" name="arrivalDate" value={data.arrivalDate} type="date" />
              <FormField label="Port of Entry" name="entryPort" value={data.entryPort} placeholder="e.g. BKK" />
              <FormField label="Purpose of Visit" name="purposeOfVisit" value={data.purposeOfVisit} placeholder="e.g. Tourism" />
            </div>
          </div>

          {/* Section: Contact & Accommodation */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-slate-400">
              <Home className="w-5 h-5" />
              <h3 className="text-sm font-bold tracking-wider uppercase text-slate-500">Accommodation & Contact</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Accommodation Name (Hotel)" name="accommodationName" value={data.accommodationName} />
              <FormField label="Address in Thailand" name="addressInThailand" value={data.addressInThailand} />
              <FormField label="Email Address" name="email" value={data.email} type="email" />
              <FormField label="Phone Number" name="phone" value={data.phone} type="tel" />
            </div>
          </div>
        </form>

        <div className="pt-8 mt-auto flex flex-col md:flex-row justify-between items-center sm:items-end md:items-center gap-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 w-full md:max-w-[300px] text-center md:text-left">
            Copy all details securely, then paste them directly into the official immigration site.
          </p>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <a
              href="https://tdac.immigration.go.th/arrival-card/#/home"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
            >
              Open TDAC Site <ChevronRight className="w-4 h-4" />
            </a>
            <button
              onClick={copyAll}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {copiedField === "all" ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copiedField === "all" ? "Details Copied!" : "Copy All"}
            </button>
          </div>
        </div>
      </section>
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
