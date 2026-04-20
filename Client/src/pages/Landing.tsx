import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const Landing: React.FC = () => {
  return (
    <div className="w-full relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Contact />
      <Footer />
    </div>
  );
};

export default Landing;
