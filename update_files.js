const fs = require('fs');

// 1. Update useRegisterStep1.ts
let hook1 = fs.readFileSync('Client/src/hooks/useRegisterStep1.ts', 'utf8');
hook1 = hook1.replace(
  "import { useState } from 'react';",
  "import { useState, useEffect } from 'react';"
);
hook1 = hook1.replace(
  "const { register, handleSubmit, formState: { errors } } = useForm<RegisterStep1Data>({",
  "const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterStep1Data>({"
);
hook1 = hook1.replace(
  "mode: 'onSubmit',",
  "mode: 'onChange',"
);
hook1 = hook1.replace(
  "const onSubmit = (data: RegisterStep1Data) => {",
  `  useEffect(() => {
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

  const onSubmit = (data: RegisterStep1Data) => {`
);
hook1 = hook1.replace(
  "'lastName', 'email', 'phone'",
  "'lastName', 'nationalId', 'email', 'phone'"
);
fs.writeFileSync('Client/src/hooks/useRegisterStep1.ts', hook1);

// 2. Update RegisterStep1.tsx
let step1 = fs.readFileSync('Client/src/components/register/RegisterStep1.tsx', 'utf8');
if (!step1.includes('IdCard')) {
  step1 = step1.replace(
    "import { User, Mail, Phone, ArrowRight } from 'lucide-react';",
    "import { User, Mail, Phone, IdCard, ArrowRight } from 'lucide-react';"
  );
}
step1 = step1.replace(
  `        <Input\r
          label="Last name"`,
  `        <Input\r
          label="National ID"\r
          placeholder="29xxxxxxxxxxxxxx"\r
          maxLength={14}\r
          icon={IdCard}\r
          error={focusedError === 'nationalId' ? errors.nationalId?.message : undefined}\r
          {...register('nationalId')}\r
        />\r
        <Input\r
          label="Last name"`
);
step1 = step1.replace(
  `        <Input
          label="Last name"`,
  `        <Input
          label="National ID"
          placeholder="29xxxxxxxxxxxxxx"
          maxLength={14}
          icon={IdCard}
          error={focusedError === 'nationalId' ? errors.nationalId?.message : undefined}
          {...register('nationalId')}
        />
        <Input
          label="Last name"`
);

// Make gender read-only/non-clickable
step1 = step1.replace(
  /className="peer sr-only"/g,
  `className="peer sr-only" disabled`
);
step1 = step1.replace(
  /cursor-pointer/g,
  `cursor-not-allowed opacity-80`
);
fs.writeFileSync('Client/src/components/register/RegisterStep1.tsx', step1);

// 3. Update RegisterStep2.tsx
let step2 = fs.readFileSync('Client/src/components/register/RegisterStep2.tsx', 'utf8');
step2 = step2.replace(/<Input label="National ID".*?\/>\s*/g, '');
fs.writeFileSync('Client/src/components/register/RegisterStep2.tsx', step2);

// 4. Update useRegisterStep2.ts
let hook2 = fs.readFileSync('Client/src/hooks/useRegisterStep2.ts', 'utf8');
hook2 = hook2.replace(
  "idNumber: data.nationalId,",
  "idNumber: step1Data.nationalId,"
);
hook2 = hook2.replace(
  /const fieldOrder: \(keyof RegisterStep2Data\)\[\] = \['nationalId', /g,
  "const fieldOrder: (keyof RegisterStep2Data)[] = ["
);
fs.writeFileSync('Client/src/hooks/useRegisterStep2.ts', hook2);

console.log("Done");
