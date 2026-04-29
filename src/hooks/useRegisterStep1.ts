import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { registerStep1Schema, type RegisterStep1Data } from '../schemas/auth';

export const useRegisterStep1 = () => {
  const { currentStep, setCurrentStep, step1Data, setStep1Data } = useAuthStore();
  const [focusedError, setFocusedError] = useState<keyof RegisterStep1Data | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: step1Data || {},
    mode: 'onSubmit',
  });

  const onSubmit = (data: RegisterStep1Data) => {
    setFocusedError(null);
    setStep1Data(data);
    setCurrentStep(2);
  };

  const fieldOrder: (keyof RegisterStep1Data)[] = ['firstName', 'middleName', 'lastName', 'email', 'phone'];

  const onError = (errs: FieldErrors<RegisterStep1Data>) => {
    const firstError = fieldOrder.find(key => errs[key]);
    if (firstError) {
      setFocusedError(firstError);
    }
  };

  return {
    currentStep,
    register,
    handleSubmit,
    errors,
    focusedError,
    onSubmit,
    onError
  };
};
