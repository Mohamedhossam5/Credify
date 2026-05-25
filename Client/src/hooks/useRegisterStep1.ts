import { useState, useEffect } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { registerStep1Schema, type RegisterStep1Data } from '../schemas/auth';

export const useRegisterStep1 = () => {
  const { currentStep, setCurrentStep, step1Data, setStep1Data } = useAuthStore();
  const [focusedError, setFocusedError] = useState<keyof RegisterStep1Data | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterStep1Data>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: step1Data || {},
    mode: 'onChange',
  });

    useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'nationalId') {
        const id = value.nationalId;
        if (id && id.length >= 13) {
          const thirteenthDigit = parseInt(id[12], 10);
          const gender = thirteenthDigit % 2 !== 0 ? 'male' : 'female';
          setValue('gender', gender, { shouldValidate: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = (data: RegisterStep1Data) => {
    setFocusedError(null);
    setStep1Data(data);
    setCurrentStep(2);
  };

  const fieldOrder: (keyof RegisterStep1Data)[] = ['firstName', 'middleName', 'lastName', 'nationalId', 'email', 'phone', 'gender'];

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
