import React, { useState } from 'react';

// Locally declared SVG icons for 100% reliability and zero-dependency rendering
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const LandmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="22" x2="21" y2="22" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 2 7 22 7 12 2" />
  </svg>
);

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="w-full max-w-[1250px] mx-auto px-6 sm:px-12 py-16 md:py-24 animate-[fadeIn_1s_ease-out]">
      <div className="text-left mb-[40px] md:mb-[50px]">
        <h1 className="text-[clamp(32px,5vw,48px)] text-dark font-extrabold tracking-tight">Let's Connect</h1>
        <p className="text-slate-500 text-lg mt-2.5">Have a question or just want to say hi? We're here for you.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10">
        <div className="bg-white p-6 sm:p-11 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/5 relative">
          <div className="text-[22px] text-dark mb-[30px] font-bold flex items-center gap-2.5">
            <span className="w-[30px] h-1 bg-accent rounded-sm"></span> Send a Message
          </div>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-6 group flex items-center">
              <UserIcon className="absolute left-5 text-slate-400 w-5 h-5 transition-all duration-400 group-focus-within:text-accent" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Full Name"
                required
                className="w-full p-[18px] pr-5 pl-[55px] border-2 border-slate-100 rounded-2xl bg-slate-50 text-base text-dark outline-none transition-all duration-400 focus:border-accent focus:bg-white focus:shadow-[0_10px_20px_rgba(20,184,166,0.08)]"
              />
            </div>
            <div className="relative mb-6 group flex items-center">
              <MailIcon className="absolute left-5 text-slate-400 w-5 h-5 transition-all duration-400 group-focus-within:text-accent" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full p-[18px] pr-5 pl-[55px] border-2 border-slate-100 rounded-2xl bg-slate-50 text-base text-dark outline-none transition-all duration-400 focus:border-accent focus:bg-white focus:shadow-[0_10px_20px_rgba(20,184,166,0.08)]"
              />
            </div>
            <div className="relative mb-6 group flex items-start">
              <SendIcon className="absolute left-5 top-5 text-slate-400 w-5 h-5 transition-all duration-400 group-focus-within:text-accent" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                className="w-full h-[200px] resize-none p-[18px] pr-5 pl-[55px] border-2 border-slate-100 rounded-2xl bg-slate-50 text-base text-dark outline-none transition-all duration-400 focus:border-accent focus:bg-white focus:shadow-[0_10px_20px_rgba(20,184,166,0.08)]"
              ></textarea>
            </div>
            <button type="submit" className="w-full p-5 bg-dark text-white border-none rounded-2xl text-lg font-bold cursor-pointer transition-all duration-400 flex justify-center items-center gap-3 hover:bg-accent hover:scale-[1.02] hover:shadow-[0_15px_30px_rgba(20,184,166,0.3)] group">
              Send Message <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
          <div className="mt-[30px] flex gap-[15px]">
            <a href="https://www.facebook.com/mahmoud.nadykahraba.5" target="_blank" rel="noopener noreferrer" className="w-[45px] h-[45px] rounded-xl bg-slate-100 flex justify-center items-center text-dark no-underline transition-all duration-400 hover:bg-dark hover:text-white">
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a href="" className="w-[45px] h-[45px] rounded-xl bg-slate-100 flex justify-center items-center text-dark no-underline transition-all duration-400 hover:bg-dark hover:text-white">
              <TwitterIcon className="w-5 h-5" />
            </a>
            <a href="https://www.linkedin.com/in/mohamed-badawy1/" target="_blank" rel="noopener noreferrer" className="w-[45px] h-[45px] rounded-xl bg-slate-100 flex justify-center items-center text-dark no-underline transition-all duration-400 hover:bg-dark hover:text-white">
              <LinkedinIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-[350px] sm:h-[450px] lg:h-[650px]">
          <div className="absolute top-[20px] left-[20px] right-[20px] sm:top-[30px] sm:left-[30px] sm:right-[30px] bg-white/85 backdrop-blur-[12px] p-[15px] sm:p-[25px] rounded-2xl z-10 border border-white/50 flex justify-between items-center">
            <div>
              <h4 className="text-[16px] sm:text-[18px] text-dark mb-1 font-bold">Helwan University</h4>
              <p className="text-[12px] sm:text-[14px] text-slate-500 flex items-center">
                <MapPinIcon className="inline w-4 h-4 text-accent mr-1 shrink-0" />
                Faculty of BIS, Cairo
              </p>
            </div>
            <a href="#" className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] bg-accent text-white rounded-full flex justify-center items-center no-underline text-[16px] sm:text-[20px] transition-all duration-400 hover:rotate-45 hover:scale-110" title="Get Directions">
              <ExternalLinkIcon className="w-5 h-5" />
            </a>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] text-center animate-pulse-marker">
            <div className="bg-white px-5 py-2.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex items-center gap-2.5 relative border border-gray-100 after:content-[''] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:border-l-[10px] after:border-l-transparent after:border-r-[10px] after:border-r-transparent after:border-t-[10px] after:border-t-white">
              <div className="bg-[#2b579a] text-white w-8 h-8 rounded-lg flex justify-center items-center shrink-0">
                <LandmarkIcon className="w-5 h-5" />
              </div>
              <div className="font-bold text-[14px] text-dark">Faculty of BIS</div>
            </div>
          </div>
          {/* Custom self-contained CSS for the premium shimmer effect */}
          <style>{`
            @keyframes mapShimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>

          {/* Premium Glassmorphic Map Placeholder & Loading Experience */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-[#f8fafc] flex flex-col justify-center items-center gap-4 z-[4]">
              {/* Animated Moving Shimmer Background */}
              <div
                className="absolute inset-0 bg-[linear-gradient(90deg,#f1f5f9_25%,#e2e8f0_50%,#f1f5f9_75%)] bg-[length:200%_100%] opacity-65"
                style={{ animation: 'mapShimmer 1.6s infinite linear' }}
              />

              {/* Dual Pulsing Locator Rings */}
              <div className="relative flex items-center justify-center z-10">
                <span className="absolute w-16 h-16 bg-accent/20 rounded-full animate-ping" />
                <span className="absolute w-28 h-28 bg-accent/10 rounded-full animate-[ping_2.2s_infinite]" />
                <div className="relative bg-white text-accent w-16 h-16 rounded-2xl flex justify-center items-center shadow-[0_12px_35px_rgba(20,184,166,0.22)] border border-slate-100/50">
                  <MapPinIcon className="w-8 h-8 text-accent animate-bounce" />
                </div>
              </div>

              <div className="text-center z-10 mt-2 px-6">
                <h5 className="text-slate-800 font-extrabold text-sm tracking-wide">Connecting Map Service</h5>
                <p className="text-slate-500 text-[11px] font-medium mt-1 animate-pulse">Establishing encrypted location secure bridge...</p>
              </div>
            </div>
          )}

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.784705024261!2d31.22352692459686!3d30.07170517490986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840fc5cf0dcfb%3A0x5c8b8a3b52b6bcbc!2z2YPZhNmK2Kkg2KfZhNiq2KzYp9ix2Kkg2YjYpdiv2KfYsdipINin2YTYo9i52YXYp9mEINis2KfZhdi52Kkg2K3ZhNmI2KfZhg!5e0!3m2!1sar!2spl!4v1776356006071!5m2!1sar!2spl"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setMapLoaded(true)}
            className={`w-full h-full transition-opacity duration-1000 ease-in-out ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
