import React from 'react';
import Navbar from '../../components/shared/Navbar';
import Footer from '../../components/shared/Footer';
import { CreditCard, Smartphone, Link as LinkIcon, QrCode } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const features = [
    {
      icon: <CreditCard className="w-8 h-8 text-blue-500" />,
      title: 'Card Payments',
      description: 'Accept credit and debit cards globally with our secure payment gateway.'
    },
    {
      icon: <LinkIcon className="w-8 h-8 text-blue-500" />,
      title: 'Payment Links',
      description: 'Generate secure payment links to share with customers via email or SMS.'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-blue-500" />,
      title: 'Mobile Wallet',
      description: 'Integrate Apple Pay, Google Pay, and other popular mobile wallets instantly.'
    },
    {
      icon: <QrCode className="w-8 h-8 text-blue-500" />,
      title: 'QR Codes',
      description: 'Accept touch-free payments in-store with dynamic QR codes.'
    }
  ];

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-[200px] pb-24 overflow-hidden bg-blue-50">
        <div className="max-w-7xl mx-auto px-12 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 mb-6 tracking-tighter">
            Seamless <span className="text-blue-600">Payments</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Move money faster and safer than ever before. Whether you are paying friends or accepting 
            payments from customers worldwide, we've got you covered.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 max-w-7xl mx-auto px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
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

export default PaymentsPage;
