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
  .transform((val) => val.replace(/[\s\-()]/g, ''))
  .pipe(
    z.string().regex(
      /^(?:\+?20)?0?1[0-25][0-9]{8}$/,
      'Enter a valid Egyptian phone number (e.g. 01012345678)'
    )
  )
  .transform((val) => {
    // Strip everything to just the 10-digit local number, then prepend +20
    const cleaned = val.replace(/^\+?20/, '').replace(/^0/, '');
    return `+20${cleaned}`;
  });

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
  nationalId: nationalIdSchema,
  gender: GenderEnum,
});

/* ===================== REGISTER STEP 2 ===================== */
export const registerStep2Schema = z
  .object({
    address: z.string().min(10, 'Address is too short'),
    dob: dobSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ===================== FORGOT PASSWORD ===================== */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
  idNumber: z
    .string()
    .regex(/^\d{14}$/, 'National ID must be exactly 14 digits'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ===================== TYPES ===================== */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;