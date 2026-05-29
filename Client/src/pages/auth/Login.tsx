import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Mail, ShieldHalf, CheckCircle2, LogIn, ArrowRight,
  RotateCw, ArrowLeft, CreditCard, KeyRound,
} from 'lucide-react';
import { loginSchema, type LoginFormData, forgotPasswordSchema, type ForgotPasswordFormData, resetPasswordSchema, type ResetPasswordFormData } from '../../schemas/auth';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

// ─── View states ──────────────────────────────────────────────
type View = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setSession, otpRequired, loginEmail, setOtpRequired, clearOtp } = useAuthStore();

  const [view, setView] = useState<View>('login');

  // ─── Shared routing logic ──────────────────────────────────
  const routeAfterLogin = (user: any) => {
    if (user.role === 'ADMIN' || user.role === 'admin') {
      navigate('/admin/dashboard', { state: { bypassAuth: true } });
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

  // ─────────────────────────────────────────────────────────────
  // STEP 1 — Login credentials
  // ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmitCredentials = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email: data.email, password: data.password });
      if (res.otpRequired) {
        setOtpRequired(res.email!);
        toast.success(res.message || 'Verification code sent to your email.');
      } else if (res.token && res.user) {
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

  // ─────────────────────────────────────────────────────────────
  // STEP 2 — Login OTP verification
  // ─────────────────────────────────────────────────────────────
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
    if (code.length !== 6) { toast.error('Please enter the full 6-digit code.'); return; }
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

  // ─────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — Step 1: Email + National ID
  // ─────────────────────────────────────────────────────────────
  const [fpEmail, setFpEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { register: fpRegister, handleSubmit: fpHandleSubmit, formState: { errors: fpErrors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmitForgotEmail = async (data: ForgotPasswordFormData) => {
    setIsSendingReset(true);
    try {
      await authService.forgotPassword(data.email, data.idNumber);
      setFpEmail(data.email);
      toast.success('If your details match, a reset code has been sent.');
      setView('forgot-otp');
      setResetOtp(['', '', '', '', '', '']);
      setTimeout(() => resetOtpRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — Step 2: OTP verification
  // ─────────────────────────────────────────────────────────────
  const [resetOtp, setResetOtp] = useState(['', '', '', '', '', '']);
  const [isVerifyingReset, setIsVerifyingReset] = useState(false);
  const [isResendingReset, setIsResendingReset] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const resetOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    if (resetCooldown > 0) {
      const t = setTimeout(() => setResetCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resetCooldown]);

  const handleResetOtpChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...resetOtp];
    next[idx] = value.slice(-1);
    setResetOtp(next);
    if (value && idx < 5) resetOtpRefs.current[idx + 1]?.focus();
  };

  const handleResetOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !resetOtp[idx] && idx > 0) resetOtpRefs.current[idx - 1]?.focus();
  };

  const handleResetOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...resetOtp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setResetOtp(next);
    const lastFilled = Math.min(pasted.length, 6) - 1;
    if (lastFilled >= 0) resetOtpRefs.current[lastFilled]?.focus();
  };

  const handleVerifyResetOtp = async () => {
    const code = resetOtp.join('');
    if (code.length !== 6) { toast.error('Please enter the full 6-digit code.'); return; }
    setIsVerifyingReset(true);
    try {
      const res = await authService.verifyResetOtp(fpEmail, code);
      setResetToken(res.resetToken);
      toast.success('Code verified! Set your new password.');
      setView('forgot-reset');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid or expired code.');
    } finally {
      setIsVerifyingReset(false);
    }
  };

  const handleResendResetOtp = async () => {
    setIsResendingReset(true);
    try {
      // Re-trigger forgot-password with same email (no ID needed for resend)
      await authService.resendOtp(fpEmail);
      toast.success('New reset code sent.');
      setResetCooldown(30);
      setResetOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resend code.');
    } finally {
      setIsResendingReset(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FORGOT PASSWORD — Step 3: New password
  // ─────────────────────────────────────────────────────────────
  const [isResetting, setIsResetting] = useState(false);
  const { register: rpRegister, handleSubmit: rpHandleSubmit, formState: { errors: rpErrors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmitReset = async (data: ResetPasswordFormData) => {
    setIsResetting(true);
    try {
      await authService.resetPassword(resetToken, data.newPassword);
      toast.success('Password reset! Please sign in with your new password.');
      // Reset all forgot-password state
      setView('login');
      setFpEmail('');
      setResetToken('');
      setResetOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password. Please start over.');
    } finally {
      setIsResetting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Shared UI helpers
  // ─────────────────────────────────────────────────────────────
  const securityBadge = (
    <div className="mt-4 text-[0.69rem] text-auth-text-light flex items-center justify-center gap-[7px] flex-wrap">
      <ShieldHalf className="text-auth-teal w-[12px] h-[12px]" /> 256-bit TLS &nbsp;·&nbsp;
      <CheckCircle2 className="text-auth-teal w-[12px] h-[12px]" /> Systems operational
    </div>
  );

  const backBtn = (label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-[7px] bg-transparent border-none text-auth-text-light font-b text-[0.77rem] font-medium cursor-pointer p-0 mb-[14px] transition-colors duration-220 hover:text-auth-teal group"
    >
      <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-[3px]" /> {label}
    </button>
  );

  const otpInputRow = (
    digits: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onChange: (idx: number, val: string) => void,
    onKeyDown: (idx: number, e: React.KeyboardEvent) => void,
    onPaste: (e: React.ClipboardEvent) => void,
  ) => (
    <div className="flex gap-[10px] justify-center mb-6" onPaste={onPaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => onChange(idx, e.target.value)}
          onKeyDown={(e) => onKeyDown(idx, e)}
          className="w-[48px] h-[56px] text-center text-[1.3rem] font-bold rounded-[13px] border-[1.5px] border-auth-border bg-auth-input text-auth-text-dark focus:border-auth-teal focus:ring-2 focus:ring-auth-teal/20 outline-none transition-all duration-200"
        />
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER: Login OTP step
  // ─────────────────────────────────────────────────────────────
  if (otpRequired && loginEmail) {
    const maskedEmail = loginEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    return (
      <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8 relative overflow-x-hidden overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-[400px] my-auto">
          {backBtn('Back to login', handleBackToCredentials)}
          <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
            <Mail className="w-3 h-3" /> Two-Factor Authentication
          </div>
          <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">Check your email.</h1>
          <p className="text-[0.8rem] text-auth-text-light mb-6 leading-[1.55]">
            We sent a 6-digit code to <span className="font-semibold text-auth-text-mid">{maskedEmail}</span>
          </p>
          {otpInputRow(otp, inputRefs, handleOtpChange, handleOtpKeyDown, handleOtpPaste)}
          <Button onClick={handleVerifyOtp} className="w-full" isLoading={isVerifying} loadingText="Verifying…" icon={<ArrowRight className="w-4 h-4" />}>
            Verify & Sign In
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
          {securityBadge}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Forgot — Step 1: Email + National ID
  // ─────────────────────────────────────────────────────────────
  if (view === 'forgot-email') {
    return (
      <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8 relative overflow-x-hidden overflow-y-auto scrollbar-hide">
        <form onSubmit={fpHandleSubmit(onSubmitForgotEmail)} className="w-full max-w-[400px] my-auto">
          {backBtn('Back to login', () => setView('login'))}
          <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
            <KeyRound className="w-3 h-3" /> Password Recovery
          </div>
          <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">Forgot password?</h1>
          <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
            Enter your registered email and National ID to verify ownership.
          </p>

          <Input
            label="Email address"
            type="email"
            id="fpEmail"
            placeholder="you@example.com"
            autoComplete="email"
            icon={Mail}
            error={fpErrors.email?.message}
            {...fpRegister('email')}
          />

          <Input
            label="National ID"
            type="text"
            id="fpNationalId"
            placeholder="14-digit national ID number"
            inputMode="numeric"
            maxLength={14}
            icon={CreditCard}
            error={fpErrors.idNumber?.message}
            {...fpRegister('idNumber')}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isSendingReset}
            loadingText="Verifying…"
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Send Reset Code
          </Button>
          {securityBadge}
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Forgot — Step 2: OTP
  // ─────────────────────────────────────────────────────────────
  if (view === 'forgot-otp') {
    const maskedFpEmail = fpEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    return (
      <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8 relative overflow-x-hidden overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-[400px] my-auto">
          {backBtn('Back', () => setView('forgot-email'))}
          <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
            <Mail className="w-3 h-3" /> Reset Code
          </div>
          <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">Check your email.</h1>
          <p className="text-[0.8rem] text-auth-text-light mb-6 leading-[1.55]">
            We sent a 6-digit reset code to <span className="font-semibold text-auth-text-mid">{maskedFpEmail}</span>
          </p>
          {otpInputRow(resetOtp, resetOtpRefs, handleResetOtpChange, handleResetOtpKeyDown, handleResetOtpPaste)}
          <Button onClick={handleVerifyResetOtp} className="w-full" isLoading={isVerifyingReset} loadingText="Verifying…" icon={<ArrowRight className="w-4 h-4" />}>
            Verify Code
          </Button>
          <div className="mt-4 text-center">
            <button
              onClick={handleResendResetOtp}
              disabled={resetCooldown > 0 || isResendingReset}
              className="inline-flex items-center gap-[6px] text-[0.79rem] text-auth-text-light hover:text-auth-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCw className={`w-3 h-3 ${isResendingReset ? 'animate-spin' : ''}`} />
              {resetCooldown > 0 ? `Resend in ${resetCooldown}s` : 'Resend code'}
            </button>
          </div>
          {securityBadge}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Forgot — Step 3: New password
  // ─────────────────────────────────────────────────────────────
  if (view === 'forgot-reset') {
    return (
      <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8 relative overflow-x-hidden overflow-y-auto scrollbar-hide">
        <form onSubmit={rpHandleSubmit(onSubmitReset)} className="w-full max-w-[400px] my-auto">
          {backBtn('Back', () => setView('forgot-otp'))}
          <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
            <KeyRound className="w-3 h-3" /> New Password
          </div>
          <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">Set new password.</h1>
          <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
            Choose a strong password — at least 12 characters.
          </p>

          <PasswordInput
            label="New password"
            id="rpNew"
            placeholder="Enter new password"
            autoComplete="new-password"
            error={rpErrors.newPassword?.message}
            {...rpRegister('newPassword')}
          />

          <PasswordInput
            label="Confirm new password"
            id="rpConfirm"
            placeholder="Confirm new password"
            autoComplete="new-password"
            error={rpErrors.confirmPassword?.message}
            {...rpRegister('confirmPassword')}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isResetting}
            loadingText="Resetting…"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Reset Password
          </Button>
          {securityBadge}
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: Login credentials step (default)
  // ─────────────────────────────────────────────────────────────
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
          <button
            type="button"
            onClick={() => setView('forgot-email')}
            className="text-[0.79rem] text-auth-text-light no-underline transition-colors duration-220 hover:text-auth-teal bg-transparent border-none cursor-pointer p-0"
          >
            Forgot password?
          </button>
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

        <div className="mt-5 md:hidden text-[0.85rem] text-auth-text-mid text-center">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-auth-teal font-bold hover:underline cursor-pointer transition-colors"
          >
            Create one here
          </button>
        </div>

        {securityBadge}
      </form>
    </div>
  );
};

export default Login;
