import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <div className="relative min-h-screen -mt-[300px] pt-[400px] overflow-hidden">

      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          <path
            d="M1440 0C1300 0 1100 100 1050 300C1000 500 1200 700 1440 800V0Z"
            fill="#DCFCE7"
            fillOpacity="0.8"
          />
          <path
            d="M0 900C150 900 350 820 400 600C450 380 250 200 0 150V900Z"
            fill="#E0F2FE"
            fillOpacity="0.9"
          />
        </svg>
      </div>

      <main className="max-w-7xl mx-auto px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div className="lg:pl-16">
          {/* العنوان بتنسيق Black & Tight */}
          <h1 className="text-[85px] font-[900] text-slate-900 leading-[0.9] mb-8 tracking-tighter">
            Banking <br />
            <span className="bg-gradient-to-r from-[#4ade80] via-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">
              Made Human.
            </span>
          </h1>

          {/* الباراجراف مع انيميشن growing الخطير */}
          <p className="text-[22px] text-slate-500 mb-12 font-medium max-w-xl leading-relaxed">
            Stop fighting your bank. Start
            <span className="relative inline-block font-[900] text-slate-900 mx-2 group">
              <span className="relative z-10">growing</span>
              <svg
                className="absolute -bottom-1 left-0 w-full h-4 overflow-visible pointer-events-none"
                viewBox="0 0 100 20"
                fill="none"
              >
                <path
                  d="M0 15 Q 25 15, 40 10 T 80 5 T 100 0"
                  stroke="url(#growth-gradient-hero)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-draw-path"
                  style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
                />
                <defs>
                  <linearGradient id="growth-gradient-hero" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            with a seamless digital experience.
          </p>

          <div className="flex gap-5">
            {/* الزرار مع تأثير الـ Shine */}
            <Link to="/login" className="group relative overflow-hidden flex items-center gap-4 bg-slate-900 px-10 py-5 rounded-full font-bold text-white text-lg transition-all duration-300 active:scale-95 shadow-xl hover:bg-[#22c55e]">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1s_ease-in-out] pointer-events-none"></span>
              <span className="relative z-10">Get Started</span>
              <div className="relative z-10 w-10 h-10 bg-white/10 rounded-full flex justify-center items-center transition-all duration-300 group-hover:rotate-45 group-hover:bg-white/20">
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </div>
            </Link>
          </div>
        </div>

        {/* قسم الكروت بتأثيرات الـ Floating */}
        <div className="relative h-[550px] flex justify-center items-center">
          {/* White Card (Back) */}
          <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] z-[5] animate-float-card-secondary absolute w-[380px] h-[230px] rounded-[2.5rem] p-8 flex flex-col justify-end translate-x-12 translate-y-12">
            <p className="text-slate-400 tracking-widest font-medium text-lg">
              0000 0000 0000 0000
            </p>
            <p className="text-slate-400 text-sm mt-1 uppercase font-semibold">Mahmoud Nady</p>
          </div>

          {/* Black Card (Front) */}
          <div className="bg-gradient-to-br from-[#2d2d2d] to-black shadow-[30px_30px_70px_rgba(0,0,0,0.35)] z-10 animate-float-card absolute w-[380px] h-[230px] rounded-[2.5rem] p-8 text-white flex flex-col justify-between overflow-hidden border border-white/10">
            <div className="flex justify-between items-start">
              <span className="text-2xl font-extrabold tracking-tighter italic">
                Credify
              </span>
              <div className="w-14 h-10 bg-yellow-500/20 rounded-xl border border-yellow-500/30 backdrop-blur-sm flex items-center justify-center">
                <div className="w-8 h-6 bg-yellow-600/40 rounded-md"></div>
              </div>
            </div>
            <div>
              <p className="tracking-widest text-xl font-medium mb-3">
                0000 0000 0000 0000
              </p>
              <div className="flex justify-between items-end">
                <p className="text-sm opacity-60 uppercase tracking-widest font-light">
                  Mahmoud Nady
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;