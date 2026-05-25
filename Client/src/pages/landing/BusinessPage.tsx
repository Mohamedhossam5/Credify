import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { Briefcase, Building2, Globe2, BarChart3 } from 'lucide-react';

const BusinessPage: React.FC = () => {
  const features = [
    {
      icon: <Briefcase className="w-8 h-8 text-blue-500" />,
      title: 'Corporate Accounts',
      description: 'Streamline your operations with multi-currency corporate accounts.'
    },
    {
      icon: <Building2 className="w-8 h-8 text-blue-500" />,
      title: 'Payroll Management',
      description: 'Automate your payroll with one-click bulk transfers and tax reporting.'
    },
    {
      icon: <Globe2 className="w-8 h-8 text-blue-500" />,
      title: 'Global Transfers',
      description: 'Send and receive money internationally with low fees and real-time exchange rates.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
      title: 'Business Analytics',
      description: 'Gain powerful insights into your cash flow with advanced reporting tools.'
    }
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-[200px] pb-24 overflow-hidden bg-blue-50">
        <div className="max-w-7xl mx-auto px-12 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 mb-6 tracking-tighter">
            Power your <span className="text-blue-600">Business</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            From startups to enterprises, Credify gives your business the financial infrastructure 
            it needs to scale locally and globally without friction.
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

export default BusinessPage;
