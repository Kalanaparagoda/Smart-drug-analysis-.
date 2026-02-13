
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraScannerProps {
  onCapture: (base64: string) => void;
  isAnalyzing: boolean;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Camera access denied. Please enable permissions in your browser.");
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64 = dataUrl.split(',')[1];
        onCapture(base64);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 ring-1 ring-white/10 animate-in zoom-in-95 duration-500">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white bg-slate-900/90 backdrop-blur-md">
          <div className="max-w-xs">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
              <i className="fas fa-video-slash text-2xl"></i>
            </div>
            <p className="font-bold text-lg mb-6">{error}</p>
            <button 
              onClick={startCamera}
              className="w-full px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95"
            >
              Request Access
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1]"
          />
          
          {/* HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
             <div className="flex justify-between items-start">
                <div className="w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-lg"></div>
                <div className="w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg"></div>
             </div>
             
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[60%] border border-cyan-400/20 rounded-3xl overflow-hidden backdrop-brightness-[1.1]">
                {/* Enhanced Glow Scanning line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8),0_0_40px_rgba(34,211,238,0.4)] animate-[scanLine_4s_ease-in-out_infinite]"></div>
             </div>

             <div className="flex justify-between items-end">
                <div className="w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg"></div>
                <div className="w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-lg"></div>
             </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-8">
            <button
              onClick={captureFrame}
              disabled={isAnalyzing}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] ${
                isAnalyzing 
                ? 'bg-slate-800/80 backdrop-blur-md cursor-not-allowed border border-white/10' 
                : 'bg-cyan-600 hover:bg-cyan-500 hover:shadow-cyan-500/40 border border-cyan-400/50'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i>
                  PROCESSING...
                </>
              ) : (
                <>
                  <i className="fas fa-camera"></i>
                  ANALYZE PRODUCT
                </>
              )}
            </button>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraScanner;
