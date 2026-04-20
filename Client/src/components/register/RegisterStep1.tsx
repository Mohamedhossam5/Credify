import React from 'react';
import { User, Mail, Phone, CalendarDays, ArrowRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useRegisterStep1 } from '../../hooks/useRegisterStep1';

export const RegisterStep1: React.FC = () => {
  const { currentStep, register, handleSubmit, errors, focusedError, onSubmit, onError } = useRegisterStep1();

  if (currentStep !== 1) return null;

  return (
    <div className="w-full animate-fadein py-6 md:py-10">
      <div className="text-center mb-[18px]">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
          <User className="w-3 h-3" /> New account
        </div>
        <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
          Personal details.
        </h1>
        <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
          Step 1 of 3 — the basics.
        </p>
      </div>

      <div className="flex items-center justify-center gap-[5px] mb-[20px]">
        <div className="h-[3px] rounded-[2px] bg-auth-teal w-[36px] transition-all duration-[0.35s] ease-[cubic-bezier(0.34,1.56,0.64,1)]"></div>
        <div className="h-[3px] rounded-[2px] bg-auth-border w-[20px] transition-all duration-[0.35s]"></div>
        <div className="h-[3px] rounded-[2px] bg-auth-border w-[20px] transition-all duration-[0.35s]"></div>
        <span className="text-[0.65rem] text-auth-text-light ml-[4px]">Step 1 of 3</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="flex gap-[11px] w-full">
          <Input 
            label="First name" 
            placeholder="Ahmed" 
            icon={User} 
            error={focusedError === 'firstName' ? errors.firstName?.message : undefined} 
            {...register('firstName')} 
          />
          <Input 
            label="Last name" 
            placeholder="Khalil" 
            icon={User} 
            error={focusedError === 'lastName' ? errors.lastName?.message : undefined} 
            {...register('lastName')} 
          />
        </div>
        <Input 
          label="Email address" 
          type="email" 
          placeholder="you@example.com" 
          icon={Mail} 
          error={focusedError === 'email' ? errors.email?.message : undefined} 
          {...register('email')} 
        />
        <Input 
          label="Phone number" 
          type="tel" 
          placeholder="+201000000000" 
          icon={Phone} 
          error={focusedError === 'phone' ? errors.phone?.message : undefined} 
          {...register('phone')} 
        />
        <Input 
          label="Date of birth" 
          type="date" 
          icon={CalendarDays} 
          error={focusedError === 'dob' ? errors.dob?.message : undefined} 
          {...register('dob')} 
        />
        
        <Button type="submit" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
          Continue
        </Button>
      </form>
    </div>
  );
};
