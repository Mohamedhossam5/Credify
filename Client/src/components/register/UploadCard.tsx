import React from 'react';
import { cn } from '../../lib/utils';
import { CircleCheck, X } from 'lucide-react';

interface UploadCardProps {
  id: string;
  label: string;
  sub: string;
  icon: React.ElementType;
  type?: 'file' | 'cam';
  isSel: boolean;
  fileData: string | null;
  onRemove: (e: React.MouseEvent) => void;
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onCamOpen?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ id, label, sub, icon: Icon, type = 'file', isSel, fileData, onRemove, onUpload, onCamOpen }) => {
  return (
    <div className="relative w-full h-full group">
      <label 
        className={cn(
          "bg-auth-input border-[1.5px] border-auth-border rounded-[13px] p-[16px_10px] cursor-pointer transition-all duration-220 flex flex-col items-center justify-center text-center gap-[5px] relative overflow-hidden min-h-[106px] h-full group-hover:border-auth-teal group-hover:bg-auth-teal-dim group-hover:-translate-y-[2px] group-hover:shadow-[0_6px_18px_rgba(16,185,129,0.11)]",
          isSel && "border-auth-teal bg-[rgba(16,185,129,0.05)]"
        )}
        onClick={(e) => {
          if (type === 'cam' && !isSel && onCamOpen) {
            e.preventDefault();
            onCamOpen();
          } else if (isSel) {
            e.preventDefault(); // prevent file dialog if already selected, user must click X to remove
          }
        }}
      >
        {type === 'file' && onUpload && <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => onUpload(e, id)} disabled={isSel} />}
        
        <CircleCheck className={cn("absolute top-[7px] right-[8px] text-auth-teal w-[12px] h-[12px] transition-all duration-[0.28s] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-[2]", isSel ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
        
        {isSel && fileData ? (
          <img src={fileData} alt="" className="absolute inset-0 w-full h-full object-cover rounded-[11px]" />
        ) : (
          <>
            <Icon className="w-[20px] h-[20px] text-auth-text-light transition-colors duration-220 group-hover:text-auth-teal" />
            <span className="text-[0.69rem] font-bold text-auth-text-mid">{label}</span>
            <span className="text-[0.59rem] text-auth-text-light">{sub}</span>
          </>
        )}
      </label>

      {isSel && (
        <button 
          type="button"
          onClick={onRemove}
          className="absolute -top-[6px] -right-[6px] w-[22px] h-[22px] bg-white border border-auth-border text-auth-text-dark rounded-full flex items-center justify-center z-[5] shadow-sm transition-all duration-220 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 hover:!bg-auth-red hover:!text-white hover:!border-auth-red"
          aria-label={`Remove ${label}`}
        >
          <X className="w-[12px] h-[12px]" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};
