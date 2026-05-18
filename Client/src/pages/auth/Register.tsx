import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RegisterStep1 } from '../../components/register/RegisterStep1';
import { RegisterStep2 } from '../../components/register/RegisterStep2';
import { PhoneVerifyStep } from '../../components/register/PhoneVerifyStep';
import { EmailVerifyStep } from '../../components/register/EmailVerifyStep';
import { RegisterStep3 } from '../../components/register/RegisterStep3';
import { KycFlow } from '../../components/register/kyc/KycFlow';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [ready, setReady] = useState(false);

  // On mount, check the real KYC status from the server so that a page refresh
  // sends users to the correct screen instead of resetting to form step 1.
  useEffect(() => {
    // If user explicitly clicked "Re-submit Documents", skip the redirect
    // and show the document upload form directly.
    const fromState = (location.state as any)?.resubmitting;
    const fromStore = useAuthStore.getState().resubmitting;
    if (fromState || fromStore) {
      useAuthStore.getState().setResubmitting(false);
      setReady(true);
      return;
    }

    if (!isAuthenticated) {
      setReady(true);
      return;
    }

    const checkStatus = async () => {
      try {
        const { user } = await authService.getMe();
        useAuthStore.getState().setUser(user);

        switch (user.kycStatus) {
          case 'REJECTED':
            navigate('/rejected', { replace: true });
            return;
          case 'PENDING_ADMIN_REVIEW':
            navigate('/pending-approval', { replace: true });
            return;
          case 'APPROVED':
            navigate('/dashboard', { replace: true });
            return;
          default: {
            // PENDING — figure out which onboarding step they need
            if (!user.phoneVerified) {
              useAuthStore.getState().setCurrentStep(3 as any);
            } else if (!user.emailVerified) {
              useAuthStore.getState().setCurrentStep(4 as any);
            } else {
              useAuthStore.getState().setCurrentStep(5 as any);
            }
            break;
          }
        }
      } catch {
        // If the call fails (e.g. no token), just show the form normally
      }
      setReady(true);
    };

    checkStatus();
  }, [isAuthenticated, navigate, location.state]);

  // Show a small loading state while we check server status
  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-[2.5px] border-[rgba(16,185,129,0.2)] border-t-[#10b981] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-6 md:px-12 h-full py-[34px] relative overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-[400px]">
        <RegisterStep1 />
        <RegisterStep2 />
        <PhoneVerifyStep />
        <EmailVerifyStep />
        <RegisterStep3 />
      </div>
      <KycFlow />
    </div>
  );
};

export default Register;

