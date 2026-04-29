import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import '../../styles/dashboard.css';
import '../../styles/phase2.css';
import '../../styles/phase3.css';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Add audio context click listener for sounds as per original script
    const sound = { enabled: true, ctx: null as AudioContext | null, lastAt: 0 };
    
    function getAudioCtx() {
      if (sound.ctx) return sound.ctx;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      sound.ctx = new AC();
      return sound.ctx;
    }
    
    function playSound() {
      if (!sound.enabled) return;
      const now = performance.now();
      if (now - sound.lastAt < 70) return;
      sound.lastAt = now;
      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime;
      const vol = 0.018;
      const preset = { f: 460, dur: 0.04, wave: "sine" as OscillatorType };
      
      o.type = preset.wave;
      o.frequency.setValueAtTime(preset.f, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + preset.dur);
      o.start(t0);
      o.stop(t0 + preset.dur + 0.01);
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(".btn-primary") ||
        target.closest(".icon-btn") ||
        target.closest(".nav-item") ||
        target.closest(".tx-card") ||
        target.closest(".filter-tab") ||
        target.closest(".select-option")
      ) {
        playSound();
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="dashboard-root">
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main id="main">
        <DashboardNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default DashboardLayout;
