import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { CreditCard, Smartphone, Link as LinkIcon, QrCode } from 'lucide-react';
import applePayMockup from '../../assets/apple_pay_mockup.png';
import dashboardDark from '../../assets/dashboard 1 .jpeg';
import dashboardMobile from '../../assets/dashboard 2 .jpeg';

// Preload the hero image immediately when the JS chunk is downloaded (before React renders)
const preloadHero = new Image();
preloadHero.src = dashboardDark;

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
      <div className="relative pt-[140px] md:pt-[160px] pb-16 md:pb-32 overflow-hidden bg-gradient-to-b from-[#E0F2FE] to-white">
        <div className="absolute top-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#DCFCE7]/60 via-[#E0F2FE]/40 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-16 lg:gap-20">
          <div className="w-full lg:w-[38%] shrink-0 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-[#3b82f6]/20 text-[#3b82f6] font-semibold text-sm mb-6 md:mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
              Global Infrastructure
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-[900] text-slate-900 mb-6 md:mb-8 tracking-tighter leading-[1.1]">
              Seamless <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-[#4ade80] via-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">
                Global Payments
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed mb-8 md:mb-10 max-w-xl">
              Move money faster, safer, and smarter. Whether you are splitting bills with friends or accepting international business payments, our infrastructure has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <Link to="/register" className="bg-slate-900 hover:bg-[#22c55e] text-white text-center font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1">
                 Start processing
               </Link>
            </div>
            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Instant settlement
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Zero hidden fees
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[62%] relative flex justify-center lg:justify-end mt-12 lg:mt-0 lg:pt-16">
            <div className="relative w-full max-w-[760px] flex flex-row items-end justify-between gap-4 sm:gap-6">
              {/* Decorative Background Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-[#4ade80]/30 to-[#3b82f6]/30 rounded-full blur-[80px]"></div>
              
              {/* Desktop Dashboard Card (Clean Rounded Frame) */}
              <div className="relative z-10 w-[72%] rounded-2xl overflow-hidden border border-slate-900/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-[#0c1017] transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_45px_80px_-20px_rgba(0,0,0,0.4)]">
                {/* Desktop Screenshot */}
                <img 
                  src={dashboardDark} 
                  alt="Credify Desktop Web Dashboard" 
                  fetchPriority="high"
                  loading="eager"
                  className="w-full h-auto object-contain" 
                />
              </div>

              {/* Mobile Dashboard Device Card (Clean iPhone Mockup sitting side-by-side on the right - ZERO overlap) */}
              <div className="relative z-10 w-[25%] shrink-0 shadow-[0_32px_50px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-[1.05] hover:-translate-y-1">
                <img 
                  src={dashboardMobile} 
                  alt="Credify Mobile App Dashboard" 
                  loading="eager"
                  className="w-full h-auto object-contain"
                  style={{ clipPath: 'inset(1px round 38px)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apple Pay Section */}
      <div className="bg-gradient-to-b from-white to-[#E0F2FE]/50 py-16 md:py-24 relative overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#3b82f6]/20 text-[#3b82f6] font-semibold text-sm mb-6 shadow-sm">
              Coming Soon
            </div>
            <h2 className="text-3xl md:text-5xl font-[900] text-slate-900 mb-6 tracking-tight">
              Apple Pay is coming to <span className="bg-gradient-to-r from-[#4ade80] to-[#3b82f6] bg-clip-text text-transparent">Credify</span>.
            </h2>
            <p className="text-base md:text-lg text-slate-500 mb-8 leading-relaxed">
              Experience the safest, fastest, and most seamless way to pay. Very soon, you'll be able to
              connect your Credify cards to Apple Pay and make purchases with just a glance or a touch,
              anywhere in the world.
            </p>
            <ul className="space-y-4 text-left">
              {['Zero contact required', 'FaceID & TouchID secured', 'Instant transaction alerts'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                  <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#4ade80] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full flex justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80]/10 to-[#3b82f6]/10 blur-[100px] rounded-full"></div>
            <img src={applePayMockup} alt="Apple Pay Mockup" className="relative z-10 w-[80%] max-w-[400px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-6 sm:px-12 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-[#E0F2FE] group-hover:bg-[#DCFCE7] transition-colors duration-500">
                {React.cloneElement(feature.icon as React.ReactElement, { className: 'w-8 h-8 text-[#3b82f6] group-hover:text-[#22c55e] transition-colors duration-500' })}
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
