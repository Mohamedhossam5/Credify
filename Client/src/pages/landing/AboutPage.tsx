import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import nadyPhoto from '../../assets/team/nady.jpeg';
import mohamedPhoto from '../../assets/team/mohamed.png';
import hossPhoto from '../../assets/team/hoss.png';
import karimPhoto from '../../assets/team/karim.png';
import yehiaPhoto from '../../assets/team/yehia1.png';
import zedPhoto from '../../assets/team/zed.png';
import digitalIdentityImg from '../../assets/digital-identity-egypt.png';

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Mohamed Badawy',
      role: 'Team Leader & Backend Developer',
      photo: mohamedPhoto,
    },

    {
      name: 'Mohamed Hossam',
      role: 'Backend Developer',
      photo: hossPhoto,
    },
    {
      name: 'Mahmoud Nady',
      role: 'Frontend Developer',
      photo: nadyPhoto,
    },
    {
      name: 'Karim Akram',
      role: 'Frontend Developer',
      photo: karimPhoto,
    },
    {
      name: 'Yehia Khatab',
      role: 'Business Analyst',
      photo: yehiaPhoto,
    },
    {
      name: 'Mostafa Yasser',
      role: 'System Analyst',
      photo: zedPhoto,
    }
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-[140px] md:pt-[200px] pb-16 md:pb-24 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-[900] text-slate-900 mb-6 tracking-tighter">
            About <span className="text-blue-600">Credify</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            We are redefining the future of banking. At Credify, we believe financial services should be seamless, transparent, and built entirely around the human experience.
          </p>
        </div>
      </div>

      {/* Eligibility Section */}
      <div className="py-16 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <div className="bg-[#E0F2FE] rounded-3xl p-6 sm:p-10 md:p-14 border border-[#DCFCE7] shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 mb-6 tracking-tight">Who is eligible to join Credify?</h2>
            <p className="text-base sm:text-lg text-slate-600 mb-10 leading-relaxed max-w-3xl">
              Opening a Credify account is fast and completely digital. To ensure a secure environment for all our users and comply with financial regulations, you must meet a few simple requirements:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Age Requirement', desc: 'You must be at least 18 years old to open a primary account.' },
                { title: 'Valid Identity', desc: 'A valid, non-expired government-issued ID (National ID or Passport).' },
                { title: 'Supported Residency', desc: 'You must reside in a country currently supported by our infrastructure.' },
                { title: 'Clean Financial Record', desc: 'No history of fraud or previous suspensions on our banking network.' }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 sm:gap-5 items-start bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 mb-1.5">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Egyptian Digital Identity Section */}
            <div className="mt-8 md:mt-12 bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 border border-blue-100 shadow-lg transition-all duration-300 hover:shadow-xl">
              {/* Top Row: Image & Hero Text */}
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                <div className="lg:w-5/12 w-full shrink-0 flex justify-center">
                  <div className="relative group max-w-xs sm:max-w-sm w-full">
                    {/* Decorative glowing background */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative rounded-2xl overflow-hidden shadow-md border-4 border-white hover:scale-[1.02] transition-transform duration-300">
                      <img
                        src={digitalIdentityImg}
                        alt="Egypt Digital Identity Application - الهوية الرقمية"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:w-7/12 w-full flex flex-col justify-center">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-4 tracking-wide uppercase self-start shadow-sm">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    🇪🇬 National Initiative
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-[900] text-slate-900 tracking-tight leading-tight mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Egypt's Digital Identity</span>
                    <span className="text-blue-600 font-extrabold text-lg sm:text-xl font-sans bg-blue-50/50 px-2.5 py-0.5 rounded-lg border border-blue-100/50"> الهوية الرقمية </span>
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
                    Egypt has launched its groundbreaking <strong>Digital Identity</strong> application — a major national initiative that enables citizens to verify their identity digitally using a secure, government-backed platform. This is a game-changer for digital banking and financial services.
                  </p>
                  
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                    For <strong>Credify</strong>, the Digital Identity app plays a critical role in securing digital banking. It strengthens our Know Your Customer (KYC) verification process by providing a trusted, tamper-proof digital identity that is directly linked to Egypt's national civil registry.
                  </p>
                </div>
              </div>

              {/* Separator Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent my-8 md:my-10" />

              {/* Bottom Row: Benefits Grid */}
              <div className="mb-8">
                <div className="text-center mb-8">
                  <h4 className="text-xs sm:text-sm font-extrabold text-blue-600 uppercase tracking-widest">Key Integration Benefits</h4>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">How this national partnership elevates your digital banking experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {[
                    {
                      title: 'Instant Identity Verification',
                      desc: 'Faster and more reliable identity verification during account opening, reducing waiting time to seconds.',
                      icon: (
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ),
                      bg: 'bg-blue-50 border-blue-100'
                    },
                    {
                      title: 'Zero Document Fraud',
                      desc: 'Complete elimination of forged, altered, or expired physical document risks with secure registry syncing.',
                      icon: (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ),
                      bg: 'bg-emerald-50 border-emerald-100'
                    },
                    {
                      title: 'Biometric-Backed Security',
                      desc: 'Stronger fraud prevention through high-grade government biometric-backed multi-factor authentication.',
                      icon: (
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 12.201V12a3 3 0 11-6 0c0-1.605.62-3.066 1.637-4.148m15.863 3.14a14.026 14.026 0 00-2.283-3.547M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      bg: 'bg-purple-50 border-purple-100'
                    },
                    {
                      title: 'Central Bank Compliance',
                      desc: 'Seamless, automated compliance with all Central Bank of Egypt regulations and national financial protocols.',
                      icon: (
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ),
                      bg: 'bg-amber-50 border-amber-100'
                    },
                    {
                      title: 'National Financial Inclusion',
                      desc: 'Creating an accessible, modern financial ecosystem for all Egyptian citizens, regardless of location.',
                      icon: (
                        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ),
                      bg: 'bg-rose-50 border-rose-100',
                      isFullWidth: true
                    }
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-4 items-start p-5 rounded-2xl bg-white border border-slate-100/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-100/50 hover:-translate-y-0.5 transition-all duration-300 ${benefit.isFullWidth ? 'md:col-span-2' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${benefit.bg}`}>
                        {benefit.icon}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-sm sm:text-base mb-1.5">{benefit.title}</h5>
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                <a
                  href="https://di.gov.eg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Digital Identity Portal
                </a>
              </div>
            </div>

            <div className="mt-10 p-5 bg-white/60 rounded-xl border border-blue-200/50 text-center">
              <p className="text-slate-600 text-xs sm:text-[15px] font-medium leading-relaxed">
                For more details on financial regulations, please visit the{' '}
                <a
                  href="https://www.cbe.org.eg/ar/financial-literacy/learn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-300 hover:decoration-blue-600 transition-colors"
                >
                  Central Bank of Egypt
                </a>
                {' '}site.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 md:py-24 max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Meet the Team</h2>
          <p className="text-base sm:text-lg text-slate-500">The brilliant minds behind your seamless banking experience.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {team.map((member, idx) => (
            <div key={idx} className="group flex flex-col items-center text-center">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden mb-6 shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-4 text-sm sm:text-base">{member.role}</p></div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
