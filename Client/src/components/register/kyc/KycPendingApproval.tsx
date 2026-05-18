import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogIn } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/auth.service';

const POLL_INTERVAL_MS = 5000;

export const KycPendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for KYC status changes so the user sees rejection/approval immediately
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { user } = await authService.getMe();
        // Keep local store in sync
        useAuthStore.getState().setUser(user);

        if (user.kycStatus === 'REJECTED') {
          navigate('/rejected', { replace: true });
        } else if (user.kycStatus === 'APPROVED') {
          navigate('/dashboard', { replace: true });
        }
      } catch {
        // Silently ignore — will retry on next interval
      }
    };

    // Check immediately on mount
    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigate]);

  const handleGoToLogin = () => {
    reset();
    navigate('/login');
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-[40px_44px] bg-auth-form z-10">
      {/* Clock icon */}
      <div className="w-[72px] h-[72px] rounded-full bg-auth-teal-dim border-[1.5px] border-auth-teal/20 flex items-center justify-center mb-6">
        <Clock className="w-7 h-7 text-auth-teal" strokeWidth={2} />
      </div>

      {/* Title */}
      <h2 className="font-h text-[1.3rem] font-extrabold text-auth-text-dark tracking-[-0.5px] mb-[6px]">
        Pending Approval
      </h2>
      <p className="text-[0.79rem] text-auth-text-light text-center leading-[1.6] max-w-[280px] mb-6">
        Your documents have been submitted. An admin will review your application shortly.
      </p>

      {/* Status pill */}
      <div className="flex items-center gap-2 px-4 py-[7px] rounded-full bg-auth-teal-dim mb-7">
        <span className="relative flex h-[7px] w-[7px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-auth-teal opacity-50" />
          <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-auth-teal" />
        </span>
        <span className="text-[0.7rem] font-semibold text-auth-teal tracking-[0.3px]">Under Review</span>
      </div>

      {/* Go to Login button */}
      <button
        onClick={handleGoToLogin}
        className="flex items-center gap-2 text-[0.8rem] font-semibold text-auth-teal hover:text-auth-text-dark transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
      >
        <LogIn className="w-[14px] h-[14px]" />
        Go to Login
      </button>
    </div>
  );
};
