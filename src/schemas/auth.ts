import * as z from 'zod';

/* ===================== ENUMS ===================== */
export const GenderEnum = z.enum(['male', 'female'] as const);

/* ===================== SHARED PRIMITIVES ===================== */
const emailSchema = z
  .string()
  .email('Enter a valid email')
  .transform((val) => val.toLowerCase().trim());

const nameSchema = z
  .string()
  .min(2, 'Too short')
  .max(20)
  .regex(/^[a-zA-Z\s]+$/, 'Only letters allowed');

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(64);

const confirmPasswordSchema = z.string();

/* ===================== CONTACT ===================== */
const phoneSchema = z
  .string()
  .regex(/^\+201[0-2,5][0-9]{8}$/, 'Enter a valid Egyptian phone number')
  .transform((val) => val.replace(/\s+/g, ''));

/* ===================== IDENTIFICATION ===================== */
const nationalIdSchema = z
  .string()
  .regex(/^[23][0-9]{13}$/, 'Invalid National ID format');

/* ===================== DOB (18+) ===================== */
const dobSchema = z.string().refine((date) => {
  const birth = new Date(date);
  const now = new Date();

  if (birth > now) return false;

  const age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  return age > 18 || (age === 18 && monthDiff >= 0);
}, {
  message: 'You must be at least 18 years old',
});

/* ===================== LOGIN ===================== */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/* ===================== REGISTER STEP 1 ===================== */
export const registerStep1Schema = z.object({
  firstName: nameSchema,
  middleName: nameSchema.optional().or(z.literal('')),
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  gender: GenderEnum,
});

/* ===================== REGISTER STEP 2 ===================== */
export const registerStep2Schema = z
  .object({
    nationalId: nationalIdSchema,
    address: z.string().min(10, 'Address is too short'),
    dob: dobSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ===================== TYPES ===================== */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;