import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FloatingSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /** Optional explicit width. Defaults to 'auto' */
  width?: string | number;
}

const FloatingSelect: React.FC<FloatingSelectProps> = ({ value, onChange, options, width = 'auto' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width, display: 'inline-block' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px 6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass)',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: '"Inter", sans-serif',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--teal)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glass-border)'; }}
      >
        {selected.label}
        <ChevronDown
          size={13}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: '140px',
            background: 'var(--floating-menu-bg, #ffffff)',
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 12px 32px -4px rgba(0,0,0,0.13)',
            padding: '6px',
            zIndex: 9999,
            animation: 'floatingMenuIn 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: opt.value === value ? 'rgba(14, 203, 203, 0.08)' : 'transparent',
                color: opt.value === value ? 'var(--teal, #0ecbcb)' : 'var(--floating-menu-text, #1e293b)',
                fontSize: '13px',
                fontWeight: opt.value === value ? 600 : 500,
                fontFamily: '"Inter", sans-serif',
                cursor: 'pointer',
                transition: 'background 0.12s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = opt.value === value ? 'rgba(14,203,203,0.08)' : 'transparent';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes floatingMenuIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        :root {
          --floating-menu-bg: #ffffff;
          --floating-menu-text: #1e293b;
        }
        [data-theme="dark"] {
          --floating-menu-bg: #1a2035;
          --floating-menu-text: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

export default FloatingSelect;
