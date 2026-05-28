import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { PenLine, RotateCcw, Keyboard, Edit2 } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string | null) => void;
  signatureData: string | null;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, signatureData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  
  const [isEmpty, setIsEmpty] = useState(true);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width === 0) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    // Set drawing style
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctxRef.current = ctx;

    // If there's existing signature data, draw it
    if (signatureData && isEmpty && mode === 'draw') {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setIsEmpty(false);
      };
      img.src = signatureData;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Typed Signature Changes
  useEffect(() => {
    if (mode === 'type') {
      if (typedName.trim()) {
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvasRef.current!.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.font = 'italic 36px "Caveat", "Dancing Script", "Brush Script MT", cursive';
          ctx.fillStyle = '#1a1a2e';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(typedName, rect.width / 2, rect.height / 2 - 8);
          
          setIsEmpty(false);
          onSignatureChange(canvas.toDataURL('image/png'));
        }
      } else {
        setIsEmpty(true);
        onSignatureChange(null);
      }
    }
  }, [typedName, mode, onSignatureChange]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    e.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'draw') return;
    e.preventDefault();
    if (!isDrawingRef.current) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const handleMouseUp = () => {
    if (mode !== 'draw') return;
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export signature as data URL
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Re-apply stroke style after clearing
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      setTypedName('');
    }

    setIsEmpty(true);
    onSignatureChange(null);
  };

  const switchMode = (newMode: 'draw' | 'type') => {
    if (mode === newMode) return;
    setMode(newMode);
    
    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    setTypedName('');
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="w-full mb-[4px]">
      <div className="flex items-center justify-between mb-[8px]">
        <div className="flex items-center gap-[6px]">
          <PenLine className="w-[13px] h-[13px] text-auth-teal" />
          <span className="text-[0.72rem] font-bold text-auth-text-mid">
            Digital Signature
          </span>
          <span className="text-[0.6rem] text-auth-text-light">
            (Required)
          </span>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={clearSignature}
            className="inline-flex items-center gap-[4px] bg-transparent border-none text-auth-text-light text-[0.64rem] font-semibold cursor-pointer p-0 transition-colors duration-200 hover:text-auth-red"
          >
            <RotateCcw className="w-[10px] h-[10px]" />
            Clear
          </button>
        )}
      </div>

      <div className="flex bg-[rgba(16,185,129,0.05)] rounded-[8px] p-[3px] mb-[8px]">
        <button 
          onClick={() => switchMode('draw')}
          className={cn("flex-1 flex items-center justify-center gap-[6px] text-[0.65rem] font-bold rounded-[6px] py-[6px] transition-all", mode === 'draw' ? "bg-white shadow-sm text-auth-teal" : "text-auth-text-light hover:text-auth-text-mid")}
          type="button"
        >
          <Edit2 className="w-[11px] h-[11px]" /> Draw
        </button>
        <button 
          onClick={() => switchMode('type')}
          className={cn("flex-1 flex items-center justify-center gap-[6px] text-[0.65rem] font-bold rounded-[6px] py-[6px] transition-all", mode === 'type' ? "bg-white shadow-sm text-auth-teal" : "text-auth-text-light hover:text-auth-text-mid")}
          type="button"
        >
          <Keyboard className="w-[11px] h-[11px]" /> Type
        </button>
      </div>

      <div
        className={cn(
          "relative bg-auth-input border-[1.5px] rounded-[13px] overflow-hidden transition-all duration-220",
          isEmpty
            ? "border-auth-border hover:border-auth-teal"
            : "border-auth-teal bg-[rgba(16,185,129,0.02)]"
        )}
      >
        {/* Placeholder text shown when canvas is empty in draw mode */}
        {isEmpty && mode === 'draw' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[1] select-none">
            <PenLine className="w-[22px] h-[22px] text-auth-text-light opacity-30 mb-[6px]" />
            <span className="text-[0.69rem] text-auth-text-light opacity-50 font-medium">
              Draw your signature here
            </span>
          </div>
        )}

        {/* Type input overlay */}
        {mode === 'type' && (
          <div className="absolute inset-0 z-[3] flex items-center justify-center px-[20px]">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Type your full name"
              className="w-full h-full bg-transparent border-none text-center outline-none text-[#1a1a2e] font-[cursive] text-[32px] pb-[8px]"
              style={{ fontFamily: '"Caveat", "Dancing Script", "Brush Script MT", cursive' }}
              spellCheck={false}
              autoFocus
            />
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={cn("w-full relative z-[2]", mode === 'draw' ? "cursor-crosshair opacity-100" : "opacity-0 pointer-events-none")}
          style={{ height: '90px', touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        />

        {/* Signature line */}
        <div className="absolute bottom-[24px] left-[16px] right-[16px] h-[1px] bg-auth-border opacity-40 z-[1]" />
        <div className="absolute bottom-[10px] left-[16px] z-[1]">
          <span className="text-[0.55rem] text-auth-text-light opacity-40 font-medium tracking-[0.5px] uppercase">
            Sign above
          </span>
        </div>
      </div>
    </div>
  );
};
