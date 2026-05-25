import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { Wallet, CreditCard, PiggyBank, ShieldCheck } from 'lucide-react';

const PersonalPage: React.FC = () => {
  const features = [
    {
      icon: <Wallet className="w-8 h-8 text-blue-500" />,
      title: 'Digital Wallet',
      description: 'Manage all your money in one place with real-time tracking and insights.'
    },
    {
      icon: <CreditCard className="w-8 h-8 text-blue-500" />,
      title: 'Virtual Cards',
      description: 'Create instantly disposable virtual cards for secure online shopping.'
    },
    {
      icon: <PiggyBank className="w-8 h-8 text-blue-500" />,
      title: 'Savings Vaults',
      description: 'Set goals and save automatically with our intelligent vault system.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
      title: 'Bank-Grade Security',
      description: 'Your funds are protected by enterprise-level encryption and security.'
    }
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-[200px] pb-24 overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-12 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 mb-6 tracking-tighter">
            Banking built for <span className="text-blue-600">You</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Take control of your finances with a personal account that gives you more freedom, 
            zero hidden fees, and tools designed to help you grow your wealth.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 max-w-7xl mx-auto px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PersonalPage;
