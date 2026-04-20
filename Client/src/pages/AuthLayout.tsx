import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { cn } from '../lib/utils';
import { ShieldHalf, Lock, BadgeCheck, Users, Zap, CheckCircle2 } from 'lucide-react';
import myImage from '../assets/1.png';

const AuthLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';

  return (
    <div className="min-h-screen bg-auth-bg auth-bg flex items-center justify-center overflow-hidden font-b">
      <div className={cn(
        "bg-auth-card backdrop-blur-[16px] rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.6),0_36px_90px_rgba(14,31,66,0.14),0_8px_28px_rgba(14,31,66,0.07)] relative w-[min(1020px,95vw)] min-h-[700px] overflow-hidden",
        isRegister ? "right-panel-active" : ""
      )}>
        
        {/* Sign In Container */}
        <div className={cn(
          "absolute top-0 h-full transition-all duration-[0.68s] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)] left-0 w-full md:w-1/2 bg-auth-form z-[2]",
          isRegister ? "md:translate-x-full opacity-0 md:opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        )}>
          <Login />
        </div>

        {/* Sign Up Container */}
        <div className={cn(
          "absolute top-0 h-full transition-all duration-[0.68s] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)] left-0 w-full md:w-1/2 bg-auth-form z-[1]",
          isRegister ? "md:translate-x-full opacity-100 z-[5]" : "opacity-0 pointer-events-none"
        )}>
          <Register />
        </div>

        {/* Overlay Container (Hidden on mobile) */}
        <div className={cn(
          "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-[0.68s] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)] z-[100] hidden md:block",
          isRegister ? "-translate-x-full" : ""
        )}>
          <div className={cn(
            "bg-gradient-to-br from-auth-brand-top to-auth-brand-bot relative -left-full h-full w-[200%] transition-all duration-[0.68s] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)]",
            isRegister ? "translate-x-1/2" : "translate-x-0"
          )}>
            
            {/* Overlay Left */}
            <div className={cn(
              "absolute flex items-center justify-center flex-col px-[52px] top-0 h-full w-1/2 text-center transition-all duration-[0.68s] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)]",
              isRegister ? "translate-x-0" : "-translate-x-[20%]"
            )}>
              <img src={myImage} alt="Credify" className="h-24 w-auto object-contain mb-[2rem] " />
              <h2 className="font-h text-[1.9rem] font-extrabold text-white mb-4 tracking-[-0.6px]">Already a client?</h2>
              <p className="text-[0.85rem] leading-[1.7] text-auth-brand-muted mb-[2.4rem]">
                To keep your assets protected, sign in with your verified credentials.
              </p>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-transparent border-[1.5px] border-white/30 rounded-[13px] text-white py-[13px] px-[42px] font-b text-[0.88rem] font-semibold cursor-pointer transition-colors duration-220 hover:bg-white hover:text-auth-brand-top hover:border-white"
              >
                Return to Login
              </button>
              
              <div className="mt-[1.8rem] flex flex-col gap-[9px]">
                <div className="flex items-center gap-[9px] text-[0.73rem] text-auth-brand-muted font-medium">
                  <ShieldHalf className="text-auth-teal w-[14px] h-[14px]" /> 256-bit AES encryption
                </div>
                <div className="flex items-center gap-[9px] text-[0.73rem] text-auth-brand-muted font-medium">
                  <Lock className="text-auth-teal w-[14px] h-[14px]" /> PCI DSS Level 1 certified
                </div>
                <div className="flex items-center gap-[9px] text-[0.73rem] text-auth-brand-muted font-medium">
                  <BadgeCheck className="text-auth-teal w-[14px] h-[14px]" /> Zero-knowledge architecture
                </div>
              </div>
            </div>

            {/* Overlay Right */}
            <div className={cn(
              "absolute flex items-center justify-center flex-col px-[52px] top-0 h-full w-1/2 text-center transition-all duration-[0.68s] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)] right-0",
              isRegister ? "translate-x-[20%]" : "translate-x-0"
            )}>
              <img src={myImage} alt="Credify" className="h-24 w-auto object-contain mb-[2rem] " />
              <h2 className="font-h text-[1.9rem] font-extrabold text-white mb-4 tracking-[-0.6px]">New to Banking?</h2>
              <p className="text-[0.85rem] leading-[1.7] text-auth-brand-muted mb-[2.4rem]">
                Open a secure digital account today and start moving your money faster.
              </p>
              <button 
                onClick={() => navigate('/register')} 
                className="bg-transparent border-[1.5px] border-white/30 rounded-[13px] text-white py-[13px] px-[42px] font-b text-[0.88rem] font-semibold cursor-pointer transition-colors duration-220 hover:bg-white hover:text-auth-brand-top hover:border-white"
              >
                Get Started
              </button>
              
              <div className="mt-[1.8rem] flex flex-col gap-[9px]">
                <div className="flex items-center gap-[9px] text-[0.73rem] text-auth-brand-muted font-medium">
                  <Users className="text-auth-teal w-[14px] h-[14px]" /> 2M+ active clients
                </div>
                <div className="flex items-center gap-[9px] text-[0.73rem] text-auth-brand-muted font-medium">
                  <Zap className="text-auth-teal w-[14px] h-[14px]" /> Instant transfers
                </div>
                <div className="flex items-center gap-[9px] text-[0.73rem] text-auth-brand-muted font-medium">
                  <CheckCircle2 className="text-auth-teal w-[14px] h-[14px]" /> 99.9% uptime SLA
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
