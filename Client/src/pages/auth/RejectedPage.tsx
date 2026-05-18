import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RotateCw, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import myImage from '../../assets/1.png';

const RejectedPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReason = async () => {
      try {
        const { data } = await api.get('/kyc/status');
        setReason(data.rejectionReason || null);
      } catch {
        setReason(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReason();
  }, []);

  const handleRedo = () => {
    const store = useAuthStore.getState();
    store.setResubmitting(true);
    store.setKycState('idle' as any);
    store.setCurrentStep(5 as any);
    navigate('/register', { state: { resubmitting: true } });
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-auth-bg auth-bg flex items-center justify-center overflow-x-hidden overflow-y-auto font-b p-4 md:p-8">
      <div className="bg-auth-card backdrop-blur-[16px] rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_36px_90px_rgba(14,31,66,0.14),0_8px_28px_rgba(14,31,66,0.07)] w-[min(440px,95vw)] overflow-hidden">
        
        {/* Top accent bar — red for rejection */}
        <div className="h-[4px] w-full bg-gradient-to-r from-auth-red to-[#f97316]" />

        <div className="px-10 py-12 flex flex-col items-center text-center">
          {/* Logo */}
          <img src={myImage} alt="Credify" className="h-10 w-auto object-contain mb-8 opacity-80" />

          {/* X icon */}
          <div className="w-[72px] h-[72px] rounded-full bg-auth-red-dim border-[1.5px] border-auth-red/20 flex items-center justify-center mb-6">
            <XCircle className="w-7 h-7 text-auth-red" strokeWidth={2} />
          </div>

          {/* Title */}
          <h1 className="font-h text-[1.45rem] font-extrabold text-auth-text-dark tracking-[-0.5px] mb-2">
            Application Rejected
          </h1>
          <p className="text-[0.82rem] text-auth-text-light leading-[1.6] max-w-[300px] mb-6">
            Your KYC application was not approved. Please review the reason below and re-submit.
          </p>

          {/* Rejection reason card */}
          {loading ? (
            <div className="w-full py-4 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-auth-border border-t-auth-red rounded-full animate-spin" />
            </div>
          ) : (
            <div className="w-full bg-auth-input border border-auth-border rounded-[14px] p-4 mb-8 text-left">
              <div className="text-[0.66rem] font-bold tracking-[1.5px] uppercase text-auth-text-light mb-2">
                Rejection Reason
              </div>
              <p className="text-[0.82rem] text-auth-text-dark leading-[1.55] font-medium">
                {reason || 'No specific reason was provided. Please re-submit your documents.'}
              </p>
            </div>
          )}

          {/* Redo button */}
          <button
            onClick={handleRedo}
            className="w-full flex items-center justify-center gap-2 py-[13px] px-6 rounded-[13px] bg-gradient-to-r from-auth-teal to-auth-blue text-white text-[0.85rem] font-bold border-none cursor-pointer transition-all duration-200 hover:shadow-[0_6px_24px_rgba(16,185,129,0.25)] hover:translate-y-[-1px] active:translate-y-0 mb-3"
          >
            <RotateCw className="w-4 h-4" />
            Re-submit Documents
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[0.8rem] font-medium text-auth-text-light hover:text-auth-text-dark transition-colors duration-200 cursor-pointer bg-transparent border-none p-0 mt-1"
          >
            <LogOut className="w-[14px] h-[14px]" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectedPage;
