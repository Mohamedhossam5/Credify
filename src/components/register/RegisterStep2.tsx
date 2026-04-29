import React, { useMemo } from 'react';
import { ShieldHalf, MapPin, IdCard, ArrowRight, ArrowLeft, CalendarDays } from 'lucide-react';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';
import { useRegisterStep2 } from '../../hooks/useRegisterStep2';

export const RegisterStep2: React.FC = () => {
  const { currentStep, setCurrentStep, register, handleSubmit, errors, focusedError, onSubmit, onError, watch } = useRegisterStep2();

  const passwordValue = watch('password') || '';

  const pwScore = useMemo(() => {
    if (!passwordValue) return 0;
    let s = 0;
    if (passwordValue.length >= 12 && passwordValue.length <= 64) s += 1;
    if (/[A-Z]/.test(passwordValue)) s += 1;
    if (/[a-z]/.test(passwordValue)) s += 1;
    if (/[0-9]/.test(passwordValue)) s += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) s += 1;
    return s;
  }, [passwordValue]);

  if (currentStep !== 2) return null;

  const strengthColor = pwScore === 0 ? 'bg-transparent' : pwScore <= 2 ? 'bg-auth-red' : pwScore <= 4 ? 'bg-amber-400' : 'bg-auth-teal';
  const strengthLabel = pwScore === 0 ? '' : pwScore <= 2 ? 'Weak' : pwScore <= 4 ? 'Medium' : 'Strong';
  const strengthTextColor = pwScore === 0 ? 'text-transparent' : pwScore <= 2 ? 'text-auth-red' : pwScore <= 4 ? 'text-amber-500' : 'text-auth-teal';

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

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <Input label="National ID" placeholder="29xxxxxxxxxxxxxx" maxLength={14} icon={IdCard} error={focusedError === 'nationalId' ? errors.nationalId?.message : undefined} {...register('nationalId')} />
        <Input label="Current address" placeholder="123 Street, Cairo" icon={MapPin} error={focusedError === 'address' ? errors.address?.message : undefined} {...register('address')} />
        <Input
          label="Date of birth"
          type="date"
          icon={CalendarDays}
          error={focusedError === 'dob' ? errors.dob?.message : undefined}
          {...register('dob')}
        />

        <div className="relative mb-3">
          <PasswordInput label="Password" placeholder="Min. 12 characters" error={focusedError === 'password' ? errors.password?.message : undefined} containerClassName="mb-1" {...register('password')} />
          <div className="flex items-center gap-[8px] h-[14px] mt-1 px-1">
            <div className="flex-1 h-[4px] bg-auth-border/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthColor}`}
                style={{ width: `${(pwScore / 5) * 100}%` }}
              />
            </div>
            <span className={`text-[0.6rem] font-bold uppercase tracking-wider w-[45px] text-right transition-colors duration-300 ${strengthTextColor}`}>
              {strengthLabel}
            </span>
          </div>
        </div>
        <PasswordInput label="Confirm password" placeholder="Repeat password" error={focusedError === 'confirmPassword' ? errors.confirmPassword?.message : undefined} {...register('confirmPassword')} />

        <Button type="submit" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
          Continue
        </Button>
      </form>
    </div>
  );
};
