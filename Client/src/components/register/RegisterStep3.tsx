import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, IdCard, Smile, FileText, ArrowLeft, ShieldHalf } from 'lucide-react';
import { Button } from '../ui/Button';
import { UploadCard } from './UploadCard';
import { CameraModal } from './CameraModal';
import { SignaturePad } from './SignaturePad';
import { useUploads } from '../../hooks/useUploads';
import { useCamera } from '../../hooks/useCamera';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

export const RegisterStep3: React.FC = () => {
  const { currentStep, setCurrentStep, setKycState } = useAuthStore();
  const { uploads, handleUpload, removeUpload, setSelfie } = useUploads();
  const { isCamOpen, camCaptured, videoRef, startCam, closeCam, capturePhoto, resetCapture } = useCamera();
  const [docError, setDocError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // KYC docs is now step 5 (after phone + email verify)
  if (currentStep !== 5) return null;

  const usePhoto = () => {
    if (camCaptured) {
      setSelfie(camCaptured);
      toast.success('Selfie captured!');
      closeCam();
    }
  };

  // Convert a data URL to a File object
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(data);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  };

  const handleSubmitKyc = async () => {
    if (!uploads.ucF || !uploads.ucB || !uploads.ucS || !uploads.ucL) {
      setDocError("Please complete all 4 identity verifications to proceed.");
      toast.error("Missing documents");
      return;
    }
    if (!signatureData) {
      setDocError("Please provide your digital signature to proceed.");
      toast.error("Signature required");
      return;
    }
    setDocError(null);
    setIsSubmitting(true);

    try {
      // 1. Upload national ID (front + back)
      const idForm = new FormData();
      idForm.append('front', dataUrlToFile(uploads.ucF, 'id-front.jpg'));
      idForm.append('back', dataUrlToFile(uploads.ucB, 'id-back.jpg'));
      await api.post('/kyc/upload/national-id', idForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 2. Upload face selfie
      const selfieForm = new FormData();
      selfieForm.append('selfie', dataUrlToFile(uploads.ucS, 'selfie.jpg'));
      await api.post('/kyc/upload/face-selfie', selfieForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 3. Upload proof of address
      const addrForm = new FormData();
      addrForm.append('document', dataUrlToFile(uploads.ucL, 'proof-of-address.jpg'));
      await api.post('/kyc/upload/proof-of-address', addrForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 4. Upload digital signature
      const sigForm = new FormData();
      sigForm.append('signature', dataUrlToFile(signatureData, 'digital-signature.png'));
      await api.post('/kyc/upload/digital-signature', sigForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 5. Trigger verification
      await api.post('/kyc/verify');

      toast.success('Documents submitted for review!');
      setKycState('processing');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full animate-fadein">
      <button onClick={() => setCurrentStep(4)} className="inline-flex items-center gap-[7px] bg-transparent border-none text-auth-text-light font-b text-[0.77rem] font-medium cursor-pointer p-0 mb-[14px] transition-colors duration-220 hover:text-auth-teal group">
        <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-[3px]" /> Email verification
      </button>

      <div className="text-center mb-[12px]">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[5px] flex items-center justify-center gap-[6px]">
          <Camera className="w-3 h-3" /> KYC
        </div>
        <h1 className="font-h text-[1.55rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[4px]">
          Verify identity.
        </h1>
        <p className="text-[0.78rem] text-auth-text-light mb-[14px] leading-[1.55]">
          Final step — upload documents & sign.
        </p>
      </div>

      <div className="flex items-center justify-center gap-[5px] mb-[14px]">
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px]" />
        <span className="text-[0.65rem] text-auth-text-light ml-[4px]">Final Step</span>
      </div>

      <div className="grid grid-cols-2 gap-[8px] w-full mb-[10px]">
        <UploadCard id="ucF" label="National ID" sub="Front side" icon={IdCard} isSel={!!uploads.ucF} fileData={uploads.ucF} onUpload={handleUpload} onRemove={(e) => { e.stopPropagation(); removeUpload('ucF'); }} />
        <UploadCard id="ucB" label="National ID" sub="Back side" icon={IdCard} isSel={!!uploads.ucB} fileData={uploads.ucB} onUpload={handleUpload} onRemove={(e) => { e.stopPropagation(); removeUpload('ucB'); }} />
        <UploadCard id="ucS" label="Live Selfie" sub="Facial verify" icon={Smile} type="cam" isSel={!!uploads.ucS} fileData={uploads.ucS} onCamOpen={startCam} onRemove={(e) => { e.stopPropagation(); removeUpload('ucS'); }} />
        <UploadCard id="ucL" label="Utility Bill" sub="Proof of address" icon={FileText} isSel={!!uploads.ucL} fileData={uploads.ucL} onUpload={handleUpload} onRemove={(e) => { e.stopPropagation(); removeUpload('ucL'); }} />

        {/* Digital Signature — spans full width inside the grid */}
        <div className="col-span-2">
          <SignaturePad
            onSignatureChange={setSignatureData}
            signatureData={signatureData}
          />
        </div>
      </div>

      {docError && (
        <div className="text-[0.67rem] text-auth-red mb-[8px] font-medium block text-center animate-fadein">
          {docError}
        </div>
      )}

      <Button onClick={handleSubmitKyc} className="w-full" isLoading={isSubmitting} loadingText="Uploading…">
        Submit Application
      </Button>
      
      <div className="mt-[10px] text-[0.69rem] text-auth-text-light flex items-center justify-center gap-[7px] flex-wrap">
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
