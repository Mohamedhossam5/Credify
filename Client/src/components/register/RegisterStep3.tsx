import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, IdCard, Smile, FileText, ArrowLeft, ShieldHalf } from 'lucide-react';
import { Button } from '../ui/Button';
import { UploadCard } from './UploadCard';
import { CameraModal } from './CameraModal';
import { useUploads } from '../../hooks/useUploads';
import { useCamera } from '../../hooks/useCamera';
import { useAuthStore } from '../../store/authStore';

export const RegisterStep3: React.FC = () => {
  const { currentStep, setCurrentStep, setKycState } = useAuthStore();
  const { uploads, handleUpload, removeUpload, setSelfie } = useUploads();
  const { isCamOpen, camCaptured, videoRef, startCam, closeCam, capturePhoto, resetCapture } = useCamera();
  const [docError, setDocError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (currentStep !== 3) return null;

  const usePhoto = () => {
    if (camCaptured) {
      setSelfie(camCaptured);
      toast.success('Selfie captured!');
      closeCam();
    }
  };

  const handleSubmitKyc = async () => {
    if (!uploads.ucF || !uploads.ucB || !uploads.ucS || !uploads.ucL) {
      setDocError("Please complete all 4 identity verifications to proceed.");
      toast.error("Missing documents");
      return;
    }
    setDocError(null);
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 480));
    setIsSubmitting(false);
    setKycState('processing');
  };

  return (
    <div className="w-full animate-fadein">
      <button onClick={() => setCurrentStep(2)} className="inline-flex items-center gap-[7px] bg-transparent border-none text-auth-text-light font-b text-[0.77rem] font-medium cursor-pointer p-0 mb-[14px] transition-colors duration-220 hover:text-auth-teal group">
        <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-[3px]" /> Security setup
      </button>

      <div className="text-center mb-[18px]">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
          <Camera className="w-3 h-3" /> KYC
        </div>
        <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
          Verify identity.
        </h1>
        <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
          Step 3 of 3 — upload documents.
        </p>
      </div>

      <div className="flex items-center justify-center gap-[5px] mb-[20px]">
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]"></div>
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]"></div>
        <div className="h-[3px] rounded-[2px] bg-auth-teal w-[36px] transition-all duration-[0.35s]"></div>
        <span className="text-[0.65rem] text-auth-text-light ml-[4px]">Step 3 of 3</span>
      </div>

      <div className="grid grid-cols-2 gap-[10px] w-full mb-[14px]">
        <UploadCard id="ucF" label="National ID" sub="Front side" icon={IdCard} isSel={!!uploads.ucF} fileData={uploads.ucF} onUpload={handleUpload} onRemove={(e) => { e.stopPropagation(); removeUpload('ucF'); }} />
        <UploadCard id="ucB" label="National ID" sub="Back side" icon={IdCard} isSel={!!uploads.ucB} fileData={uploads.ucB} onUpload={handleUpload} onRemove={(e) => { e.stopPropagation(); removeUpload('ucB'); }} />
        <UploadCard id="ucS" label="Live Selfie" sub="Facial verify" icon={Smile} type="cam" isSel={!!uploads.ucS} fileData={uploads.ucS} onCamOpen={startCam} onRemove={(e) => { e.stopPropagation(); removeUpload('ucS'); }} />
        <UploadCard id="ucL" label="Utility Bill" sub="Proof of address" icon={FileText} isSel={!!uploads.ucL} fileData={uploads.ucL} onUpload={handleUpload} onRemove={(e) => { e.stopPropagation(); removeUpload('ucL'); }} />
      </div>

      {docError && (
        <div className="text-[0.67rem] text-auth-red mb-[12px] font-medium block text-center animate-fadein">
          {docError}
        </div>
      )}

      <Button onClick={handleSubmitKyc} className="w-full" isLoading={isSubmitting} loadingText="Uploading…">
        Submit Application
      </Button>
      
      <div className="mt-[16px] text-[0.69rem] text-auth-text-light flex items-center justify-center gap-[7px] flex-wrap">
        <ShieldHalf className="text-auth-teal w-[12px] h-[12px]" /> Documents encrypted — never shared
      </div>

      <CameraModal 
        isCamOpen={isCamOpen} 
        closeCam={closeCam} 
        videoRef={videoRef} 
        camCaptured={camCaptured} 
        capturePhoto={capturePhoto} 
        resetCapture={resetCapture} 
        usePhoto={usePhoto} 
      />
    </div>
  );
};
