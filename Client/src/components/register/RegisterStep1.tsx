import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, IdCard, ArrowRight } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useRegisterStep1 } from '../../hooks/useRegisterStep1';
import { useAuthStore } from '../../store/authStore';

export const RegisterStep1: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, register, handleSubmit, errors, focusedError, onSubmit, onError } = useRegisterStep1();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setCurrentStep = useAuthStore((s) => s.setCurrentStep);

  if (currentStep !== 1) return null;

  // Already-registered user: let them skip forward to the appropriate step
  const canSkip = isAuthenticated && !!user;
  const skipToStep = () => {
    if (!user) return;
    if (!user.phoneVerified) setCurrentStep(3 as any);
    else if (!user.emailVerified) setCurrentStep(4 as any);
    else setCurrentStep(5 as any);
  };

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
        <div className="flex flex-col md:flex-row md:gap-[11px] w-full">
          <Input
            label="First name"
            placeholder="Ahmed"
            icon={User}
            error={focusedError === 'firstName' ? errors.firstName?.message : undefined}
            {...register('firstName')}
          />
          <Input
            label="Middle name"
            placeholder="Ali"
            icon={User}
            error={focusedError === 'middleName' ? errors.middleName?.message : undefined}
            {...register('middleName')}
          />
        </div>
        
        <Input
          label="Last name"
          placeholder="Khalil"
          icon={User}
          error={focusedError === 'lastName' ? errors.lastName?.message : undefined}
          {...register('lastName')}
        />
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
          label="National ID"
          placeholder="29xxxxxxxxxxxxxx"
          maxLength={14}
          icon={IdCard}
          error={focusedError === 'nationalId' ? errors.nationalId?.message : undefined}
          {...register('nationalId')}
        />

        <div className="w-full mb-2 text-left group">
          <label className="block text-[0.64rem] font-bold tracking-[0.7px] uppercase mb-[6px] transition-colors duration-220 text-auth-text-light group-focus-within:text-auth-teal">
            Gender
          </label>
          <div className="flex gap-[11px] w-full">
            <label className="flex-1 cursor-not-allowed opacity-80">
              <input type="radio" value="male" className="peer sr-only" disabled {...register('gender')} />
              <div className={`h-[48px] rounded-[13px] border-[1.5px] bg-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-auth-text-light font-medium text-[0.9rem] ${errors.gender
                  ? 'border-auth-red bg-auth-red-dim text-auth-red'
                  : 'border-auth-border hover:border-auth-teal/40 hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)]'
                } peer-checked:border-auth-teal peer-checked:bg-auth-teal/5 peer-checked:text-auth-teal peer-checked:font-semibold peer-checked:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]`}>
                Male
              </div>
            </label>
            <label className="flex-1 cursor-not-allowed opacity-80">
              <input type="radio" value="female" className="peer sr-only" disabled {...register('gender')} />
              <div className={`h-[48px] rounded-[13px] border-[1.5px] bg-white transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-auth-text-light font-medium text-[0.9rem] ${errors.gender
                  ? 'border-auth-red bg-auth-red-dim text-auth-red'
                  : 'border-auth-border hover:border-auth-teal/40 hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)]'
                } peer-checked:border-auth-teal peer-checked:bg-auth-teal/5 peer-checked:text-auth-teal peer-checked:font-semibold peer-checked:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]`}>
                Female
              </div>
            </label>
          </div>
          <div className={`text-[0.67rem] text-auth-red font-medium pl-[2px] block transition-all duration-300 overflow-hidden ${errors.gender ? "max-h-[24px] opacity-100 mt-[5px]" : "max-h-0 opacity-0 mt-0"}`}>
            {errors.gender?.message as string}
          </div>
        </div>

        {canSkip ? (
          <button
            type="button"
            onClick={skipToStep}
            className="w-full flex items-center justify-center gap-2 py-[13px] px-6 rounded-[13px] bg-gradient-to-r from-auth-teal to-auth-blue text-white text-[0.85rem] font-bold border-none cursor-pointer transition-all duration-200 hover:shadow-[0_6px_24px_rgba(16,185,129,0.25)] hover:translate-y-[-1px] active:translate-y-0 mt-2"
          >
            Skip to Documents
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        ) : (
          <Button type="submit" className="w-full mt-2" icon={<ArrowRight className="w-4 h-4 ml-1" />}>
            Continue
          </Button>
        )}

        <div className="mt-5 md:hidden text-[0.85rem] text-auth-text-mid text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-auth-teal font-bold hover:underline cursor-pointer transition-colors"
          >
            Sign in here
          </button>
        </div>
      </form>
    </div>
  );
};
