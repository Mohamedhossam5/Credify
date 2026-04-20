import { useState, forwardRef } from 'react';
import { Input, type InputProps } from './Input';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    return (
      <div className="relative w-full">
        <Input
          icon={icon || Lock}
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className="pr-[48px]"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={`absolute right-0 top-[26px] bottom-0 w-[46px] flex items-center justify-center bg-transparent border-none cursor-pointer rounded-r-[13px] transition-colors duration-220 z-[3] ${
            props.error ? 'text-auth-red' : 'text-auth-text-light hover:text-auth-teal'
          }`}
          aria-label="Toggle password visibility"
        >
          <div className="relative w-[18px] h-[18px] flex items-center justify-center">
            {showPassword ? (
              <EyeOff className="w-full h-full animate-fadein" strokeWidth={1.7} />
            ) : (
              <Eye className="w-full h-full animate-fadein" strokeWidth={1.7} />
            )}
          </div>
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
