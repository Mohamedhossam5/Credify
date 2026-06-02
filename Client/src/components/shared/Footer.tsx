import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-f-dark text-white pt-20 md:pt-[120px] pb-10 md:pb-[50px] relative z-[1] mt-24 overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,transparent_70%)] -top-[200px] -left-[200px] -z-[1]"></div>
      <div className="max-w-[1300px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] bg-f-border rounded-[32px] overflow-hidden border border-f-border mb-[60px] md:mb-[100px]">
          <div className="bg-f-dark p-6 sm:p-10 flex items-center gap-5 transition-all duration-500 cursor-pointer hover:bg-white/5 group">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#14b8a61a] to-[#0ea5e91a] rounded-[20px] flex justify-center items-center text-[22px] text-f-primary border border-[#14b8a633] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-f-primary group-hover:text-white shrink-0">
              <svg className="w-6 h-6 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-1">Chat with us</h5>
              <p className="text-slate-300 text-sm">admin@credify.com</p>
            </div>
          </div>
          <div className="bg-f-dark p-6 sm:p-10 flex items-center gap-5 transition-all duration-500 cursor-pointer hover:bg-white/5 group">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#14b8a61a] to-[#0ea5e91a] rounded-[20px] flex justify-center items-center text-[22px] text-f-primary border border-[#14b8a633] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-f-primary group-hover:text-white shrink-0">
              <svg className="w-6 h-6 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-1">24/7 Hotline</h5>
              <p className="text-slate-300 text-sm">02 27570574</p>
            </div>
          </div>
          <div className="bg-f-dark p-6 sm:p-10 flex items-center gap-5 transition-all duration-500 cursor-pointer hover:bg-white/5 group">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#14b8a61a] to-[#0ea5e91a] rounded-[20px] flex justify-center items-center text-[22px] text-f-primary border border-[#14b8a633] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-f-primary group-hover:text-white shrink-0">
              <svg className="w-6 h-6 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-1">Secure HQ</h5>
              <p className="text-slate-300 text-sm">Smart Village, Giza, Egypt</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 md:gap-20 mb-16 md:mb-20">
          <div className="col-span-2 md:col-span-1">
            <p className="text-f-text-dim text-base leading-[1.8] mb-[30px]">
              Redefining the digital banking landscape with secure, transparent, and ultra-fast financial solutions for the next generation.
            </p>
            <div>
              <h6 className="text-white mb-[15px] font-bold">Subscribe to updates</h6>
              <div className="flex bg-f-glass-white border border-f-border rounded-full p-1.5 focus-within:border-f-primary transition-colors">
                <input type="email" placeholder="Your Email" className="bg-transparent border-none py-2.5 px-5 text-white outline-none flex-grow text-sm w-full min-w-0" />
                <button className="bg-f-primary text-white border-none w-[45px] h-[45px] rounded-full cursor-pointer transition-all duration-300 hover:bg-f-secondary hover:rotate-45 flex justify-center items-center shrink-0">
                  <svg className="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[15px] font-extrabold mb-6 md:mb-[35px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">QUICK LINKS</h4>
            <ul className="list-none p-0 m-0 space-y-4">
              <li><Link to="/" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Home</Link></li>
              <li><Link to="/payments" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Payments</Link></li>
              <li><Link to="/about" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[15px] font-extrabold mb-6 md:mb-[35px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">ACCOUNT</h4>
            <ul className="list-none p-0 m-0 space-y-4">
              <li><Link to="/login" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Login</Link></li>
              <li><Link to="/register" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[15px] font-extrabold mb-6 md:mb-[35px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">LEGAL</h4>
            <ul className="list-none p-0 m-0 space-y-4">
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Privacy Policy</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-f-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center">
            <p className="text-f-text-dim text-sm m-0">© 2026 Credify Bank Inc. Designed for the Future.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-f-text-dim no-underline text-[13px] hover:text-white transition-colors">English (US)</a>
            <a href="#" className="text-f-text-dim no-underline text-[13px] hover:text-white transition-colors">Global Hub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
