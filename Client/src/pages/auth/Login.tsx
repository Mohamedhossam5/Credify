import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ShieldHalf, CheckCircle2, LogIn, ArrowRight, RotateCw, ArrowLeft } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../../schemas/auth';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, otpRequired, loginEmail, setOtpRequired, clearOtp } = useAuthStore();

  // ─── Step 1: Credentials ───────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  // Shared routing logic — reads user.kycStatus as single source of truth
  const routeAfterLogin = (user: any) => {
    if (user.role === 'ADMIN' || user.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    switch (user.kycStatus) {
      case 'APPROVED':
        navigate('/dashboard');
        break;
      case 'REJECTED':
        navigate('/rejected');
        break;
      case 'PENDING_ADMIN_REVIEW':
        navigate('/pending-approval');
        break;
      default: {
        // PENDING — figure out which onboarding step they're on
        const { phoneVerified, emailVerified } = user;
        if (!phoneVerified) {
          useAuthStore.getState().setCurrentStep(3 as any);
        } else if (!emailVerified) {
          useAuthStore.getState().setCurrentStep(4 as any);
        } else {
          useAuthStore.getState().setCurrentStep(5 as any);
        }
        navigate('/register');
        break;
      }
    }
  };

  const onSubmitCredentials = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      if (res.otpRequired) {
        setOtpRequired(res.email!);
        toast.success(res.message || 'Verification code sent to your email.');
      } else if (res.token && res.user) {
        // Admin bypass — no OTP needed
        setSession(res.token, res.user);
        toast.success('Welcome back!');
        routeAfterLogin(res.user);
      }
    } catch (err: any) {
      toast.error(err?.message || err?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: OTP verification ──────────────────────────────
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
    if (otpRequired) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [otpRequired]);

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[idx] = value.slice(-1);
    setOtp(next);
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setOtp(next);
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) inputRefs.current[lastFilled]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code.');
      return;
    }
    if (!loginEmail) return;

    setIsVerifying(true);
    try {
      const res = await authService.verifyOtp({ email: loginEmail, otp: code });
      setSession(res.token, res.user);
      clearOtp();
      toast.success('Welcome back!');
      routeAfterLogin(res.user);
    } catch (err: any) {
      toast.error(err?.message || err?.error || 'Invalid or expired code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!loginEmail) return;
    setIsResending(true);
    try {
      await authService.resendOtp(loginEmail);
      toast.success('New code sent.');
      setCooldown(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToCredentials = () => {
    clearOtp();
    setOtp(['', '', '', '', '', '']);
  };

  // ─── Render: OTP Step ──────────────────────────────────────
  if (otpRequired && loginEmail) {
    const maskedEmail = loginEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return (
      <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8 relative overflow-x-hidden overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-[400px] my-auto">
          <button
            onClick={handleBackToCredentials}
            className="inline-flex items-center gap-[7px] bg-transparent border-none text-auth-text-light font-b text-[0.77rem] font-medium cursor-pointer p-0 mb-[14px] transition-colors duration-220 hover:text-auth-teal group"
          >
            <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-[3px]" /> Back to login
          </button>

          <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
            <Mail className="w-3 h-3" /> Two-Factor Authentication
          </div>
          <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
            Check your email.
          </h1>
          <p className="text-[0.8rem] text-auth-text-light mb-6 leading-[1.55]">
            We sent a 6-digit code to <span className="font-semibold text-auth-text-mid">{maskedEmail}</span>
          </p>

          {/* OTP inputs */}
          <div className="flex gap-[10px] justify-center mb-6" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-[48px] h-[56px] text-center text-[1.3rem] font-bold rounded-[13px] border-[1.5px] border-auth-border bg-auth-input text-auth-text-dark focus:border-auth-teal focus:ring-2 focus:ring-auth-teal/20 outline-none transition-all duration-200"
              />
            ))}
          </div>

          <Button onClick={handleVerifyOtp} className="w-full" isLoading={isVerifying} loadingText="Verifying…" icon={<ArrowRight className="w-4 h-4" />}>
            Verify &amp; Sign In
          </Button>

          <div className="mt-4 text-center">
            <button
              onClick={handleResendOtp}
              disabled={cooldown > 0 || isResending}
              className="inline-flex items-center gap-[6px] text-[0.79rem] text-auth-text-light hover:text-auth-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <div className="mt-4 text-[0.69rem] text-auth-text-light flex items-center justify-center gap-[7px] flex-wrap">
            <ShieldHalf className="text-auth-teal w-[12px] h-[12px]" /> 256-bit TLS &nbsp;·&nbsp;
            <CheckCircle2 className="text-auth-teal w-[12px] h-[12px]" /> Systems operational
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Credentials Step ──────────────────────────────
  return (
    <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8 relative overflow-x-hidden overflow-y-auto scrollbar-hide">
      <form onSubmit={handleSubmit(onSubmitCredentials)} className="w-full max-w-[400px] my-auto">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
          <div className="w-[8px] h-[8px] rounded-full bg-auth-teal"></div> Secure access
        </div>
        <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
          Welcome back.
        </h1>
        <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
          Sign in to your digital vault.
        </p>

        <Input
          label="Email address"
          type="email"
          id="lEm"
          placeholder="you@example.com"
          autoComplete="email"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          id="lPw"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-between items-center w-full mb-4">
          <label className="flex items-center gap-[8px] text-[0.79rem] text-auth-text-mid cursor-pointer select-none group">
            <input type="checkbox" className="hidden peer" />
            <span className="w-[16px] h-[16px] rounded-[5px] border-[1.5px] border-auth-border bg-auth-input flex items-center justify-center text-[0.52rem] text-white transition-all duration-220 peer-checked:bg-auth-teal peer-checked:border-auth-teal peer-checked:after:content-['✓'] peer-checked:after:font-black flex-shrink-0"></span>
            Remember me
          </label>
          <a href="#" className="text-[0.79rem] text-auth-text-light no-underline transition-colors duration-220 hover:text-auth-teal">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full mt-1"
          isLoading={isLoading}
          loadingText="Authenticating…"
          icon={<LogIn className="w-4 h-4" />}
        >
          Sign In Securely
        </Button>

        <div className="mt-4 text-[0.69rem] text-auth-text-light flex items-center justify-center gap-[7px] flex-wrap">
          <ShieldHalf className="text-auth-teal w-[12px] h-[12px]" /> 256-bit TLS &nbsp;·&nbsp;
          <CheckCircle2 className="text-auth-teal w-[12px] h-[12px]" /> Systems operational
        </div>
      </form>
    </div>
  );
};

export default Login;
