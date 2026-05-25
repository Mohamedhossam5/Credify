import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import nadyPhoto from '../../assets/team/nady.png';
import mohamedPhoto from '../../assets/team/mohamed.png';
import hossPhoto from '../../assets/team/hoss.png';
import karimPhoto from '../../assets/team/karim.png';
import yehiaPhoto from '../../assets/team/yehia1.png';
import zedPhoto from '../../assets/team/zed.png';

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
