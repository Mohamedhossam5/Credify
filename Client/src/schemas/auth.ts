import * as z from 'zod';

/* Strong Password Rules */
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(64)
  .regex(/[A-Z]/, 'Must include at least one uppercase letter')
  .regex(/[a-z]/, 'Must include at least one lowercase letter')
  .regex(/[0-9]/, 'Must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must include at least one special character');

/*  Egyptian Phone Validation */
 const phoneSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, '')) // يشيل أي مسافات
  .refine((val) => /^\+201[0-2,5][0-9]{8}$/.test(val), {
    message: 'Enter a valid Egyptian phone number',
  });
 
/*  National ID Validation (Egypt - 14 digits + basic logic) */
const nationalIdSchema = z
  .string()
  .regex(/^[23][0-9]{13}$/, 'Invalid National ID format');

/*  Age Validation (18+) */
const dobSchema = z.string().refine((date) => {
  const age = new Date().getFullYear() - new Date(date).getFullYear();
  return age >= 18;
}, 'You must be at least 18 years old');

/*  Email */
const emailSchema = z
  .string()
  .email('Enter a valid email')
  .transform((val) => val.toLowerCase().trim());

/*  Name */
const nameSchema = z
  .string()
  .min(2, 'Too short')
  .max(50)
  .regex(/^[a-zA-Z\s]+$/, 'Only letters allowed');

/* ===================== LOGIN ===================== */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});


/* ===================== REGISTER STEP 1 ===================== */
export const registerStep1Schema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dob: dobSchema,
});

/* ===================== REGISTER STEP 2 ===================== */
export const registerStep2Schema = z
  .object({
    nationalId: nationalIdSchema,
    address: z.string().min(10, 'Address is too short'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ===================== TYPES ===================== */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;