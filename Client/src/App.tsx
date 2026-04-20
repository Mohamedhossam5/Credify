import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import AuthLayout from './pages/AuthLayout';
import { useDynamicTitle } from './hooks/useDynamicTitle';



const AppContent: React.FC = () => {
  useDynamicTitle();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthLayout />} />
      <Route path="/register" element={<AuthLayout />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;