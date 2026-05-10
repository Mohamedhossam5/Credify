import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export const useKycFlow = () => {
  const { kycState, setKycState, reset } = useAuthStore();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [redirectCount, setRedirectCount] = useState(3);

  const pollKycStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/kyc/status');
      return data.status as string;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (kycState === 'processing') {
      runSequence();
    }
  }, [kycState]);

  const runSequence = async () => {
    // Animate progress while polling the backend for status
    const targets = [28, 58, 82, 100];
    const durations = [1800, 1500, 1200, 900];
    
    for (let i = 0; i < targets.length; i++) {
      setActiveStep(i);
      await animateProgress(i === 0 ? 0 : targets[i-1], targets[i], durations[i]);
    }
    
    // Poll backend status for a while
    let attempts = 0;
    const maxAttempts = 15;
    let finalStatus: string | null = null;

    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000));
      finalStatus = await pollKycStatus();
      
      if (finalStatus && !['DOCUMENTS_UPLOADED', 'AI_VERIFICATION_IN_PROGRESS'].includes(finalStatus)) {
        break;
      }
      attempts++;
    }

    if (finalStatus === 'APPROVED') {
      setKycState('approved');
      toast.success('Identity verified — account approved!');
      startRedirect();
    } else if (finalStatus === 'REJECTED') {
      setKycState('rejected');
      toast.error('Verification could not be completed.');
    } else {
      // PENDING_ADMIN_REVIEW or timeout — treat as pending
      setKycState('approved');
      toast.success('Documents submitted! Your application is under review.');
      startRedirect();
    }
  };

  const animateProgress = (from: number, to: number, duration: number) => {
    return new Promise<void>(resolve => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setProgress(Math.round(from + (to - from) * ease));
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  };

  const startRedirect = () => {
    let timeLeft = 3000;
    const interval = setInterval(() => {
      timeLeft -= 40;
      const secs = Math.max(Math.ceil(timeLeft / 1000), 0);
      setRedirectCount(secs);
      if (timeLeft <= 0) {
        clearInterval(interval);
        reset();
        navigate('/login');
      }
    }, 40);
  };

  const retryKyc = () => {
    setKycState('idle');
  };

  const abortKyc = () => {
    reset();
    navigate('/login');
  };

  return {
    kycState,
    progress,
    activeStep,
    redirectCount,
    retryKyc,
    abortKyc
  };
};
