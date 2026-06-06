import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';

// Inline premium animated SVG illustration for Privacy & Security
const PrivacyHeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
      {/* Dynamic background glow ring */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#14b8a6]/10 via-[#3b82f6]/10 to-[#6366f1]/15 rounded-full blur-[60px] animate-pulse" />
      
      <svg className="w-full h-full relative z-10" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGrad" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="lockBodyGrad" x1="200" y1="230" x2="300" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>
          <linearGradient id="gridGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Outer rotating security ring */}
        <circle cx="250" cy="250" r="190" stroke="url(#shieldGrad)" strokeWidth="1.5" strokeDasharray="10 20" className="animate-[spin_40s_linear_infinite]" />
        
        {/* Middle pulsing network grid circle */}
        <circle cx="250" cy="250" r="160" stroke="#3b82f6" strokeOpacity="0.15" strokeWidth="2" strokeDasharray="30 15" className="animate-[spin_25s_linear_infinite_reverse]" />

        {/* Security Shield Grid Lines */}
        <path d="M150 250 H350 M250 150 V350 M179 179 L321 321 M179 321 L321 179" stroke="url(#gridGrad)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Digital node circles (Futuristic) */}
        <circle cx="250" cy="150" r="6" fill="#14b8a6" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="250" cy="150" r="4" fill="#14b8a6" />
        <circle cx="350" cy="250" r="4" fill="#0ea5e9" />
        <circle cx="250" cy="350" r="4" fill="#6366f1" />
        <circle cx="150" cy="250" r="4" fill="#14b8a6" />

        {/* Primary Glowing Shield Block */}
        <path
          d="M250 80 C290 80 370 100 370 150 C370 270 280 370 250 400 C220 370 130 270 130 150 C130 100 210 80 250 80 Z"
          fill="url(#shieldGrad)"
          fillOpacity="0.07"
          stroke="url(#shieldGrad)"
          strokeWidth="3.5"
          className="animate-[pulse_4s_ease-in-out_infinite]"
        />

        {/* Floating Golden Lock */}
        <g className="animate-[translateY_5s_ease-in-out_infinite]" style={{ transform: 'translateY(-10px)' }}>
          {/* Lock Shackle */}
          <path
            d="M210 240 V200 C210 170 225 155 250 155 C275 155 290 170 290 200 V240"
            stroke="#14b8a6"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          {/* Glowing core shackle highlight */}
          <path
            d="M210 240 V200 C210 170 225 155 250 155 C275 155 290 170 290 200 V240"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.7"
          />
          {/* Lock Body */}
          <rect x="185" y="235" width="130" height="95" rx="20" fill="url(#lockBodyGrad)" stroke="#0ea5e9" strokeWidth="3" />
          {/* Lock Hole & Key Entry */}
          <circle cx="250" cy="275" r="8" fill="#0f172a" />
          <path d="M250 283 L250 302" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
      
      {/* Premium floating glass badge */}
      <div className="absolute bottom-4 bg-white/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-100/60 shadow-[0_15px_35px_rgba(20,184,166,0.12)] flex items-center gap-3 animate-[float_4s_ease-in-out_infinite] pointer-events-none">
        <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-800 tracking-wide uppercase">AES-256 Encrypted</span>
      </div>
    </div>
  );
};

const BulletCheckIcon = () => (
  <svg className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

const PrivacyPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'data-collection': true, // Expand first card by default
  });
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  const sections = [
    {
      id: 'data-collection',
      title: 'Data Collection',
      desc: 'We gather only essential data to offer secure banking services and improve your platform experience.',
      details: [
        'Personal identifiers (Legal Name, National ID, Address, Contact details).',
        'Financial information (Transactions, transfers, card statements, loan approvals).',
        'Device and connectivity metrics (IP address, operating system, geolocation logs).'
      ],
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'data-encryption',
      title: 'Data Protection & Encryption',
      desc: 'Your financial information is secured with industry-leading encryption and key protection layers.',
      details: [
        'AES-256 grade encryption for all static database files and assets.',
        'TLS 1.3 cryptographic protocols for secure data transfer in transit.',
        'High-security hardware modules (HSM) to isolate encryption keys.'
      ],
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      id: 'account-security',
      title: 'Account Security',
      desc: 'We enforce stringent access protocols to keep your account shielded from unauthorized attempts.',
      details: [
        'Mandatory Multi-Factor Authentication (MFA) on suspicious logins.',
        'Support for modern biometric keys (FaceID / TouchID) on mobile devices.',
        'Instant session timeouts and real-time transaction alerts.'
      ],
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 'cookies-analytics',
      title: 'Cookies & Analytics',
      desc: 'We utilize minimal tracking parameters to maintain security integrity and improve platform layout.',
      details: [
        'Secure session identifiers that automatically clear upon logging out.',
        'Performance telemetry to identify system bottlenecks and prevent crashes.',
        'Zero tracking algorithms for marketing networks or third-party ads.'
      ],
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    },
    {
      id: 'third-party',
      title: 'Third-Party Services',
      desc: 'We integrate with regulated compliance vendors and banking processors under strict guidelines.',
      details: [
        'Card processing networks (Visa, Mastercard) to clear transaction streams.',
        'Government KYC hubs (such as Digital Identity) for identity verification.',
        'We never sell, trade, or distribute your telemetry to external advertisers.'
      ],
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'customer-rights',
      title: 'Customer Rights',
      desc: 'You maintain full control and transparency over your stored credentials and transaction logs.',
      details: [
        'Right to export your complete financial footprint in standardized formats.',
        'Right to modify outdated information or request file deletion.',
        'Right to restrict automated risk assessments on your profile.'
      ],
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 text-teal-600 font-extrabold text-[10px] sm:text-xs mb-5 shadow-sm uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Privacy Assurance Verified
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-[900] text-slate-900 mb-5 tracking-tight leading-[1.1]">
              Privacy Policy
            </h1>
            
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl lg:max-w-none mb-7">
              Your trust is our most valuable asset. This policy outlines how Credify collects, processes, and guards your data to deliver secure banking services.
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 font-extrabold text-xs hover:bg-teal-100 hover:shadow-sm transition-all duration-300"
              >
                Revision History (v1.2)
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full lg:w-5/12 flex justify-center">
            <PrivacyHeroIllustration />
          </div>
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="max-w-[1250px] mx-auto px-6 sm:px-12 py-12 md:py-20 relative">
        
        {/* Sticky Search bar container (Desktop / Mobile combined) */}
        <div className="mb-10 relative z-20 max-w-2xl mx-auto lg:mx-0 print:hidden">
          <div className="relative flex items-center bg-white rounded-2xl border border-slate-200/80 shadow-sm p-1.5 focus-within:border-teal-400 focus-within:shadow-[0_10px_30px_rgba(20,184,166,0.06)] transition-all duration-300">
            <div className="pl-4 shrink-0">
              <SearchIcon />
            </div>
            <input 
              type="text" 
              placeholder="Search policy items (e.g., encryption, digital identity)..." 
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
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-700'
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
                        ? 'bg-teal-50 text-teal-700 shadow-sm border-l-4 border-teal-500 font-extrabold translate-x-1' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {sec.title}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right: Policy Content Items */}
          <div className="flex flex-col gap-8 w-full">
            {filteredSections.length > 0 ? (
              filteredSections.map((sec) => {
                const isExpanded = expandedCards[sec.id];
                return (
                  <div
                    key={sec.id}
                    id={sec.id}
                    ref={(el) => { sectionRefs.current[sec.id] = el; }}
                    className="bg-white rounded-[28px] border border-slate-100/80 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:border-teal-200 hover:shadow-[0_15px_45px_rgba(20,184,166,0.04)] transition-all duration-500 overflow-hidden"
                  >
                    {/* Header bar / Toggle Button */}
                    <div
                      onClick={() => toggleCard(sec.id)}
                      className="p-6 sm:p-8 flex items-center justify-between gap-5 cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors duration-500 shrink-0">
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
                      <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-teal-200 transition-all duration-300">
                        <svg 
                          className={`w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} 
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
                            <BulletCheckIcon />
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
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Try checking your spelling or search for broader keywords like 'data' or 'security'.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 font-bold text-xs hover:bg-teal-100 transition-all"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Card Section */}
        <div className="mt-16 bg-slate-900 rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden border border-slate-800 shadow-xl print:hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(14,165,233,0.12)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-xl">
              <span className="text-teal-400 font-extrabold text-xs tracking-wider uppercase">Contact Information</span>
              <h3 className="text-2xl sm:text-3xl font-[900] tracking-tight mt-2 mb-4">Questions about your data?</h3>
              <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed">
                Our Data Protection Officer (DPO) is dedicated to addressing your privacy inquiries or legal concerns. Contact us anytime.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0">
              <a
                href="mailto:privacy@credify.com"
                className="flex items-center justify-center gap-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 text-sm shadow-lg shadow-teal-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                privacy@credify.com
              </a>
              <a
                href="tel:0227570574"
                className="flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 text-sm border border-slate-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Legal Hub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Revision History Modal (Glassmorphic) */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-[scaleUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-[900] text-slate-900 tracking-tight">Revision History</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1">Privacy Policy audit logs</p>
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
                { version: 'v1.2', date: 'June 2026', changes: ['Added data compliance controls and identity verification integrations for Egypt\'s National Digital Identity platform.'] },
                { version: 'v1.1', date: 'January 2026', changes: ['Upgraded communication channels and database storage standard, enforcing TLS 1.3 encryption by default.'] },
                { version: 'v1.0', date: 'November 2025', changes: ['Initial publication and deployment of Credify banking customer privacy framework.'] }
              ].map((rev, rIdx) => (
                <div key={rIdx} className="relative pl-6 border-l-2 border-slate-100 last:border-none">
                  {/* Point Indicator */}
                  <div className="absolute -left-1.5 top-1.5 w-2.5 h-2.5 rounded-full bg-teal-500" />
                  
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-teal-50 text-teal-700">{rev.version}</span>
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

      {/* Inline styles for custom printer print styles and animations */}
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

export default PrivacyPage;
