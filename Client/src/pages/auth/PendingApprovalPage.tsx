import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import myImage from '../../assets/1.png';

const POLL_INTERVAL_MS = 5000;

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-auth-bg auth-bg flex items-center justify-center overflow-x-hidden overflow-y-auto font-b p-4 md:p-8">
      <div className="bg-auth-card backdrop-blur-[16px] rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_36px_90px_rgba(14,31,66,0.14),0_8px_28px_rgba(14,31,66,0.07)] w-[min(440px,95vw)] overflow-hidden">
        
        {/* Top accent bar */}
        <div className="h-[4px] w-full bg-gradient-to-r from-auth-teal to-auth-blue" />

        <div className="px-10 py-12 flex flex-col items-center text-center">
          {/* Logo */}
          <img src={myImage} alt="Credify" className="h-10 w-auto object-contain mb-8 opacity-80" />

          {/* Clock icon */}
          <div className="w-[72px] h-[72px] rounded-full bg-auth-teal-dim border-[1.5px] border-auth-teal/20 flex items-center justify-center mb-6">
            <Clock className="w-7 h-7 text-auth-teal" strokeWidth={2} />
          </div>

          {/* Title */}
          <h1 className="font-h text-[1.45rem] font-extrabold text-auth-text-dark tracking-[-0.5px] mb-2">
            Pending Approval
          </h1>
          <p className="text-[0.82rem] text-auth-text-light leading-[1.6] max-w-[300px] mb-8">
            Your documents have been submitted. An admin will review your application shortly.
          </p>

          {/* Status pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-auth-teal-dim mb-8">
            <span className="relative flex h-[7px] w-[7px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-auth-teal opacity-50" />
              <span className="relative inline-flex rounded-full h-[7px] w-[7px] bg-auth-teal" />
            </span>
            <span className="text-[0.72rem] font-semibold text-auth-teal tracking-[0.3px]">Under Review</span>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[0.8rem] font-medium text-auth-text-light hover:text-auth-text-dark transition-colors duration-200 cursor-pointer bg-transparent border-none p-0"
          >
            <LogOut className="w-[14px] h-[14px]" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
