import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { registerStep2Schema, type RegisterStep2Data } from '../schemas/auth';

export const useRegisterStep2 = () => {
  const { currentStep, setCurrentStep, step2Data, setStep2Data } = useAuthStore();
  const [focusedError, setFocusedError] = useState<keyof RegisterStep2Data | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: step2Data || {},
    mode: 'onSubmit',
  });

  const onSubmit = (data: RegisterStep2Data) => {
    setFocusedError(null);
    setStep2Data(data);
    setCurrentStep(3);
  };

  const fieldOrder: (keyof RegisterStep2Data)[] = ['nationalId', 'address', 'dob', 'password', 'confirmPassword'];

  const onError = (errs: FieldErrors<RegisterStep2Data>) => {
    const firstError = fieldOrder.find(key => errs[key]);
    if (firstError) {
      setFocusedError(firstError);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    register,
    handleSubmit,
    watch,
    errors,
    focusedError,
    onSubmit,
    onError
  };
};
