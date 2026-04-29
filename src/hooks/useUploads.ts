import { useState } from 'react';

export const useUploads = () => {
  const [uploads, setUploads] = useState<Record<string, string | null>>({
    ucF: null, ucB: null, ucS: null, ucL: null
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploads(prev => ({ ...prev, [id]: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUpload = (id: string) => {
    setUploads(prev => ({ ...prev, [id]: null }));
  };

  const setSelfie = (dataUrl: string) => {
    setUploads(prev => ({ ...prev, ucS: dataUrl }));
  };

  return {
    uploads,
    handleUpload,
    removeUpload,
    setSelfie
  };
};
