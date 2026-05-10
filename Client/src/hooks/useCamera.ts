import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export const useCamera = () => {
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const [camCaptured, setCamCaptured] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCam = async () => {
    setCamCaptured(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 } } });
      setCamStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsCamOpen(true);
    } catch {
      toast.error('Camera access denied.');
      setIsCamOpen(false);
    }
  };

  const stopCam = () => {
    if (camStream) {
      camStream.getTracks().forEach(t => t.stop());
      setCamStream(null);
    }
  };

  const closeCam = () => {
    stopCam();
    setIsCamOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const vid = videoRef.current;
      const cvs = document.createElement('canvas');
      cvs.width = vid.videoWidth || 640;
      cvs.height = vid.videoHeight || 480;
      cvs.getContext('2d')?.drawImage(vid, 0, 0);
      setCamCaptured(cvs.toDataURL('image/jpeg', 0.9));
      stopCam();
    }
  };

  const resetCapture = () => {
    startCam();
  };

  return {
    isCamOpen,
    setIsCamOpen,
    camCaptured,
    setCamCaptured,
    videoRef,
    startCam,
    closeCam,
    capturePhoto,
    resetCapture
  };
};
