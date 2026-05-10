import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { Clock, ShieldCheck, LogOut } from 'lucide-react';
import '../../styles/dashboard.css';
import '../../styles/phase2.css';
import '../../styles/phase3.css';

const f = '"Inter",sans-serif';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
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

  // ── KYC Approval Guard ──
  // Admins bypass this check. Regular users must have APPROVED KYC.
  const isAdmin = user?.role === 'ADMIN';
  const kycApproved = user?.kycStatus === 'APPROVED';

  if (!isAdmin && !kycApproved) {
    const kycStatus = user?.kycStatus || 'PENDING';
    const statusConfig: Record<string, { label: string; color: string; desc: string }> = {
      'PENDING': { label: 'Pending Verification', color: '#f59e0b', desc: 'Please complete your KYC verification to access banking services.' },
      'DOCUMENTS_UPLOADED': { label: 'Documents Submitted', color: '#3b82f6', desc: 'Your documents have been uploaded and are being processed.' },
      'AI_VERIFICATION_IN_PROGRESS': { label: 'AI Verification', color: '#8b5cf6', desc: 'Our AI system is verifying your identity. This usually takes a few minutes.' },
      'PENDING_ADMIN_REVIEW': { label: 'Under Review', color: '#f59e0b', desc: 'Your application is being reviewed by our team. You will be notified once approved.' },
      'MANUAL_REVIEW': { label: 'Manual Review', color: '#f59e0b', desc: 'Your application requires additional manual review. Our team will get back to you.' },
      'REJECTED': { label: 'Application Rejected', color: '#ff4d6a', desc: 'Your KYC application was rejected. Please contact support for more information.' },
    };
    const config = statusConfig[kycStatus] || statusConfig['PENDING'];

    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy, #0a1128)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: f }}>
        <div style={{ maxWidth: '480px', width: '90%', textAlign: 'center', padding: '48px 32px', borderRadius: '24px', background: 'var(--glass, rgba(255,255,255,0.04))', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: `radial-gradient(circle, ${config.color}15, transparent)`, borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Icon */}
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `${config.color}15`, border: `2px solid ${config.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            {kycStatus === 'REJECTED' ? (
              <ShieldCheck size={32} style={{ color: config.color }} />
            ) : (
              <Clock size={32} style={{ color: config.color, animation: kycStatus === 'AI_VERIFICATION_IN_PROGRESS' ? 'spin 3s linear infinite' : 'none' }} />
            )}
          </div>

          {/* Status */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px', background: `${config.color}15`, marginBottom: '16px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: config.color, animation: kycStatus !== 'REJECTED' ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: config.color, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{config.label}</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary, #f0f4ff)', letterSpacing: '-0.5px', margin: '0 0 8px' }}>
            Account Not Yet Active
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary, rgba(240,244,255,0.55))', lineHeight: 1.6, margin: '0 0 32px' }}>
            {config.desc}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {(kycStatus === 'PENDING' || kycStatus === 'REJECTED') && (
              <button onClick={() => {
                const step = !user?.phoneVerified ? 3 : !user?.emailVerified ? 4 : 5;
                useAuthStore.getState().setCurrentStep(step as any);
                navigate('/register');
              }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--brand, #10b981)', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: f, transition: 'all 0.2s ease' }}>
                {kycStatus === 'REJECTED' ? 'Redo Application' : 'Complete Application'}
              </button>
            )}
            <button onClick={() => { logout(); navigate('/login'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--glass-border, rgba(255,255,255,0.08))', background: 'transparent', color: 'var(--text-secondary, rgba(240,244,255,0.55))', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: f, transition: 'all 0.2s ease' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

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

