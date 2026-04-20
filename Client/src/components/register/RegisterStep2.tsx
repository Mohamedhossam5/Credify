import React from 'react';
import { ShieldHalf, MapPin, IdCard, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';
import { useRegisterStep2 } from '../../hooks/useRegisterStep2';

export const RegisterStep2: React.FC = () => {
  const { currentStep, setCurrentStep, register, handleSubmit, errors, onSubmit } = useRegisterStep2();

  if (currentStep !== 2) return null;

  return (
    <div className="w-full animate-fadein">
      <button onClick={() => setCurrentStep(1)} className="inline-flex items-center gap-[7px] bg-transparent border-none text-auth-text-light font-b text-[0.77rem] font-medium cursor-pointer p-0 mb-[14px] transition-colors duration-220 hover:text-auth-teal group">
        <ArrowLeft className="w-3 h-3 transition-transform duration-200 group-hover:-translate-x-[3px]" /> Personal details
      </button>

      <div className="text-center mb-[18px]">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
          <ShieldHalf className="w-3 h-3" /> Security
        </div>
        <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
          Secure account.
        </h1>
        <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
          Step 2 of 3 — credentials.
        </p>
      </div>

      <div className="flex items-center justify-center gap-[5px] mb-[20px]">
        <div className="h-[3px] rounded-[2px] bg-[rgba(16,185,129,0.32)] w-[20px] transition-all duration-[0.35s]"></div>
        <div className="h-[3px] rounded-[2px] bg-auth-teal w-[36px] transition-all duration-[0.35s]"></div>
        <div className="h-[3px] rounded-[2px] bg-auth-border w-[20px] transition-all duration-[0.35s]"></div>
        <span className="text-[0.65rem] text-auth-text-light ml-[4px]">Step 2 of 3</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="National ID" placeholder="29xxxxxxxxxxxxxx" maxLength={14} icon={IdCard} error={errors.nationalId?.message} {...register('nationalId')} />
        <Input label="Current address" placeholder="123 Street, Cairo" icon={MapPin} error={errors.address?.message} {...register('address')} />
        <PasswordInput label="Password" placeholder="Min. 8 characters" error={errors.password?.message} {...register('password')} />
        <PasswordInput label="Confirm password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        
        <Button type="submit" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
          Continue
        </Button>
      </form>
    </div>
  );
};
