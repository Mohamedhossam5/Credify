import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// Design System: Define variants and sizes centrally
const buttonVariants = cva(
  "relative flex items-center justify-center gap-2 font-b font-semibold transition-all duration-220 overflow-hidden disabled:opacity-78 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "btn-auth bg-gradient-to-br from-auth-teal to-[#1a73e8] text-white shadow-[0_6px_22px_rgba(16,185,129,0.28)] hover:-translate-y-[1px] hover:shadow-[0_10px_30px_rgba(16,185,129,0.28)] border-none mt-1",
        outline: "bg-auth-input border-[1.5px] border-auth-border text-auth-text-mid hover:bg-white hover:border-auth-text-mid hover:text-auth-text-dark",
        danger: "btn-auth bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white shadow-[0_6px_18px_rgba(239,68,68,0.22)] hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(239,68,68,0.3)] border-none",
        ghost: "bg-transparent border-[1.5px] border-white/30 text-white hover:bg-white hover:text-auth-brand-top hover:border-white",
      },
      size: {
        default: "h-[50px] px-5 text-[0.92rem] rounded-[13px]",
        sm: "h-[46px] px-4 text-[0.88rem] rounded-[10px]",
        lg: "h-auto py-[13px] px-[42px] text-[0.88rem] rounded-[13px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, loadingText, icon, children, disabled, ...props }, ref) => {
    
    // Auto-resolve sizes to maintain strict backward compatibility with existing codebase
    let resolvedSize = size;
    if (!size) {
      if (variant === 'ghost') resolvedSize = 'lg';
      else if (variant === 'outline' || variant === 'danger') resolvedSize = 'sm';
      else resolvedSize = 'default';
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size: resolvedSize, className }))}
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

export { Button, buttonVariants };
