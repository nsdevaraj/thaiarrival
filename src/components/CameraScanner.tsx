import { useState, useRef, useCallback } from "react";
import { Camera, X, RefreshCcw } from "lucide-react";

interface CameraScannerProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onCapture, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError("");
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Please allow camera access to scan your passport.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start the camera automatically when the component mounts
  useState(() => {
    startCamera();
    return stopCamera;
  });

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL("image/jpeg", 0.9);
      onCapture(base64Image);
      stopCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="p-4 flex justify-between items-center bg-black/50 absolute top-0 w-full z-10 text-white">
        <h2 className="text-lg font-semibold tracking-tight">Scan Passport</h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6 bg-red-500/20 rounded-xl max-w-sm">
            <p>{error}</p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 w-full"
            >
              <RefreshCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="object-cover w-full h-full"
          />
        )}
        
        {/* Viewfinder overlay */}
        {!error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="w-full max-w-md aspect-[3/2] border-2 border-white/50 rounded-xl relative">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                <p className="text-white bg-black/60 px-4 py-1.5 rounded-full text-sm backdrop-blur-md mb-24">
                  Position passport data page within frame
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-black p-8 pb-12 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={!!error}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 transition-colors"></div>
        </button>
      </div>
    </div>
  );
}
