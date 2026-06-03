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

        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-20">

          {/* Left: Text */}
          <div className="w-full lg:w-[44%] shrink-0 text-center lg:text-left flex flex-col items-center lg:items-start">
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
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed mb-7 md:mb-9 max-w-xl lg:max-w-none">
              Move money faster, safer, and smarter. Whether you are splitting bills with friends or accepting international business payments, our infrastructure has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="relative group bg-slate-900 hover:bg-[#22c55e] text-white text-center font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start processing
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
                <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] transition-all duration-700 group-hover:left-[100%]" />
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
          <div className="w-full lg:w-[50%] relative mt-10 lg:mt-0 flex justify-center lg:justify-end items-center">
            
            {/* Ambient Background Glow - Calm */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-[#4ade80]/10 via-[#3b82f6]/15 to-[#6366f1]/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Layered Mockup Space */}
            <div className="relative w-full max-w-[500px] lg:max-w-[540px] xl:max-w-[580px] mx-auto lg:ml-auto lg:mr-0 px-4 sm:px-6 pb-6">
              
              {/* Desktop MacBook Pro Mockup (Ultra-Refined) */}
              <div className="relative z-10 w-full drop-shadow-2xl animate-[fadeInUp_0.8s_ease-out]">
                {/* Screen Bezel & Display */}
                <div className="relative mx-auto w-full sm:w-[94%] bg-[#121212] p-[4px] sm:p-[6px] rounded-t-[12px] sm:rounded-t-[16px] border border-slate-700/50 flex flex-col shadow-lg">
                  {/* Delicate Screen Notch */}
                  <div className="absolute top-[4px] sm:top-[6px] left-1/2 -translate-x-1/2 w-[12%] h-[6px] sm:h-[8px] bg-[#121212] rounded-b-[4px] z-30 flex justify-center items-end pb-[1px]">
                    <div className="w-[3px] h-[3px] rounded-full bg-white/10" />
                  </div>
                  
                  {/* Screen Content Wrapper */}
                  <div className="relative rounded-t-[8px] sm:rounded-t-[10px] overflow-hidden bg-[#0a0a0a] aspect-[16/10] border border-[#222]">
                    <img
                      src={dashboardDark}
                      alt="Credify Desktop Dashboard"
                      fetchPriority="high"
                      loading="eager"
                      className="w-full h-full object-cover object-left-top block"
                    />
                  </div>
                  
                  {/* Bottom Black Bezel with Text */}
                  <div className="relative w-full h-[14px] sm:h-[18px] flex items-center justify-center">
                    <span className="text-[5px] sm:text-[7px] font-medium text-slate-400 tracking-[0.25em] select-none opacity-80">
                      MacBook Pro
                    </span>
                  </div>
                </div>
                
                {/* MacBook Silver Base */}
                <div className="relative mx-auto w-[102%] sm:w-[98%] -left-[1%] sm:left-0 h-[8px] sm:h-[10px] bg-gradient-to-b from-[#e2e8f0] to-[#94a3b8] rounded-b-[8px] sm:rounded-b-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),_0_20px_40px_rgba(0,0,0,0.2)] border-t border-slate-300">
                  {/* Thumb groove */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[10%] h-[3px] sm:h-[4px] bg-[#64748b] shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)] rounded-b-[3px]" />
                </div>
              </div>

              {/* Mobile Phone Mockup (Using image's built-in frame) */}
              <div
                className="absolute z-20 bottom-[-4%] right-[0%] sm:right-[2%] w-[22%] sm:w-[20%] drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 duration-500"
              >
                <img
                  src={dashboardMobile}
                  alt="Credify Mobile Dashboard"
                  loading="eager"
                  className="w-full h-auto block rounded-[20px] sm:rounded-[28px]"
                />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-[#3b82f6]/20 text-[#3b82f6] font-semibold text-sm mb-6 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              Coming Soon
            </div>

            <h2 className="text-4xl md:text-[44px] lg:text-6xl font-[900] text-slate-900 mb-6 tracking-tight leading-[1.1]">
              <span className="whitespace-normal md:whitespace-nowrap">Apple Pay is coming</span> <br className="hidden md:block lg:hidden" /> to{' '}
              <span className="bg-gradient-to-r from-[#4ade80] to-[#3b82f6] bg-clip-text text-transparent drop-shadow-sm pr-0.5">
                Credify
              </span><span className="text-slate-300">.</span>
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
                className="group relative inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-[#3b82f6] text-white font-bold py-3.5 px-7 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 text-sm overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2.5">
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
                </span>
                <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[30deg] transition-all duration-700 group-hover:left-[100%]" />
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

          {/* Right: Apple Pay Image - Clean & Professional */}
          <div className="flex-1 w-full flex justify-center items-center relative py-12 lg:py-4">
            
            {/* Soft Ambient Backdrop */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,rgba(74,222,128,0.05)_45%,transparent_70%)] blur-[60px] pointer-events-none"
            />
            
            {/* Elegant Floating Container */}
            <div className="relative w-[90%] md:w-[100%] lg:w-[95%] max-w-[540px] transition-transform duration-700 ease-out hover:-translate-y-3">
              
              {/* Subtle accent glow behind the image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/10 to-[#4ade80]/10 rounded-3xl blur-2xl -z-10" />

              {/* The Apple Pay Mockup Image */}
              <img
                src={applePayMockup}
                alt="Apple Pay on Credify"
                className="w-full h-auto object-contain block drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-700 hover:drop-shadow-[0_30px_50px_rgba(0,0,0,0.15)] relative z-10"
              />
              
            </div>
          </div>
        </div>
      </div>

      {/* Features Premium Glass Grid */}
      <div className="py-20 md:py-32 max-w-7xl mx-auto px-6 sm:px-12 relative overflow-hidden">
        {/* Stunning Ambient Mesh Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1000px] pointer-events-none -z-10">
          <div className="absolute top-0 left-10 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-blue-400/20 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute bottom-10 right-10 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-emerald-400/20 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] bg-teal-200/20 rounded-full blur-[100px] sm:blur-[120px] mix-blend-multiply" />
        </div>

        <div className="text-center mb-16 md:mb-20 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-[900] text-slate-900 tracking-tight mb-5 leading-tight">
            Everything you need to <span className="bg-gradient-to-r from-[#4ade80] to-[#3b82f6] bg-clip-text text-transparent">scale</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A complete financial infrastructure designed to help you process payments, send payouts, and manage your entire business effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-[28px] p-8 bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 hover:border-[#3b82f6]/30 transition-all duration-500 group cursor-pointer flex flex-col items-start"
            >
              {/* Subtle inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none rounded-[28px]" />

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-[#E0F2FE] to-blue-50 group-hover:from-blue-100 group-hover:to-[#E0F2FE] shadow-[inset_0_1px_1px_rgba(255,255,255,1)] transition-all duration-500 relative z-10">
                {React.cloneElement(feature.icon as React.ReactElement<any>, {
                  className: 'w-7 h-7 text-[#3b82f6] group-hover:text-[#22c55e] transition-colors duration-500'
                })}
              </div>
              
              <h3 className="text-xl font-[900] text-slate-900 mb-3 tracking-tight relative z-10">
                {feature.title}
              </h3>
              
              <p className="leading-relaxed font-medium text-sm sm:text-base text-slate-500 relative z-10">
                {feature.description}
              </p>

              {/* Minimalist interactive arrow */}
              <div className="mt-8 flex items-center text-[#3b82f6] font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 relative z-10">
                Learn more
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentsPage;