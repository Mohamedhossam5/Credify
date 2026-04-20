import React from 'react';
import { TriangleAlert, RotateCcw } from 'lucide-react';
import { Button } from '../../ui/Button';

interface KycResultRejectedProps {
  onRetry: () => void;
  onAbort: () => void;
}

export const KycResultRejected: React.FC<KycResultRejectedProps> = ({ onRetry, onAbort }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[40px_44px] transition-all duration-[0.45s] bg-gradient-to-br from-[#fff8f6] via-[#fffcfc] to-[#f8faff] opacity-100 pointer-events-auto translate-y-0 scale-100 z-10">
      <div className="relative w-[86px] h-[86px] mb-[22px] shrink-0">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(239,68,68,0.16)] animate-reject-pulse"></div>
        <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-[rgba(239,68,68,0.1)] to-[rgba(239,68,68,0.05)] border-[1.5px] border-[rgba(239,68,68,0.18)] flex items-center justify-center text-auth-red animate-pop-in">
          <div className="w-8 h-8 relative flex items-center justify-center"><div className="w-[4px] h-[20px] bg-auth-red rounded-full rotate-45 absolute"></div><div className="w-[4px] h-[20px] bg-auth-red rounded-full -rotate-45 absolute"></div></div>
        </div>
      </div>
      <p className="font-h text-[1.3rem] font-extrabold text-auth-red mb-[6px]">Verification Failed</p>
      <p className="text-[0.79rem] text-auth-text-light text-center">We couldn't confirm your identity at this time.</p>
      
      <div className="w-full flex flex-col gap-[7px] my-[16px]">
        <div className="flex items-start gap-[10px] p-[10px_13px] bg-[rgba(239,68,68,0.035)] border border-[rgba(239,68,68,0.1)] rounded-[10px] text-left">
          <TriangleAlert className="text-auth-red w-[14px] h-[14px] mt-[2px] shrink-0" />
          <span className="text-[0.74rem] text-auth-text-mid leading-[1.45]">Document image quality too low or partially obscured</span>
        </div>
        <div className="flex items-start gap-[10px] p-[10px_13px] bg-[rgba(239,68,68,0.035)] border border-[rgba(239,68,68,0.1)] rounded-[10px] text-left">
          <TriangleAlert className="text-auth-red w-[14px] h-[14px] mt-[2px] shrink-0" />
          <span className="text-[0.74rem] text-auth-text-mid leading-[1.45]">Facial match confidence below required threshold</span>
        </div>
      </div>
      
      <div className="flex gap-[10px] w-full">
        <Button variant="outline" className="flex-1" onClick={onAbort}>Go Back</Button>
        <Button variant="danger" className="flex-[1.5]" onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>Try Again</Button>
      </div>
    </div>
  );
};
