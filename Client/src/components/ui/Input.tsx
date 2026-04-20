import React, { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon: Icon, error, containerClassName, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={cn('w-full mb-3 text-left group', error ? 'has-error' : '', containerClassName)}>
        <label 
          htmlFor={inputId} 
          className={cn(
            'block text-[0.64rem] font-bold tracking-[0.7px] uppercase mb-[6px] transition-colors duration-220',
            error ? 'text-auth-red' : 'text-auth-text-light group-focus-within:text-auth-teal'
          )}
        >
          {label}
        </label>
        
        <div className="relative flex items-center">
          {Icon && (
            <Icon 
              className={cn(
                'absolute left-[15px] z-[2] w-[14px] h-[14px] transition-colors duration-220 pointer-events-none',
                error ? 'text-auth-red' : 'text-auth-text-light group-focus-within:text-auth-teal'
              )} 
            />
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-[48px] px-[46px] bg-auth-input border-[1.5px] border-auth-border rounded-[13px] text-auth-text-dark font-b text-[0.9rem] font-normal outline-none transition-all duration-220 appearance-none',
              'placeholder:text-auth-text-light placeholder:font-light',
              'focus:bg-white focus:border-auth-teal focus:shadow-[0_0_0_3.5px_rgba(16,185,129,0.09),0_2px_8px_rgba(16,185,129,0.1)]',
              error && 'border-auth-red bg-auth-red-dim focus:border-auth-red focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
              !Icon && 'pl-4',
              className
            )}
            {...props}
          />
          
          {/* For date inputs, we need the dropdown icon */}
          {props.type === 'date' && (
            <div className={cn(
              "absolute right-[14px] z-[1] w-[14px] h-[14px] pointer-events-none transition-colors duration-220",
              error ? 'text-auth-red' : 'text-auth-text-light group-focus-within:text-auth-teal'
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          )}
        </div>
        
        <div 
          className={cn(
            "text-[0.67rem] text-auth-red font-medium pl-[2px] block transition-all duration-300 overflow-hidden",
            error ? "max-h-[24px] opacity-100 mt-[5px]" : "max-h-0 opacity-0 mt-0"
          )}
        >
          {error}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
