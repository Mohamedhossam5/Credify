import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export const useKycFlow = () => {
  const { kycState, setKycState, reset } = useAuthStore();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (kycState === 'processing') {
      runSequence();
    }
  }, [kycState]);

  const runSequence = async () => {
    // Brief uploading animation, then go straight to pending
    const targets = [40, 80, 100];
    const durations = [800, 600, 400];
    
    for (let i = 0; i < targets.length; i++) {
      setActiveStep(i);
      await animateProgress(i === 0 ? 0 : targets[i-1], targets[i], durations[i]);
    }

    // Documents are uploaded — go to pending admin approval
    setKycState('pending');
    toast.success('Documents submitted! Waiting for admin approval.');
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
    retryKyc,
    abortKyc
  };
};
