import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

// Inline premium animated SVG illustration for Terms of Use & Electronic Agreement
const TermsHeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
      {/* Dynamic background glow ring */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#3b82f6]/10 via-[#6366f1]/10 to-[#14b8a6]/15 rounded-full blur-[60px] animate-pulse" />
      
      <svg className="w-full h-full relative z-10" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="termsGrad" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="docGrad" x1="150" y1="120" x2="350" y2="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="accentTeal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {/* Outer rotating orbit ring */}
        <circle cx="250" cy="250" r="195" stroke="url(#termsGrad)" strokeWidth="1" strokeDasharray="15 30" className="animate-[spin_60s_linear_infinite]" />
        
        {/* Middle geometric rings */}
        <rect x="90" y="90" width="320" height="320" rx="40" stroke="#6366f1" strokeWidth="1.5" strokeOpacity="0.1" strokeDasharray="20 10" className="animate-[spin_40s_linear_infinite_reverse]" />

        {/* Digital node lines (Futuristic) */}
        <line x1="100" y1="250" x2="400" y2="250" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.5" />
        <line x1="250" y1="100" x2="250" y2="400" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 8" strokeOpacity="0.5" />

        {/* Floating Digital Document */}
        <g className="animate-[translateY_5s_ease-in-out_infinite]" style={{ transform: 'translateY(-5px)' }}>
          {/* Shadow Behind Document */}
          <rect x="155" y="115" width="190" height="270" rx="24" fill="#000000" fillOpacity="0.06" filter="blur(10px)" />
          
          {/* Document Base */}
          <rect x="150" y="110" width="190" height="270" rx="24" fill="url(#docGrad)" stroke="#cbd5e1" strokeWidth="2.5" />
          
          {/* Document Header Bar */}
          <rect x="180" y="145" width="130" height="14" rx="7" fill="#6366f1" fillOpacity="0.8" />
          
          {/* Document Content Lines */}
          <rect x="180" y="180" width="90" height="7" rx="3.5" fill="#94a3b8" fillOpacity="0.5" />
          <rect x="180" y="200" width="130" height="7" rx="3.5" fill="#cbd5e1" fillOpacity="0.6" />
          <rect x="180" y="220" width="110" height="7" rx="3.5" fill="#cbd5e1" fillOpacity="0.6" />
          
          {/* Checklist Boxes & Checks */}
          {/* Check Item 1 */}
          <rect x="180" y="250" width="16" height="16" rx="4" fill="#14b8a6" fillOpacity="0.15" stroke="#14b8a6" strokeWidth="1.5" />
          <path d="M184 258 L187 261 L192 254" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="206" y="254" width="80" height="8" rx="4" fill="#64748b" fillOpacity="0.6" />

          {/* Check Item 2 */}
          <rect x="180" y="280" width="16" height="16" rx="4" fill="#14b8a6" fillOpacity="0.15" stroke="#14b8a6" strokeWidth="1.5" />
          <path d="M184 288 L187 291 L192 284" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="206" y="284" width="60" height="8" rx="4" fill="#64748b" fillOpacity="0.6" />

          {/* Holographic Signature Seal */}
          <circle cx="280" cy="335" r="22" fill="url(#accentTeal)" fillOpacity="0.15" stroke="url(#accentTeal)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M268 335 C275 328 273 342 282 331 C288 327 291 336 295 334" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Small floating node orbits */}
        <circle cx="380" cy="180" r="14" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="1" />
        <circle cx="380" cy="180" r="4" fill="#3b82f6" />
        
        <circle cx="120" cy="320" r="18" fill="#14b8a6" fillOpacity="0.1" stroke="#14b8a6" strokeWidth="1" />
        <circle cx="120" cy="320" r="5" fill="#14b8a6" />
      </svg>
      
      {/* Premium floating glass badge */}
      <div className="absolute bottom-4 bg-white/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-100/60 shadow-[0_15px_35px_rgba(59,130,246,0.12)] flex items-center gap-3 animate-[float_4s_ease-in-out_infinite] pointer-events-none">
        <div className="w-3.5 h-3.5 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-800 tracking-wide uppercase">CBE Regulated Platform</span>
      </div>
    </div>
  );
};

const BulletDotIcon = () => (
  <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TermsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'user-responsibilities': true, // Expand first card by default
  });
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const sections = [
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      desc: 'Users must maintain absolute integrity of details and credentials associated with the Credify profile.',
      details: [
        'Provide strictly accurate, non-fraudulent personal credentials.',
        'Protect banking login secrets, PINs, and mobile authentication devices.',
        'Monitor account statements frequently and report abnormal transactions immediately.'
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'account-eligibility',
      title: 'Account Eligibility',
      desc: 'Access to banking services is conditioned upon meeting regulatory compliance criteria.',
      details: [
        'You must be at least 18 years of age to register a wallet profile.',
        'Hold a valid national identity card or biometric passport.',
        'Pass standard compliance background checks and KYC verification procedures.'
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      id: 'security-requirements',
      title: 'Security Requirements',
      desc: 'Credify banking modules are governed by strict multi-factor authentication protocols.',
      details: [
        'Enforcement of 2FA configurations on payment requests and external transfers.',
        'Immediate reporting of lost devices or compromised identity documents.',
        'Automatic logout locks active after 10 minutes of screen inactivity.'
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'transactions-payments',
      title: 'Transactions & Payments',
      desc: 'All credit transfers, deposits, and bill settlements are routed securely under regional clearing guidelines.',
      details: [
        'Transfers are subject to daily limit thresholds for user security.',
        'Real-time transaction settlement for instant-peer networks.',
        'Standard compliance audit logs maintained for auditing compliance.'
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'prohibited-activities',
      title: 'Prohibited Activities',
      desc: 'Malicious exploitation, fraudulent routing, or software abuse will result in instant account suspension.',
      details: [
        'Any attempt at money laundering, structuring, or masking transfer details.',
        'Setting up multiple active accounts using fraudulent proxy identities.',
        'Deploying bots, scraping mechanisms, or network injection scripts on banking endpoints.'
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    {
      id: 'service-availability',
      title: 'Service Availability & Liability',
      desc: 'We strive for maximum system availability while defining specific limits of regulatory liability.',
      details: [
        'Targeted uptime commitment of 99.9% for core digital banking applications.',
        'Scheduled database maintenance is communicated 24 hours in advance.',
        'Liability is capped to standard regulatory minimums for network outages.'
      ],
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  // Refs for tracking section offsets for Scrollspy
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Filter sections based on search query
  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Scrollspy logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 250;
      
      // Determine active section
      for (const sec of sections) {
        const el = sectionRefs.current[sec.id];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial run

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleScrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 110,
        behavior: 'smooth'
      });
      // Expand card automatically when clicked from sidebar
      setExpandedCards(prev => ({ ...prev, [id]: true }));
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-[#fafbfc] print:bg-white text-slate-800">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-[125px] md:pt-[145px] pb-12 md:pb-20 overflow-hidden bg-gradient-to-b from-[#e0f2fe]/50 via-white to-[#fafbfc] border-b border-slate-100/50 print:hidden">
        <div className="absolute top-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#dcfce7]/30 via-[#e0f2fe]/20 to-transparent" />
        
        <div className="max-w-[1250px] mx-auto px-6 sm:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="w-full lg:w-7/12 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-blue-600 font-extrabold text-[10px] sm:text-xs mb-5 shadow-sm uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Terms Agreement Active
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[900] text-slate-900 mb-5 tracking-tight leading-[1.1]">
              Terms of Use
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl lg:max-w-none mb-7">
              Please review these guidelines governing the use of Credify digital banking services. By registering, you agree to comply with these guidelines.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-300"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Export as PDF
              </button>
              
              <button 
                onClick={() => setShowRevisionModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-extrabold text-xs hover:bg-blue-100 hover:shadow-sm transition-all duration-300"
              >
                Revision History (v1.2)
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full lg:w-5/12 flex justify-center">
            <TermsHeroIllustration />
          </div>
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="max-w-[1250px] mx-auto px-6 sm:px-12 py-12 md:py-20 relative">
        
        {/* Sticky Search bar container */}
        <div className="mb-10 relative z-20 max-w-2xl mx-auto lg:mx-0 print:hidden">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-1.5 focus-within:border-blue-400 focus-within:shadow-[0_10px_30px_rgba(59,130,246,0.06)] transition-all duration-300">
            <div className="pl-4 shrink-0">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Search terms agreement (e.g., eligibility, transfer limits)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-3 pl-3 pr-4 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none text-slate-800 text-sm md:text-base font-medium placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-2 mr-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Clear query"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Chips Navigation (visible only on mobile/tablet) */}
        <div className="mb-6 lg:hidden print:hidden overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div className="flex gap-2.5 w-max pb-2">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleScrollToSection(sec.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {sec.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Outer Split Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
          
          {/* Left: Sticky Sidebar Index (Scrollspy) */}
          <aside className="sticky top-[100px] w-full max-w-[280px] bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hidden lg:block print:hidden">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-5">Table of Contents</h4>
            <nav className="flex flex-col gap-2">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleScrollToSection(sec.id)}
                    className={`flex items-center text-left py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500 font-extrabold translate-x-1' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {sec.title}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right: Terms Content Items */}
          <div className="flex flex-col gap-8 w-full">
            {filteredSections.length > 0 ? (
              filteredSections.map((sec) => {
                const isExpanded = expandedCards[sec.id];
                return (
                  <div
                    key={sec.id}
                    id={sec.id}
                    ref={(el) => { sectionRefs.current[sec.id] = el; }}
                    className="bg-white rounded-[28px] border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:border-blue-200 hover:shadow-[0_15px_45px_rgba(59,130,246,0.04)] transition-all duration-500 overflow-hidden"
                  >
                    {/* Header bar / Toggle Button */}
                    <div
                      onClick={() => toggleCard(sec.id)}
                      className="p-6 sm:p-8 flex items-center justify-between gap-5 cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-500 shrink-0">
                          {sec.icon}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-[900] text-slate-900 tracking-tight leading-snug">
                            {sec.title}
                          </h3>
                          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 pr-6 hidden sm:block">
                            {sec.desc}
                          </p>
                        </div>
                      </div>
                      
                      {/* Expand Chevron Icon */}
                      <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-blue-200 transition-all duration-300">
                        <svg 
                          className={`w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Expandable Details Container */}
                    <div 
                      className={`transition-all duration-500 ease-in-out border-slate-50 ${
                        isExpanded ? 'max-h-[800px] border-t p-6 sm:p-8 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* Mobile Description */}
                      <p className="text-slate-500 font-medium text-sm mb-6 sm:hidden leading-relaxed">
                        {sec.desc}
                      </p>

                      <div className="space-y-4">
                        {sec.details.map((detail, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-slate-50 transition-colors duration-300">
                            <BulletDotIcon />
                            <p className="text-slate-700 font-medium text-xs sm:text-sm leading-relaxed">
                              {detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[28px] border border-slate-100/80 p-12 text-center max-w-lg mx-auto w-full">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-slate-100">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No matching section found</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Try checking your spelling or search for broader keywords like 'eligibility' or 'limits'.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs hover:bg-blue-100 transition-all"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Legal Action Callout */}
        <div className="mt-16 bg-slate-900 rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800 shadow-xl print:hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-xl">
              <span className="text-blue-400 font-extrabold text-xs tracking-wider uppercase">Agreement Updates</span>
              <h3 className="text-2xl sm:text-3xl font-[900] tracking-tight mt-2 mb-4">Amendments & Updates</h3>
              <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
                Terms of Use are periodically updated to reflect regulatory updates. We provide a 30-day review period before updates become binding on accounts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0">
              <a
                href="mailto:admin@credify.com"
                className="flex items-center justify-center gap-2.5 bg-blue-500 hover:bg-blue-600 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 text-sm shadow-lg shadow-blue-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                admin@credify.com
              </a>
              <a
                href="/about"
                className="flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 text-sm border border-slate-700"
              >
                About Our License
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Revision History Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-[scaleUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-[900] text-slate-900 tracking-tight">Revision History</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1">Terms of Use audit logs</p>
              </div>
              <button 
                onClick={() => setShowRevisionModal(false)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center"
              >
                <CloseIcon />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[350px] overflow-y-auto">
              {[
                { version: 'v1.2', date: 'June 2026', changes: ['Updated wallet account eligibility criteria and integrated biometric validation processes under Central Bank compliance rules.'] },
                { version: 'v1.1', date: 'March 2026', changes: ['Standardized daily transfer limit thresholds and payment processing audit standards for instant transactions.'] },
                { version: 'v1.0', date: 'November 2025', changes: ['Initial publication and deployment of Credify digital terms agreement.'] }
              ].map((rev, rIdx) => (
                <div key={rIdx} className="relative pl-6 border-l-2 border-slate-100 last:border-none">
                  {/* Point Indicator */}
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500" />
                  
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700">{rev.version}</span>
                    <span className="text-xs font-bold text-slate-400">{rev.date}</span>
                  </div>
                  
                  <ul className="mt-2.5 space-y-1.5">
                    {rev.changes.map((change, cIdx) => (
                      <li key={cIdx} className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowRevisionModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 hover:shadow-sm transition-all"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline styles for print layouts and animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          nav, footer, aside, button, input {
            display: none !important;
          }
          .max-h-0 {
            max-h: none !important;
            opacity: 1 !important;
            border-top: 1px solid #cbd5e1 !important;
            padding: 20px 0 !important;
          }
          h3 {
            font-size: 16pt !important;
            margin-top: 25px !important;
            page-break-after: avoid;
          }
          p, li {
            font-size: 10pt !important;
            line-height: 1.6 !important;
          }
        }
      `}</style>
      
      <Footer />
    </div>
  );
};

export default TermsPage;
