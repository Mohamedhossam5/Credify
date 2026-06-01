import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  theme: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onToggleSidebar, onToggleTheme, theme }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleNotif = () => setNotifOpen(!notifOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: dashboardData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.users || [];
    },
    refetchInterval: 15000,
  });

  const { data: loansData } = useQuery({
    queryKey: ['admin-loans', 'ALL'],
    queryFn: async () => {
      const { data } = await api.get('/loans/all');
      return data.loans || [];
    },
    refetchInterval: 15000,
  });

  const { data: crData } = useQuery({
    queryKey: ['admin-change-requests'],
    queryFn: async () => {
      const { data } = await api.get('/admin/change-requests');
      return data.requests || [];
    },
    refetchInterval: 15000,
  });

  const { data: addlKycData } = useQuery({
    queryKey: ['admin-additional-kyc'],
    queryFn: async () => {
      const { data } = await api.get('/admin/kyc-additional-requests');
      return data.requests || [];
    },
    refetchInterval: 15000,
  });

  const pendingKyc = dashboardData?.filter((u: any) => u.kyc_app_status === 'PENDING_ADMIN_REVIEW') || [];
  const pendingLoans = loansData?.filter((l: any) => l.status === 'PENDING') || [];
  const pendingCr = crData?.filter((r: any) => ['SUBMITTED', 'UNDER_REVIEW', 'WAITING_FOR_CUSTOMER'].includes(r.status)) || [];
  const uploadedAddlKyc = addlKycData?.filter((r: any) => r.status === 'UPLOADED') || [];

  const notifications = [
    ...pendingKyc.map((k: any) => ({
      id: `kyc-${k.id}`,
      type: 'KYC',
      title: 'New KYC Application',
      desc: `${k.first_name} ${k.last_name}`,
      time: new Date(k.created_at).toLocaleDateString(),
      color: '#3b82f6',
      link: '/admin/kyc'
    })),
    ...pendingLoans.map((l: any) => ({
      id: `loan-${l.id}`,
      type: 'Loan',
      title: 'New Loan Request',
      desc: `EGP ${parseFloat(l.amount).toLocaleString()} from ${l.first_name} ${l.last_name}`,
      time: new Date(l.created_at).toLocaleDateString(),
      color: '#10b981',
      link: '/admin/loans'
    })),
    ...pendingCr.map((c: any) => ({
      id: `cr-${c.id}`,
      type: 'Change Request',
      title: 'Profile Change Request',
      desc: `${c.first_name} ${c.last_name}`,
      time: new Date(c.created_at).toLocaleDateString(),
      color: '#f59e0b',
      link: '/admin/change-requests'
    })),
    ...uploadedAddlKyc.map((r: any) => ({
      id: `addl-kyc-${r.id}`,
      type: 'Additional KYC',
      title: 'User Uploaded Requested Doc',
      desc: `User ${r.user_id} uploaded requested document`,
      time: new Date(r.created_at).toLocaleDateString(),
      color: '#ef4444',
      link: '/admin/kyc'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const totalNotifs = notifications.length;

  return (
    <header id="admin-topbar">
      <button className="collapse-btn" onClick={onToggleSidebar} title="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="search-wrap">
        <span className="search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" id="global-search" placeholder="Search..." />
      </div>

      <div className="topbar-right">
        <div style={{ width: '1px', height: '22px', background: 'var(--border)', margin: '0 2px' }}></div>

        <button className="topbar-btn" onClick={onToggleTheme} title="Toggle theme">
          <svg id="theme-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {theme === 'dark' ? (
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            ) : (
              <>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </>
            )}
          </svg>
        </button>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button className="topbar-btn" onClick={toggleNotif} title="Notifications" id="notif-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot" id="notif-dot" style={{ display: totalNotifs > 0 ? 'block' : 'none' }}></span>
          </button>

          <div className="notif-dropdown" id="notif-dropdown" style={{ display: notifOpen ? 'block' : 'none' }}>
            <div className="notif-header">
              <span className="notif-header-title">Notifications {totalNotifs > 0 && `(${totalNotifs})`}</span>
              <span className="notif-clear" onClick={() => setNotifOpen(false)}>Close</span>
            </div>
            <div id="notif-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No pending requests
                </div>
              ) : (
                notifications.map(n => (
                  <div className="notif-item" key={n.id} onClick={() => { navigate(n.link); setNotifOpen(false); }} style={{ cursor: 'pointer' }}>
                    <div className="notif-dot-icon" style={{ background: n.color }}></div>
                    <div>
                      <div className="notif-text" style={{ fontWeight: 600 }}>{n.title}: {n.desc}</div>
                      <div className="notif-time">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', background: 'var(--border)', margin: '0 2px' }} className="hidden sm:block"></div>

        <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '12px', cursor: 'pointer' }} onClick={() => navigate('/admin/settings')}>
          CA
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
