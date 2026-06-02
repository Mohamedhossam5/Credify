import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { CreditCard, Smartphone, Link as LinkIcon, QrCode } from 'lucide-react';
import applePayMockup from '../../assets/apple_pay_mockup.png';
import dashboardDark from '../../assets/dashboard 1 .jpeg';
import dashboardMobile from '../../assets/dashboard 2 .jpeg';

const preloadHero = new Image();
preloadHero.src = dashboardDark;

const FeatureIconBox = ({ children }: { children: React.ReactNode }) => (
  <span
    className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl"
    style={{
      background: 'linear-gradient(135deg, #22c77e 0%, #18a86b 100%)',
      boxShadow: '0 4px 14px rgba(34,199,126,0.40)',
    }}
  >
    {children}
  </span>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const applePayFeatures = [
  {
    label: 'Zero contact required',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'FaceID & TouchID secured',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="11" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </svg>
    ),
  },
  {
    label: 'Instant transaction alerts',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
];

const PaymentsPage: React.FC = () => {
  const features = [
    {
      icon: <CreditCard className="w-8 h-8 text-blue-500" />,
      title: 'Card Payments',
      description: 'Accept credit and debit cards globally with our secure payment gateway.'
    },
    {
      icon: <LinkIcon className="w-8 h-8 text-blue-500" />,
      title: 'Payment Links',
      description: 'Generate secure payment links to share with customers via email or SMS.'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-blue-500" />,
      title: 'Mobile Wallet',
      description: 'Integrate Apple Pay, Google Pay, and other popular mobile wallets instantly.'
    },
    {
      icon: <QrCode className="w-8 h-8 text-blue-500" />,
      title: 'QR Codes',
      description: 'Accept touch-free payments in-store with dynamic QR codes.'
    }
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-[120px] md:pt-[140px] pb-12 md:pb-20 overflow-hidden bg-gradient-to-b from-[#E0F2FE] to-white">
        <div className="absolute top-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DCFCE7]/60 via-[#E0F2FE]/40 to-transparent" />

        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">

          {/* Left: Text */}
          <div className="w-full lg:w-[36%] shrink-0 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-[#3b82f6]/20 text-[#3b82f6] font-semibold text-sm mb-5 md:mb-7 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              Global Infrastructure
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[900] text-slate-900 mb-5 md:mb-7 tracking-tighter leading-[1.05]">
              Seamless <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[#4ade80] via-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">
                Global Payments
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed mb-7 md:mb-9 max-w-xl">
              Move money faster, safer, and smarter. Whether you are splitting bills with friends or accepting international business payments, our infrastructure has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="bg-slate-900 hover:bg-[#22c55e] text-white text-center font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start processing
              </Link>
            </div>

 {/* Hero trust badges — same style as Apple Pay features */}
<div className="mt-7 md:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-6 mx-auto lg:mx-0 w-fit">
  <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
    <FeatureIconBox>
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </FeatureIconBox>
    Instant settlement
  </div>
  <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
    <FeatureIconBox>
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </FeatureIconBox>
    Zero hidden fees
  </div>
</div>
          </div>

          {/* Right: Mockups */}
          <div className="w-full lg:w-[60%] relative mt-10 lg:mt-0 flex justify-center items-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-tr from-[#4ade80]/20 via-[#3b82f6]/25 to-[#6366f1]/20 rounded-full blur-[90px] pointer-events-none" />
            
            {/* Layered Mockup Space */}
            <div className="relative w-full max-w-[620px] lg:max-w-none" style={{ paddingRight: '16%', paddingBottom: '13%' }}>
              
              {/* Desktop Browser Window Mockup */}
              <div
                className="relative z-10 w-full rounded-2xl overflow-hidden bg-[#0c1017] transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.75)] animate-[fadeInUp_0.8s_ease-out]"
                style={{
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 4px 6px -1px rgba(0,0,0,0.1), 0 25px 60px -15px rgba(0,0,0,0.5), 0 50px 100px -20px rgba(0,0,0,0.6)',
                }}
              >
                {/* Browser Header Bar */}
                <div className="flex items-center justify-center px-4 py-2.5 bg-[#0d131f] border-b border-white/5 select-none">
                  <div className="text-[10px] text-slate-400 font-mono bg-white/5 px-4 py-0.5 rounded-full border border-white/5 tracking-wider">
                    credify.com
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />
                  <img
                    src={dashboardDark}
                    alt="Credify Desktop Dashboard"
                    fetchPriority="high"
                    loading="eager"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>

              {/* Mobile Phone Mockup (Floats in bottom-right) */}
              <div
                className="absolute z-20 transition-all duration-700 hover:scale-[1.04] hover:-translate-y-3 bottom-[-6%] right-[2%] w-[28%] sm:bottom-[-15%] sm:right-[-4%] sm:w-[23.8%]"
                style={{
                  filter: 'drop-shadow(0 30px 70px rgba(0,0,0,0.5))',
                }}
              >
                {/* iPhone Bezel and Dynamic Island Frame */}
                <div className="relative rounded-[36px] p-[5.5px] bg-[#161617] border border-[#2d2d30] shadow-2xl ring-1 ring-white/10 ring-offset-1 ring-offset-slate-900">
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[35%] h-[9px] bg-black rounded-full z-30" />
                  {/* Speaker Grill */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[15%] h-[2px] bg-[#333] rounded-full z-30" />
                  
                  {/* Screen Content Wrapper */}
                  <div className="relative rounded-[31px] overflow-hidden bg-white">
                    <img
                      src={dashboardMobile}
                      alt="Credify Mobile Dashboard"
                      loading="eager"
                      className="w-full h-auto object-contain block"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Apple Pay Section */}
      <div className="bg-gradient-to-b from-white to-[#E0F2FE]/50 py-16 md:py-24 relative overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#3b82f6]/20 text-[#3b82f6] font-semibold text-sm mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              Coming Soon
            </div>

            <h2 className="text-4xl md:text-[44px] lg:text-6xl font-[900] text-slate-900 mb-6 tracking-tight leading-[1.1]">
              <span className="whitespace-normal md:whitespace-nowrap">Apple Pay is coming</span> <br className="hidden md:block lg:hidden" /> to{' '}
              <span className="bg-gradient-to-r from-[#4ade80] to-[#3b82f6] bg-clip-text text-transparent">
                Credify
              </span>.
            </h2>

            <p className="text-base md:text-lg text-slate-500 mb-8 leading-relaxed">
              Experience the safest, fastest, and most seamless way to pay. Very soon, you'll be able to
              connect your Credify cards to Apple Pay and make purchases with just a glance or a touch,
              anywhere in the world.
            </p>

            {/* Features List */}
            <ul className="space-y-4 mb-10 w-full">
              {applePayFeatures.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-base">
                  <FeatureIconBox>{item.icon}</FeatureIconBox>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                to="#"
                onClick={(e) => e.preventDefault()}
                className="group inline-flex items-center gap-2.5 bg-slate-900 hover:bg-slate-700 text-white font-bold py-3.5 px-7 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 text-sm"
              >
                <svg
                  className="w-4 h-4 text-white transition-transform duration-300 group-hover:rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                Notify me
              </Link>
              <Link
                to="#"
                 onClick={(e) => e.preventDefault()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#3b82f6] hover:text-[#22c55e] transition-colors duration-300 group"
              >
                Learn more
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

          </div>

          {/* Right: Apple Pay Image */}
          <div className="flex-1 w-full flex justify-center items-center relative py-8">
            {/* Dynamic Layered Ambient Light */}
            <div
              className="absolute w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(34,197,94,0.18)_0%,rgba(59,130,246,0.14)_35%,transparent_65%)] blur-[80px] pointer-events-none"
              style={{ top: '-10%', left: '-10%' }}
            />
            
            {/* 3D Perspective Container */}
            <div 
              className="relative w-[90%] md:w-[110%] lg:w-[90%] max-w-[560px] transition-all duration-750 ease-out [perspective:1200px] md:scale-110 lg:scale-100 md:translate-x-6 lg:translate-x-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Backing Glasscard Panel */}
              <div 
                className="absolute -inset-4 rounded-3xl bg-slate-900/5 border border-slate-900/10 backdrop-blur-[6px] -z-10 shadow-[0_30px_70px_rgba(0,0,0,0.04)] hidden sm:block"
                style={{ 
                  transform: 'translateZ(-20px) rotateY(-10deg) rotateX(6deg)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)'
                }}
              />

              {/* Tilting Mockup Image */}
              <img
                src={applePayMockup}
                alt="Apple Pay Mockup"
                className="w-full h-auto object-contain block transition-all duration-700 ease-out cursor-pointer hover:scale-[1.05]"
                style={{
                  transform: 'rotateY(-12deg) rotateX(8deg)',
                  filter: 'drop-shadow(20px 30px 50px rgba(0,0,0,0.18))',
                  transformStyle: 'preserve-3d'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotateY(-4deg) rotateX(3deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotateY(-12deg) rotateX(8deg)';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-6 sm:px-12 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-[#E0F2FE] group-hover:bg-[#DCFCE7] transition-colors duration-500">
                {React.cloneElement(feature.icon as React.ReactElement<any>, {
                  className: 'w-8 h-8 text-[#3b82f6] group-hover:text-[#22c55e] transition-colors duration-500'
                })}
              </div>
              <h3 className="text-xl font-[900] text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentsPage;