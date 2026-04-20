import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, loadingText, icon, children, disabled, ...props }, ref) => {
    
    const baseStyles = "relative flex items-center justify-center gap-2 h-[50px] px-5 font-b font-semibold rounded-[13px] text-[0.92rem] transition-all duration-220 overflow-hidden";
    
    const variants = {
      primary: "btn-auth bg-gradient-to-br from-auth-teal to-[#1a73e8] text-white shadow-[0_6px_22px_rgba(16,185,129,0.28)] hover:-translate-y-[1px] hover:shadow-[0_10px_30px_rgba(16,185,129,0.28)] border-none mt-1",
      outline: "bg-auth-input border-[1.5px] border-auth-border text-auth-text-mid hover:bg-white hover:border-auth-text-mid hover:text-auth-text-dark h-[46px]",
      danger: "btn-auth bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white shadow-[0_6px_18px_rgba(239,68,68,0.22)] hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(239,68,68,0.3)] border-none h-[46px]",
      ghost: "bg-transparent border-[1.5px] border-white/30 text-white hover:bg-white hover:text-auth-brand-top hover:border-white h-auto py-[13px] px-[42px] text-[0.88rem]"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          (disabled || isLoading) && "opacity-78 pointer-events-none",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="relative z-[1] flex items-center justify-center gap-2">
            <Loader2 className="w-[17px] h-[17px] animate-spin text-white" />
            {loadingText || 'Loading...'}
          </span>
        ) : (
          <span className="relative z-[1] flex items-center gap-2">
            {icon && icon}
            {children}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
