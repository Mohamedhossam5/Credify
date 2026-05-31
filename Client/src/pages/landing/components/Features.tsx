import React, { useEffect, useState, useRef } from 'react';

const Features: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const triggerPoint = window.innerHeight / 2;
      const distanceFromTop = triggerPoint - rect.top;
      const totalHeight = rect.height;

      let percentage = (distanceFromTop / totalHeight) * 100;
      percentage = Math.min(Math.max(percentage, 0), 100);

      setScrollProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <main className="pt-24 min-h-screen bg-surface">
      <section className="relative w-full max-w-7xl mx-auto py-16 md:py-32 px-6 sm:px-8 flex flex-col items-center">
        <div className="text-center mb-24 md:mb-48 relative z-10">
          <h1 className="text-primary-container text-4xl md:text-6xl font-extrabold tracking-tight">
            Smart Banking. Built for You.
          </h1>
        </div>

        <div ref={containerRef} className="relative w-full flex flex-col items-center">
          {/* Timeline Axis */}
          <div className="absolute inset-0 flex justify-start md:justify-center pl-[31px] md:pl-0 pointer-events-none">
            <div className="precision-axis w-[2px] relative h-full">
              <div
                className="absolute top-0 left-0 w-[2px] bg-gradient-to-b from-primary-container to-[#00d2d3] transition-[height] duration-150 ease-out z-[1]"
                style={{ height: `${scrollProgress}%` }}
              >
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#00d2d3] rounded-full shadow-[0_0_10px_#00d2d3]"></div>
              </div>
            </div>
          </div>

          {/* Milestone 1 */}
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-24 md:mb-64 items-center">
            <div className="hidden md:block"></div>
            <div className="flex items-start gap-8 group">
              <div className="absolute left-[32px] md:left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                1
              </div>
              <div className="flex flex-col gap-4 pl-16 md:pl-20">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-container mb-2">Instant Transactions</h3>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                  Transfer, pay, and manage your money in real time with lightning-fast processing.
                </p>
              </div>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-24 md:mb-64 items-center">
            <div className="flex flex-col items-start md:items-end gap-4 pl-16 pr-0 md:pl-0 md:pr-20 text-left md:text-right group">
              <div className="absolute left-[32px] md:left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                2
              </div>
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">psychology</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-container mb-2">Smart AI Insights</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-md ml-0 md:ml-auto">
                Powered by intelligent AI, get personalized insights into your spending patterns.
              </p>
            </div>
            <div className="hidden md:block"></div>
          </div>

          {/* Milestone 3 */}
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-24 md:mb-64 items-center">
            <div className="hidden md:block"></div>
            <div className="flex items-start gap-8 group">
              <div className="absolute left-[32px] md:left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                3
              </div>
              <div className="flex flex-col gap-4 pl-16 md:pl-20">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-3xl">lock</span>
                </div>
                <h3 className="text-2xl font-bold text-primary-container mb-2">Advanced Security</h3>
                <p className="text-on-surface-variant leading-relaxed max-w-md">
                  Bank-grade encryption and biometric authentication to keep your assets safe.
                </p>
              </div>
            </div>
          </div>

          {/* Milestone 4 */}
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 mb-16 md:mb-32 items-center">
            <div className="flex flex-col items-start md:items-end gap-4 pl-16 pr-0 md:pl-0 md:pr-20 text-left md:text-right group">
              <div className="absolute left-[32px] md:left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                4
              </div>
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">tune</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-container mb-2">Full Card Control</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-md ml-0 md:ml-auto">
                Enable or disable payments instantly with a single tap in your app.
              </p>
            </div>
            <div className="flex justify-start pl-16 md:pl-20">
              <div className="bg-transparent rounded-xl py-4 sm:py-8 w-full max-w-md flex justify-start md:justify-center items-center relative h-[240px] xs:h-[280px] sm:h-[300px]">
                {/* Pure CSS Card matching the Hero section */}
                <div className="bg-gradient-to-br from-[#2d2d2d] to-black shadow-[30px_30px_70px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform duration-500 w-[280px] h-[170px] xs:w-[300px] xs:h-[185px] sm:w-[340px] sm:h-[210px] md:w-[300px] md:h-[185px] lg:w-[380px] lg:h-[230px] rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-5 xs:p-6 sm:p-8 text-white flex flex-col justify-between overflow-hidden border border-white/10 relative group">
                  {/* Card Gloss/Reflection */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem]"></div>

                  {/* Premium Glassmorphic Emerald Lock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-emerald-950/40 backdrop-blur-[6px] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] w-[70px] h-[75px] xs:w-[80px] xs:h-[85px] sm:w-[90px] sm:h-[95px] relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:border-emerald-400/50 group-hover:shadow-[0_0_50px_rgba(16,185,129,0.45)]">
                      <svg className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 text-emerald-400 drop-shadow-[0_2px_8px_rgba(52,211,153,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="3" ry="3" fill="currentColor" fillOpacity="0.15" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                        <path d="M12 17.5V20" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-lg xs:text-xl sm:text-2xl font-extrabold tracking-tighter italic">
                      Credify
                    </span>
                    <div className="w-10 h-7 xs:w-12 xs:h-8 sm:w-14 sm:h-10 bg-yellow-500/20 rounded-lg xs:rounded-xl border border-yellow-500/30 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-6 h-4 xs:w-8 xs:h-6 bg-yellow-600/40 rounded-sm xs:rounded-md"></div>
                    </div>
                  </div>
                  <div className="relative z-10 mt-auto pt-6">
                    <p className="tracking-widest text-sm xs:text-base sm:text-xl font-medium mb-1 xs:mb-2 shadow-sm blur-[5px] select-none">
                      1234 5678 9101 0000
                    </p>
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] xs:text-xs sm:text-sm opacity-60 uppercase tracking-widest font-light">
                        CARDHOLDER NAME
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center w-full mt-12 md:mt-24">
          <img
            src="/Gemini_Generated_Image_q3e0c7q3e0c7q3e0.png"
            alt="App Illustration"
            className="w-[90%] sm:w-[70%] md:w-[60%] h-auto block mx-auto object-cover rounded-xl shadow-lg"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </section>
    </main>
  );
};

export default Features;
