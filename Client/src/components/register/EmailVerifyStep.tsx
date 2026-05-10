import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, RotateCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

export const EmailVerifyStep: React.FC = () => {
  const { currentStep, setCurrentStep, user } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (currentStep === 4) {
      inputRefs.current[0]?.focus();
    }
  }, [currentStep]);

  if (currentStep !== 4) return null;

  const handleChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[idx] = value.slice(-1);
    setOtp(next);
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputRefs.current[lastFilled]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    setIsVerifying(true);
    try {
      const res = await authService.verifyEmail(code);
      toast.success(res.message || 'Email verified!');
      // Move to KYC step
      setCurrentStep(5);
    } catch (err: any) {
      toast.error(err?.message || err?.error || 'Invalid code. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.sendEmailOtp();
      toast.success('New code sent to your email.');
      setCooldown(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : 'your email';

  return (
    <div className="w-full animate-fadein py-6 md:py-10">
      <button onClick={() => setCurrentStep(3)} className="inline-flex items-center gap-[7px] bg-transparent border-none text-auth-text-light font-b text-[0.77rem] font-medium cursor-pointer p-0 mb-[14px] transition-colors duration-220 hover:text-auth-teal group">
        <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-[3px]" /> Phone verification
      </button>

      <div className="text-center mb-6">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
          <Mail className="w-3 h-3" /> Email Verification
        </div>
        <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
          Verify your email.
        </h1>
        <p className="text-[0.8rem] text-auth-text-light mb-2 leading-[1.55]">
          We sent a 6-digit code to <span className="font-semibold text-auth-text-mid">{maskedEmail}</span>
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-[5px] mb-6">
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <div className="h-[3px] rounded-[2px] bg-auth-teal w-[36px]" />
        <span className="text-[0.65rem] text-auth-text-light ml-[4px]">Step 4 of 4</span>
      </div>

      {/* OTP inputs */}
      <div className="flex gap-[10px] justify-center mb-6" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-[48px] h-[56px] text-center text-[1.3rem] font-bold rounded-[13px] border-[1.5px] border-auth-border bg-auth-input text-auth-text-dark focus:border-auth-teal focus:ring-2 focus:ring-auth-teal/20 outline-none transition-all duration-200"
          />
        ))}
      </div>

      <Button onClick={handleVerify} className="w-full" isLoading={isVerifying} loadingText="Verifying…" icon={<ArrowRight className="w-4 h-4" />}>
        Verify Email
      </Button>

      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-[6px] text-[0.79rem] text-auth-text-light hover:text-auth-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
};
