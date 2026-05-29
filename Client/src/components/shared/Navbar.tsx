import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import myImage from '../../assets/Transparent Logo.png';

const Navbar: React.FC = () => {
  const [isOverFooter, setIsOverFooter] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${isOverFooter ? 'bg-transparent border-transparent' : 'bg-white/30 backdrop-blur-md border-b border-white/20'
        }`}>
        <nav className="flex justify-between items-center px-6 lg:px-12 py-4 max-w-7xl mx-auto relative">

          <Link to="/" className="flex items-center h-16 cursor-pointer z-[110]">
            <img
              src={myImage}
              alt="Credify Bank"
              className={`h-20 sm:h-24 md:h-28 w-auto object-contain transition-all duration-300 hover:scale-[2.4] scale-[2.2] -my-16 relative ${isOverFooter ? 'brightness-0 invert' : ''
                }`}
            />
            <div id="fallback-logo" className={`hidden text-2xl font-bold tracking-tight ${isOverFooter ? 'text-white' : 'text-slate-800'}`}>
              Credify
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {['Home', 'Payments', 'About'].map((item) => {
              const className = `font-medium transition-colors duration-500 relative group ${isOverFooter ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`;
              const children = (
                <>
                  {item}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${isOverFooter ? 'bg-white' : 'bg-gradient-to-r from-[#4ade80] to-[#3b82f6]'
                    }`}></span>
                </>
              );

              return (
                <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className={className}>
                  {children}
                </Link>
              );
            })}
          </div>

          {/* Desktop Navigation Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className={`px-6 py-2.5 border-2 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 flex items-center justify-center ${isOverFooter
              ? 'border-white text-white hover:bg-white hover:text-slate-900'
              : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
              }`}>
              Login
            </Link>
            <Link to="/register" className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 flex items-center justify-center border-2 ${isOverFooter
              ? 'bg-white text-slate-900 border-white hover:bg-transparent hover:text-white'
              : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:border-slate-800'
              }`}>
              Become a Customer
            </Link>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-slate-900/5 border border-slate-900/10 backdrop-blur-sm z-[110] relative focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`h-0.5 w-full bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-0.5 w-full bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`h-0.5 w-full bg-slate-900 rounded-full transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>

        </nav>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[95] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[350px] bg-white shadow-2xl z-[98] lg:hidden flex flex-col pt-32 px-8 pb-10 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col gap-6 mb-12">
          {['Home', 'Payments', 'About'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-2xl font-bold text-slate-800 hover:text-[#22c55e] transition-colors py-2 border-b border-slate-100"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <Link
            to="/login"
            className="w-full py-4 text-center border-2 border-slate-900 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-900 hover:text-white transition-colors duration-300 active:scale-95"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="w-full py-4 text-center bg-slate-900 border-2 border-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-[#22c55e] hover:border-[#22c55e] transition-colors duration-300 active:scale-95 shadow-lg"
          >
            Become a Customer
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;