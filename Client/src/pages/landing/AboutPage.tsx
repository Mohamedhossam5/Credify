import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import nadyPhoto from '../../assets/team/nady.png';
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
      <div className="relative pt-[200px] pb-24 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-12 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 mb-6 tracking-tighter">
            About <span className="text-blue-600">Credify</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            We are redefining the future of banking. At Credify, we believe financial services should be seamless, transparent, and built entirely around the human experience.
          </p>
        </div>
      </div>

      {/* Eligibility Section */}
      <div className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-12">
          <div className="bg-[#E0F2FE] rounded-3xl p-10 md:p-14 border border-[#DCFCE7] shadow-sm">
            <h2 className="text-3xl font-[900] text-slate-900 mb-6 tracking-tight">Who is eligible to join Credify?</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-3xl">
              Opening a Credify account is fast and completely digital. To ensure a secure environment for all our users and comply with financial regulations, you must meet a few simple requirements:
            </p>
            <ul className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Age Requirement', desc: 'You must be at least 18 years old to open a primary account.' },
                { title: 'Valid Identity', desc: 'A valid, non-expired government-issued ID (National ID or Passport).' },
                { title: 'Supported Residency', desc: 'You must reside in a country currently supported by our infrastructure.' },
                { title: 'Clean Financial Record', desc: 'No history of fraud or previous suspensions on our banking network.' }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-5 items-start bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-10 border border-blue-200/60 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <div className="lg:w-2/5 shrink-0">
                  <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={digitalIdentityImg}
                      alt="Egypt Digital Identity Application - الهوية الرقمية"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="lg:w-3/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-[900] text-slate-900 tracking-tight">
                      🇪🇬 Egypt's Digital Identity Application
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Egypt has launched its groundbreaking <strong>Digital Identity (الهوية الرقمية)</strong> application — a major national initiative that enables citizens to verify their identity digitally using a secure, government-backed platform. This is a game-changer for digital banking and financial services in Egypt.
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    For Credify, the Digital Identity app plays a <strong>critical role in securing digital banking</strong>. It strengthens our Know Your Customer (KYC) verification process by providing a trusted, tamper-proof digital identity that is directly linked to Egypt's national civil registry. This means:
                  </p>
                  <ul className="space-y-2 mb-5">
                    {[
                      'Faster and more reliable identity verification during account opening',
                      'Elimination of forged or expired document risks',
                      'Stronger fraud prevention through biometric-backed authentication',
                      'Seamless compliance with Central Bank of Egypt regulations',
                      'A more inclusive financial ecosystem for all Egyptian citizens'
                    ].map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://di.gov.eg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Digital Identity Portal
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 bg-white/60 rounded-xl border border-blue-200/50 text-center">
              <p className="text-slate-600 text-[15px] font-medium">
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
      <div className="py-24 max-w-7xl mx-auto px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Meet the Team</h2>
          <p className="text-lg text-slate-500">The brilliant minds behind your seamless banking experience.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {team.map((member, idx) => (
            <div key={idx} className="group flex flex-col items-center text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden mb-6 shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-semibold mb-4">{member.role}</p></div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
