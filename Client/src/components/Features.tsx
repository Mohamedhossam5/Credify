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
      <section className="relative w-full max-w-7xl mx-auto py-32 px-8 flex flex-col items-center">
        <div className="text-center mb-48 relative z-10">
          <h1 className="text-primary-container text-5xl md:text-6xl font-extrabold tracking-tight">
            Smart Banking. Built for You.
          </h1>
        </div>
        
        <div ref={containerRef} className="relative w-full flex flex-col items-center">
          {/* Timeline Axis */}
          <div className="absolute inset-0 flex justify-center pointer-events-none">
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
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-16 mb-64 items-center">
            <div className="hidden md:block"></div>
            <div className="flex items-start gap-8 group">
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                1
              </div>
              <div className="flex flex-col gap-4 pl-12 md:pl-20">
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
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-16 mb-64 items-center">
            <div className="flex flex-col items-end gap-4 pr-12 md:pr-20 text-right group">
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                2
              </div>
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">psychology</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-container mb-2">Smart AI Insights</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-md ml-auto">
                Powered by intelligent AI, get personalized insights into your spending patterns.
              </p>
            </div>
            <div className="hidden md:block"></div>
          </div>

          {/* Milestone 3 */}
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-16 mb-64 items-center">
            <div className="hidden md:block"></div>
            <div className="flex items-start gap-8 group">
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                3
              </div>
              <div className="flex flex-col gap-4 pl-12 md:pl-20">
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
          <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-24 mb-32 items-center">
            <div className="flex flex-col items-end gap-4 pr-12 md:pr-20 text-right group">
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold z-20 border-4 border-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                4
              </div>
              <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-3xl">tune</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-container mb-2">Full Card Control</h3>
              <p className="text-on-surface-variant leading-relaxed max-w-md ml-auto">
                Enable or disable payments instantly with a single tap in your app.
              </p>
            </div>
            <div className="flex justify-start pl-12 md:pl-20">
              <div className="bg-surface-container rounded-xl p-12 w-full max-w-md transition-transform duration-500 hover:scale-[1.02]">
                <img
                  alt="Secure Credify banking card"
                  className="w-full h-auto drop-shadow-2xl"
                  src="https://lh3.googleusercontent.com/aida/ADBb0ujz06N2oAxmcHupDpz5FxyxihlJCEO1VkdlJnFwD8lH0A8S99Js6t_7syEOYAtBG104rO3rVnrp_942w2QzyeuyKX3VU0w3sJVzASD9WDm4yYe1SVWhGUhOaWZyrFRAIbfpq1jv-imDCyP1mkmDtalj33mgKBVPi9WF99BCaySL4rhlikHxxbaONHU0xYnJwYV-eICKdBN2aLbtDp63qdPkPUvlNJ36nHpIRLAUVanm3nJ8kCCRjBZwCkJZwYIaI3qXaqmtqt6TPw"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <img
            src="/Gemini_Generated_Image_q3e0c7q3e0c7q3e0.png"
            alt="App Illustration"
            className="w-[60%] h-auto block mx-auto object-cover rounded-xl shadow-lg"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </section>
    </main>
  );
};

export default Features;
