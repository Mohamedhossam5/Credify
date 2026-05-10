import React from 'react';
import { Mail } from 'lucide-react';

interface KycResultApprovedProps {
  redirectCount: number;
}

export const KycResultApproved: React.FC<KycResultApprovedProps> = ({ redirectCount }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[40px_44px] transition-all duration-[0.45s] bg-gradient-to-br from-[#f0fdf4] via-[#fafffe] to-[#eff6ff] opacity-100 pointer-events-auto translate-y-0 scale-100 z-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-inherit">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="absolute animate-confetti-fall rounded-full opacity-[0.88]" style={{
            width: `${4 + Math.random() * 8}px`, height: `${4 + Math.random() * 8}px`,
            left: `${4 + Math.random() * 92}%`, top: '-14px',
            background: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 6)],
            animationDuration: `${1.1 + Math.random() * 1.2}s`, animationDelay: `${Math.random() * 0.7}s`
          }}></div>
        ))}
      </div>
      <div className="relative w-[94px] h-[94px] mb-[24px] shrink-0">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.2)_0%,transparent_68%)] animate-glow-pulse"></div>
        <svg viewBox="0 0 94 94" className="w-[94px] h-[94px] relative z-10">
          <circle cx="47" cy="47" r="43" fill="rgba(16,185,129,0.07)" />
          <circle cx="47" cy="47" r="43" stroke="#10b981" strokeWidth="2.5" fill="none" strokeDasharray="271" strokeDashoffset="271" strokeLinecap="round" className="origin-center -rotate-90 animate-draw-circle" />
          <polyline points="27,49 41,63 67,35" stroke="#10b981" strokeWidth="2.8" fill="none" strokeDasharray="58" strokeDashoffset="58" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" />
        </svg>
      </div>
      <p className="font-h text-[1.3rem] font-extrabold text-auth-teal mb-[6px]">Account Approved!</p>
      <p className="text-[0.79rem] text-auth-text-light text-center">Your identity has been successfully verified.</p>
      
      <div className="bg-[rgba(255,255,255,0.65)] border border-[rgba(16,185,129,0.14)] rounded-[13px] p-[14px_18px] w-full my-[18px] flex items-center gap-[13px] text-left backdrop-blur-[6px]">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-[rgba(16,185,129,0.1)] flex items-center justify-center text-auth-teal shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[0.76rem] font-bold text-auth-text-dark">Confirmation email sent</div>
          <div className="text-[0.68rem] text-auth-text-light mt-[2px] leading-[1.45]">Your account is now active. Sign in to start banking.</div>
        </div>
      </div>
      <div className="w-full">
        <div className="text-[0.67rem] text-auth-text-light mb-[7px] flex justify-between">
          <span>Redirecting you to login…</span><span>{redirectCount}s</span>
        </div>
        <div className="h-[3px] bg-auth-border rounded-[2px] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-auth-teal to-auth-blue transition-all duration-100" style={{ width: `${((3 - redirectCount) / 3) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};
