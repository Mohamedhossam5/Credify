import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import myImage from '../assets/Transparent Logo.png';

const Navbar: React.FC = () => {
  const [isOverFooter, setIsOverFooter] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverFooter(entry.isIntersecting);
      },
      { 
       
        rootMargin: "-80px 0px -100% 0px", 
        threshold: 0 
      }
    );

    const footer = document.querySelector('footer');
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
      isOverFooter ? 'bg-transparent border-transparent' : 'bg-white/30 backdrop-blur-md border-b border-white/20'
    }`}>
      <nav className="flex justify-between items-center px-12 py-4 max-w-7xl mx-auto">
        
        
        <div className="flex items-center h-16">
          <img
            src={myImage}
            alt="Credify Bank"
            className={`h-28 w-auto object-contain transition-all duration-300 hover:scale-[2.4] scale-[2.2] -my-16 relative ${
              isOverFooter ? 'brightness-0 invert' : '' 
            }`}
          />
          <div id="fallback-logo" className={`hidden text-2xl font-bold tracking-tight ${isOverFooter ? 'text-white' : 'text-slate-800'}`}>
            Credify
          </div>
        </div>

        
        <div className="hidden md:flex items-center gap-10">
          {['Personal', 'Business', 'Payments', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className={`font-medium transition-colors duration-500 relative group ${
                isOverFooter ? 'text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                isOverFooter ? 'bg-white' : 'bg-gradient-to-r from-[#4ade80] to-[#3b82f6]'
              }`}></span>
            </a>
          ))}
        </div>

        
        <Link to="/login" className={`px-8 py-2 border-2 rounded-xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center ${
          isOverFooter 
            ? 'border-white text-white hover:bg-white hover:text-slate-900' 
            : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
        }`}>
          Login
        </Link>

      </nav>
    </header>
  );
};

export default Navbar;