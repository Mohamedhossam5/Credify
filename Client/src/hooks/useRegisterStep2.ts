import { useState } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { registerStep2Schema, type RegisterStep2Data } from '../schemas/auth';
import { authService, type RegisterPayload } from '../services/auth.service';

export const useRegisterStep2 = () => {
  const { currentStep, setCurrentStep, step1Data, step2Data, setStep2Data, setSession } = useAuthStore();
  const [focusedError, setFocusedError] = useState<keyof RegisterStep2Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: step2Data || {},
    mode: 'onSubmit',
  });

  const onSubmit = async (data: RegisterStep2Data) => {
    setFocusedError(null);
    setStep2Data(data);

    // ─── Merge step1 + step2 and call the real register API ─────
    if (!step1Data) {
      toast.error('Please complete step 1 first.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: RegisterPayload = {
        firstName: step1Data.firstName,
        middleName: step1Data.middleName || undefined,
        lastName: step1Data.lastName,
        email: step1Data.email,
        phoneNumber: step1Data.phone,
        gender: step1Data.gender.toUpperCase() as 'MALE' | 'FEMALE',
        idNumber: data.nationalId,
        birthdate: data.dob,
        address: data.address,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const response = await authService.register(payload);

      // Store the token + user in auth store (also persists to localStorage)
      setSession(response.token, response.user);

      toast.success(response.message || 'Account created successfully!');

      // Move to phone verification step (step 3)
      setCurrentStep(3);
    } catch (err: any) {
      // Backend validation errors
      if (err?.errors) {
        const msgs = err.errors.map((e: any) => e.msg || e.message).join(', ');
        toast.error(msgs);
      } else {
        toast.error(err?.message || err?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
    onError,
    isSubmitting
  };
};
