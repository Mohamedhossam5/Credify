import React from 'react';
import { cn } from '../../../lib/utils';
import { useKycFlow } from '../../../hooks/useKycFlow';
import { KycProgressSteps } from './KycProgressSteps';
import { KycResultApproved } from './KycResultApproved';
import { KycResultRejected } from './KycResultRejected';

export const KycFlow: React.FC = () => {
  const { kycState, progress, activeStep, redirectCount, retryKyc, abortKyc } = useKycFlow();

  const kycVisible = kycState !== 'idle';

  return (
    <div className={cn(
      "absolute top-0 left-0 w-full h-full z-[8] bg-auth-form flex items-stretch transition-all duration-[0.55s] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      kycVisible ? "opacity-100 pointer-events-auto translate-x-0 scale-100" : "opacity-0 pointer-events-none translate-x-full scale-[0.97]"
    )}>
      {kycState === 'processing' && (
        <KycProgressSteps progress={progress} activeStep={activeStep} />
      )}

      {kycState === 'approved' && (
        <KycResultApproved redirectCount={redirectCount} />
      )}

      {kycState === 'rejected' && (
        <KycResultRejected onRetry={retryKyc} onAbort={abortKyc} />
      )}
    </div>
  );
};
