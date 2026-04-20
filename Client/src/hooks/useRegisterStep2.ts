import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { registerStep2Schema, type RegisterStep2Data } from '../schemas/auth';

export const useRegisterStep2 = () => {
  const { currentStep, setCurrentStep, step2Data, setStep2Data } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep2Data>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: step2Data || {},
    mode: 'onTouched',
  });

  const onSubmit = (data: RegisterStep2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  return {
    currentStep,
    setCurrentStep,
    register,
    handleSubmit,
    errors,
    onSubmit
  };
};
