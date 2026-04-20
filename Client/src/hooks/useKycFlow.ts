import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { simulateKycResult } from '../services/kyc.service';

export const useKycFlow = () => {
  const { kycState, setKycState, reset } = useAuthStore();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [redirectCount, setRedirectCount] = useState(3);

  useEffect(() => {
    if (kycState === 'processing') {
      runSequence();
    }
  }, [kycState]);

  const runSequence = async () => {
    const targets = [28, 58, 82, 100];
    const durations = [1050, 950, 880, 650];
    
    for (let i = 0; i < targets.length; i++) {
      setActiveStep(i);
      await animateProgress(i === 0 ? 0 : targets[i-1], targets[i], durations[i]);
    }
    
    await new Promise(r => setTimeout(r, 380));
    
    if (simulateKycResult()) {
      setKycState('approved');
      toast.success('Identity verified — account approved!');
      startRedirect();
    } else {
      setKycState('rejected');
      toast.error('Verification could not be completed.');
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
