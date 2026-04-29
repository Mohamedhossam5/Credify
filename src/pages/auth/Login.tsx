import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ShieldHalf, CheckCircle2, LogIn } from 'lucide-react';
import { loginSchema, type LoginFormData } from '../../schemas/auth';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (_data: LoginFormData) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Welcome back! Redirecting...');
      login();
      navigate('/dashboard');
    }, 1600);
  };

  return (
    <div className="flex items-center justify-center flex-col px-6 md:px-12 h-full text-center py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[400px]">
        <div className="text-[0.64rem] font-bold tracking-[2.8px] uppercase text-auth-teal mb-[7px] flex items-center justify-center gap-[6px]">
          <div className="w-[8px] h-[8px] rounded-full bg-auth-teal"></div> Secure access
        </div>
        <h1 className="font-h text-[1.7rem] font-extrabold text-auth-text-dark tracking-[-0.8px] mb-[5px]">
          Welcome back.
        </h1>
        <p className="text-[0.8rem] text-auth-text-light mb-[22px] leading-[1.55]">
          Sign in to your digital vault.
        </p>

        <Input
          label="Email address"
          type="email"
          id="lEm"
          placeholder="you@example.com"
          autoComplete="email"

          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          id="lPw"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-between items-center w-full mb-4">
          <label className="flex items-center gap-[8px] text-[0.79rem] text-auth-text-mid cursor-pointer select-none group">
            <input type="checkbox" className="hidden peer" />
            <span className="w-[16px] h-[16px] rounded-[5px] border-[1.5px] border-auth-border bg-auth-input flex items-center justify-center text-[0.52rem] text-white transition-all duration-220 peer-checked:bg-auth-teal peer-checked:border-auth-teal peer-checked:after:content-['✓'] peer-checked:after:font-black flex-shrink-0"></span>
            Remember me
          </label>
          <a href="#" className="text-[0.79rem] text-auth-text-light no-underline transition-colors duration-220 hover:text-auth-teal">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full mt-1"
          isLoading={isLoading}
          loadingText="Authenticating…"
          icon={<LogIn className="w-4 h-4" />}
        >
          Sign In Securely
        </Button>

        <div className="mt-4 text-[0.69rem] text-auth-text-light flex items-center justify-center gap-[7px] flex-wrap">
          <ShieldHalf className="text-auth-teal w-[12px] h-[12px]" /> 256-bit TLS &nbsp;·&nbsp;
          <CheckCircle2 className="text-auth-teal w-[12px] h-[12px]" /> Systems operational
        </div>
      </form>
    </div>
  );
};

export default Login;
