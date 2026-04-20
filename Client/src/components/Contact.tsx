import React, { useState } from 'react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
  };

  return (
    <div className="w-full max-w-[1250px] mx-auto px-5 py-10 animate-[fadeIn_1s_ease-out]">
      <div className="text-left mb-[50px]">
        <h1 className="text-[clamp(32px,5vw,48px)] text-dark font-extrabold tracking-tight">Let's Connect</h1>
        <p className="text-slate-500 text-lg mt-2.5">Have a question or just want to say hi? We're here for you.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10">
        <div className="bg-white p-11 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-black/5 relative">
          <div className="text-[22px] text-dark mb-[30px] font-bold flex items-center gap-2.5">
            <span className="w-[30px] h-1 bg-accent rounded-sm"></span> Send a Message
          </div>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-6 group">
              <i className="fa-regular fa-user absolute left-5 top-5 text-slate-400 transition-all duration-400 group-focus-within:text-accent"></i>
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
            <div className="relative mb-6 group">
              <i className="fa-regular fa-envelope absolute left-5 top-5 text-slate-400 transition-all duration-400 group-focus-within:text-accent"></i>
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
            <div className="relative mb-6 group">
              <i className="fa-regular fa-paper-plane absolute left-5 top-5 text-slate-400 transition-all duration-400 group-focus-within:text-accent"></i>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..." 
                className="w-full h-[200px] resize-none p-[18px] pr-5 pl-[55px] border-2 border-slate-100 rounded-2xl bg-slate-50 text-base text-dark outline-none transition-all duration-400 focus:border-accent focus:bg-white focus:shadow-[0_10px_20px_rgba(20,184,166,0.08)]"
              ></textarea>
            </div>
            <button type="submit" className="w-full p-5 bg-dark text-white border-none rounded-2xl text-lg font-bold cursor-pointer transition-all duration-400 flex justify-center items-center gap-3 hover:bg-accent hover:scale-[1.02] hover:shadow-[0_15px_30px_rgba(20,184,166,0.3)]">
              Send Message <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </form>
          <div className="mt-[30px] flex gap-[15px]">
            <a href="#" className="w-[45px] h-[45px] rounded-xl bg-slate-100 flex justify-center items-center text-dark no-underline transition-all duration-400 hover:bg-dark hover:text-white">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" className="w-[45px] h-[45px] rounded-xl bg-slate-100 flex justify-center items-center text-dark no-underline transition-all duration-400 hover:bg-dark hover:text-white">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="#" className="w-[45px] h-[45px] rounded-xl bg-slate-100 flex justify-center items-center text-dark no-underline transition-all duration-400 hover:bg-dark hover:text-white">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] h-[650px]">
          <div className="absolute top-[30px] left-[30px] right-[30px] bg-white/85 backdrop-blur-[12px] p-[25px] rounded-2xl z-10 border border-white/50 flex justify-between items-center">
            <div>
              <h4 className="text-[18px] text-dark mb-1 font-bold">Helwan University</h4>
              <p className="text-[14px] text-slate-500">
                <i className="fa-solid fa-location-dot text-accent mr-1"></i>
                Faculty of BIS, Cairo
              </p>
            </div>
            <a href="#" className="w-[50px] h-[50px] bg-accent text-white rounded-full flex justify-center items-center no-underline text-[20px] transition-all duration-400 hover:rotate-45 hover:scale-110" title="Get Directions">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[5] text-center animate-pulse-marker">
            <div className="bg-white px-5 py-2.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex items-center gap-2.5 relative border border-gray-100 after:content-[''] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:border-l-[10px] after:border-l-transparent after:border-r-[10px] after:border-r-transparent after:border-t-[10px] after:border-t-white">
              <div className="bg-[#2b579a] text-white w-8 h-8 rounded-lg flex justify-center items-center">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <div className="font-bold text-[14px] text-dark">Faculty of BIS</div>
            </div>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3452.784705024261!2d31.22352692459686!3d30.07170517490986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145840fc5cf0dcfb%3A0x5c8b8a3b52b6bcbc!2z2YPZhNmK2Kkg2KfZhNiq2KzYp9ix2Kkg2YjYpdiv2KfYsdipINin2YTYo9i52YXYp9mEINis2KfZhdi52Kkg2K3ZhNmI2KfZhg!5e0!3m2!1sar!2spl!4v1776356006071!5m2!1sar!2spl"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
