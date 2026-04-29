import React from 'react';
import { RegisterStep1 } from '../components/register/RegisterStep1';
import { RegisterStep2 } from '../components/register/RegisterStep2';
import { RegisterStep3 } from '../components/register/RegisterStep3';
import { KycFlow } from '../components/register/kyc/KycFlow';

const Register: React.FC = () => {
  return (
    <div className="flex flex-col px-6 md:px-12 h-full py-[34px] relative overflow-x-hidden overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-[400px]">
        <RegisterStep1 />
        <RegisterStep2 />
        <RegisterStep3 />
      </div>
      <KycFlow />
    </div>
  );
};

export default Register;
