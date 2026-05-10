import React from 'react';
import { cn } from '../../../lib/utils';
import { ShieldHalf, Check, IdCard, Smile, CircleCheck } from 'lucide-react';

interface KycProgressStepsProps {
  progress: number;
  activeStep: number;
}

export const KycProgressSteps: React.FC<KycProgressStepsProps> = ({ progress, activeStep }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[40px_44px] transition-all duration-[0.45s] bg-gradient-to-br from-[#f0f9ff] via-[#fafffe] to-[#f0fdf4] opacity-100 pointer-events-auto translate-y-0 scale-100 z-10">
      <div className="relative w-[120px] h-[120px] mb-[26px] shrink-0">
        <div className="orbit-ring animate-orbit-spin"></div>
        <div className="orbit-ring r2 animate-orbit-spin-reverse"></div>
        <div className="orbit-ring r3 animate-orbit-spin-fast"></div>
        <div className="absolute inset-[33px] rounded-full bg-gradient-to-br from-auth-teal to-auth-blue flex items-center justify-center text-white animate-center-pulse">
          <ShieldHalf className="w-6 h-6" />
        </div>
      </div>
      <h2 className="font-h text-[1.3rem] font-extrabold text-auth-text-dark tracking-[-0.5px] mb-[4px]">Verifying your identity...</h2>
      <div className="w-full mt-[22px] mb-[26px] flex flex-col gap-[9px]">
        {[
          { id: 0, label: "Scanning Documents", sub: "Checking authenticity", icon: IdCard },
          { id: 1, label: "Facial Matching", sub: "Comparing selfie to ID", icon: Smile },
          { id: 2, label: "Background Check", sub: "Global watchlists", icon: ShieldHalf },
          { id: 3, label: "Final Approval", sub: "Issuing secure vault", icon: CircleCheck }
        ].map((step, idx) => (
          <div key={step.id} className={cn(
            "flex items-center gap-[11px] p-[11px_14px] bg-[rgba(255,255,255,0.68)] border border-[rgba(221,228,239,0.55)] rounded-[11px] text-left transition-all duration-[0.45s]",
            idx < activeStep ? "opacity-100 translate-x-0 border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.025)]" : 
            idx === activeStep ? "opacity-100 translate-x-0 border-[rgba(16,185,129,0.22)] bg-[rgba(16,185,129,0.04)]" : "opacity-[0.38] -translate-x-[8px]"
          )}>
            <div className={cn("w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0 text-[0.76rem] transition-all relative",
              idx < activeStep ? "bg-auth-teal text-white" : 
              idx === activeStep ? "bg-[rgba(16,185,129,0.11)] text-auth-teal vstep-active-ring" : "bg-auth-input text-auth-text-light"
            )}>
              {idx < activeStep ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-[0.8rem] font-semibold text-auth-text-dark">{step.label}</div>
              <div className="text-[0.68rem] text-auth-text-light mt-[1px]">{step.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full h-[4px] bg-auth-border rounded-[2px] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-auth-teal to-auth-blue transition-all duration-[0.55s]" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="text-[0.66rem] text-auth-text-light mt-[8px] flex justify-between w-full">
        <span>Processing...</span><span>{progress}%</span>
      </div>
    </div>
  );
};
