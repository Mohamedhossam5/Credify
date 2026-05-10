import React from 'react';
import { cn } from '../../lib/utils';
import { Camera, RotateCcw, Check, Info } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraModalProps {
  isCamOpen: boolean;
  closeCam: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  camCaptured: string | null;
  capturePhoto: () => void;
  resetCapture: () => void;
  usePhoto: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isCamOpen, closeCam, videoRef, camCaptured, capturePhoto, resetCapture, usePhoto }) => {
  return (
    <div className={cn("fixed inset-0 z-[1000] bg-[rgba(9,21,41,0.72)] backdrop-blur-[10px] flex items-center justify-center transition-opacity duration-300", isCamOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className={cn("bg-white border border-auth-border rounded-[24px] p-[28px] w-[min(420px,92vw)] shadow-[0_40px_80px_rgba(14,31,66,0.22)] transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]", isCamOpen ? "translate-y-0 scale-100" : "translate-y-[18px] scale-[0.96]")}>
        <div className="flex items-center justify-between mb-[16px]">
          <h3 className="font-h text-[0.97rem] font-bold text-auth-text-dark flex items-center gap-2">
            <Camera className="text-auth-teal w-4 h-4" /> Live Selfie
          </h3>
          <button onClick={closeCam} className="w-[34px] h-[34px] rounded-[9px] bg-auth-input border border-auth-border text-auth-text-light cursor-pointer flex items-center justify-center transition-colors hover:text-auth-text-dark hover:bg-auth-border">
            X
          </button>
        </div>
        <div className="w-full aspect-[4/3] rounded-[13px] overflow-hidden bg-black relative mb-[14px] border border-auth-border">
          {!camCaptured ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover block" />
          ) : (
            <img src={camCaptured} alt="Selfie preview" className="w-full h-full object-cover block" />
          )}
        </div>
        {!camCaptured ? (
          <div className="flex gap-[9px]">
            <Button onClick={capturePhoto} className="flex-1" icon={<div className="w-3 h-3 rounded-full border-2 border-white"></div>}>Capture</Button>
          </div>
        ) : (
          <div className="flex gap-[9px]">
            <Button onClick={resetCapture} variant="outline" className="flex-1" icon={<RotateCcw className="w-4 h-4" />}>Retake</Button>
            <Button onClick={usePhoto} className="flex-1" icon={<Check className="w-4 h-4" />}>Use Photo</Button>
          </div>
        )}
        <p className="text-[0.68rem] text-auth-text-light text-center mt-[9px] flex items-center justify-center gap-[5px]">
          <Info className="w-3 h-3" /> Look straight ahead in good lighting
        </p>
      </div>
    </div>
  );
};
