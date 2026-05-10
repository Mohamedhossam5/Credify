import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-f-dark text-white pt-[120px] pb-[50px] relative z-[1] mt-24 overflow-hidden">
      <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,transparent_70%)] -top-[200px] -left-[200px] -z-[1]"></div>
      <div className="max-w-[1300px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] bg-f-border rounded-[32px] overflow-hidden border border-f-border mb-[100px]">
          <div className="bg-f-dark p-10 flex items-center gap-5 transition-all duration-500 cursor-pointer hover:bg-white/5 group">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#14b8a61a] to-[#0ea5e91a] rounded-[20px] flex justify-center items-center text-[22px] text-f-primary border border-[#14b8a633] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-f-primary group-hover:text-white">
              <i className="fa-regular fa-paper-plane"></i>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-1">Chat with us</h5>
              <p className="text-slate-300 text-sm">hello@skillbridge.com</p>
            </div>
          </div>
          <div className="bg-f-dark p-10 flex items-center gap-5 transition-all duration-500 cursor-pointer hover:bg-white/5 group">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#14b8a61a] to-[#0ea5e91a] rounded-[20px] flex justify-center items-center text-[22px] text-f-primary border border-[#14b8a633] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-f-primary group-hover:text-white">
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-1">24/7 Hotline</h5>
              <p className="text-slate-300 text-sm">+91 91813 23 2309</p>
            </div>
          </div>
          <div className="bg-f-dark p-10 flex items-center gap-5 transition-all duration-500 cursor-pointer hover:bg-white/5 group">
            <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#14b8a61a] to-[#0ea5e91a] rounded-[20px] flex justify-center items-center text-[22px] text-f-primary border border-[#14b8a633] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-f-primary group-hover:text-white">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-1">Secure HQ</h5>
              <p className="text-slate-300 text-sm">Global Tech Park, WA</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.2fr] gap-20 mb-20">
          <div>
            <p className="text-f-text-dim text-base leading-[1.8] mb-[30px]">
              Redefining the digital banking landscape with secure, transparent, and ultra-fast financial solutions for the next generation.
            </p>
            <div>
              <h6 className="text-white mb-[15px] font-bold">Subscribe to updates</h6>
              <div className="flex bg-f-glass-white border border-f-border rounded-full p-1.5 focus-within:border-f-primary transition-colors">
                <input type="email" placeholder="Your Email" className="bg-transparent border-none py-2.5 px-5 text-white outline-none flex-grow text-sm" />
                <button className="bg-f-primary text-white border-none w-[45px] h-[45px] rounded-full cursor-pointer transition-all duration-300 hover:bg-f-secondary hover:rotate-45 flex justify-center items-center shrink-0">
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-[15px] font-extrabold mb-[35px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">PLATFORM</h4>
            <ul className="list-none p-0 m-0 space-y-4">
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Digital Card</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Stock Trading</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Crypto Wallet</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Direct Deposit</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] font-extrabold mb-[35px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">RESOURCES</h4>
            <ul className="list-none p-0 m-0 space-y-4">
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Support Center</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">System Status</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Bug Bounty</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-[15px] font-extrabold mb-[35px] bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">LEGAL</h4>
            <ul className="list-none p-0 m-0 space-y-4">
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Privacy Policy</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Terms of Use</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Risk Disclosure</a></li>
              <li><a href="#" className="text-f-text-dim no-underline text-[15px] transition-colors duration-300 hover:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-f-primary after:transition-all after:duration-300 hover:after:w-full">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-f-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4">
            <a href="#" className="w-12 h-12 bg-f-glass-white border border-f-border rounded-2xl flex justify-center items-center text-white no-underline text-lg transition-all duration-500 hover:bg-white hover:text-f-dark hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(20,184,166,0.2)]">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="w-12 h-12 bg-f-glass-white border border-f-border rounded-2xl flex justify-center items-center text-white no-underline text-lg transition-all duration-500 hover:bg-white hover:text-f-dark hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(20,184,166,0.2)]">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="#" className="w-12 h-12 bg-f-glass-white border border-f-border rounded-2xl flex justify-center items-center text-white no-underline text-lg transition-all duration-500 hover:bg-white hover:text-f-dark hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(20,184,166,0.2)]">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
            <a href="#" className="w-12 h-12 bg-f-glass-white border border-f-border rounded-2xl flex justify-center items-center text-white no-underline text-lg transition-all duration-500 hover:bg-white hover:text-f-dark hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(20,184,166,0.2)]">
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
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
