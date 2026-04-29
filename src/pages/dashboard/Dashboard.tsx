import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import DashboardButton from '../../components/ui/DashboardButton';
import { useTransactions } from '../../hooks/useTransactions';
import type { PaymentStatus, PaymentType, Payment } from '../../hooks/useTransactions';

const typeLabels: Record<string, string> = {
  swift: "SWIFT",
  local: "Local",
  direct: "Direct",
  pending: "Pending",
};

const typeColors: Record<string, string> = {
  swift: "rgba(26,111,255,0.1):#7ab8ff",
  local: "rgba(255,77,106,0.1):#ff8fa3",
  direct: "rgba(0,232,143,0.1):#00e88f",
  pending: "rgba(255,185,0,0.1):#ffd700",
};

const Dashboard: React.FC = () => {
  const { payments, payStatusFilter, setPayStatusFilter, payTypeFilter, setPayTypeFilter } = useTransactions();
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const toggleStatusDropdown = () => {
    setIsStatusDropdownOpen(!isStatusDropdownOpen);
    setIsTypeDropdownOpen(false);
  };

  const toggleTypeDropdown = () => {
    setIsTypeDropdownOpen(!isTypeDropdownOpen);
    setIsStatusDropdownOpen(false);
  };

  const handleStatusSelect = (status: PaymentStatus) => {
    setPayStatusFilter(status);
    setIsStatusDropdownOpen(false);
  };

  const handleTypeSelect = (type: PaymentType) => {
    setPayTypeFilter(type);
    setIsTypeDropdownOpen(false);
  };

  const getStatusLabel = () => {
    switch (payStatusFilter) {
      case 'received': return 'Received';
      case 'sent': return 'Sent';
      case 'pending': return 'Pending';
      default: return 'All Status';
    }
  };

  const getTypeLabel = () => {
    switch (payTypeFilter) {
      case 'swift': return 'SWIFT';
      case 'local': return 'Local';
      case 'direct': return 'Direct';
      default: return 'All Types';
    }
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (p: Payment) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: '"Inter", sans-serif' }}>
          {p.date}<br />
          <span style={{ fontSize: '11px' }}>{p.time}</span>
        </span>
      )
    },
    {
      key: 'name',
      header: 'Name',
      render: (p: Payment) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px', color: '#fff', fontFamily: '"Inter", sans-serif' }}>
            {p.initials}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontFamily: '"Inter", sans-serif', color: 'var(--text-primary)' }}>{p.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif' }}>{p.desc}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (p: Payment) => {
        const tc = typeColors[p.type] || "rgba(255,255,255,0.06):#aaa";
        const [bg, col] = tc.split(":");
        return (
          <span style={{ background: bg, color: col, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', fontFamily: '"Inter", sans-serif' }}>
            {typeLabels[p.type] || p.type}
          </span>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (p: Payment) => {
        const amtColor = p.status === "received" ? "var(--success)" : p.status === "pending" ? "#ffb900" : "var(--danger)";
        return (
          <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: '800', color: amtColor, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.4px' }}>
            {p.amount}
          </span>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: Payment) => {
        const badgeClass = p.status === "received" ? "badge-success" : p.status === "pending" ? "badge-warning" : "badge-danger";
        return (
          <span className={`badge ${badgeClass}`}>● {p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
        );
      }
    }
  ];

  return (
    <section id="dashboard" className="page active" onClick={() => { setIsStatusDropdownOpen(false); setIsTypeDropdownOpen(false); }}>
      <div className="section-header">
        <div className="section-title text-[var(--text-primary)]">My Cards</div>
        <DashboardButton style={{ padding: '9px 18px', fontSize: '13px' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Card
        </DashboardButton>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '32px' }} className="cards-row">
        <Card type={1} number="4587" expiry="09/28" cardType="PLATINUM" />
        <Card type={2} number="3367" expiry="03/27" cardType="GOLD" />
        <Card type={3} number="5520" expiry="11/26" cardType="STANDARD" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="stat-mini">
          <div className="stat-icon glow-green">
            <svg width="20" height="20" fill="none" stroke="#00E88F" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 19V5M5 12l7 7 7-7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: '"Inter", sans-serif', fontWeight: '600' }}>
              Total Received
            </div>
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '18px', fontWeight: '800', color: 'var(--success)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
              +85,200 EGP
            </div>
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-icon glow-red">
            <svg width="20" height="20" fill="none" stroke="#FF4D6A" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12l7-7 7 7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: '"Inter", sans-serif', fontWeight: '600' }}>
              Total Sent
            </div>
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '18px', fontWeight: '800', color: 'var(--danger)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
              -34,650 EGP
            </div>
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-icon glow-teal">
            <svg width="20" height="20" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="3" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: '"Inter", sans-serif', fontWeight: '600' }}>
              Net Balance
            </div>
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '18px', fontWeight: '800', color: 'var(--teal)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
              199,250 EGP
            </div>
          </div>
        </div>
        <div className="stat-mini">
          <div className="stat-icon glow-blue">
            <svg width="20" height="20" fill="none" stroke="#7AB8FF" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: '"Inter", sans-serif', fontWeight: '600' }}>
              Pending
            </div>
            <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '18px', fontWeight: '800', color: '#7ab8ff', letterSpacing: '-0.5px' }}>
              3 Txns
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '8px' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="section-title text-[var(--text-primary)]">Payments</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', fontFamily: '"Inter", sans-serif' }}>
              Recent transactions
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>

            <div className="custom-select-wrapper" onClick={(e) => e.stopPropagation()}>
              <div className={`custom-select-trigger ${isStatusDropdownOpen ? 'active' : ''}`} id="status-trigger" onClick={toggleStatusDropdown}>
                <span className="trigger-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                </span>
                <span className={`status-dot-trigger dot-${payStatusFilter}`} id="status-dot"></span>
                <span id="status-label">{getStatusLabel()}</span>
                <svg className="chevron" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </div>
              <div className="custom-select-dropdown" id="status-dropdown" style={{ display: isStatusDropdownOpen ? 'block' : 'none' }}>
                <div className={`select-option ${payStatusFilter === 'all' ? 'selected' : ''}`} onClick={() => handleStatusSelect('all')}>
                  <div className="status-dot dot-all"></div> All Status
                </div>
                <div className={`select-option ${payStatusFilter === 'received' ? 'selected' : ''}`} onClick={() => handleStatusSelect('received')}>
                  <div className="status-dot dot-received"></div> Received
                </div>
                <div className={`select-option ${payStatusFilter === 'sent' ? 'selected' : ''}`} onClick={() => handleStatusSelect('sent')}>
                  <div className="status-dot dot-sent"></div> Sent
                </div>
                <div className={`select-option ${payStatusFilter === 'pending' ? 'selected' : ''}`} onClick={() => handleStatusSelect('pending')}>
                  <div className="status-dot dot-pending"></div> Pending
                </div>
              </div>
            </div>

            <div className="custom-select-wrapper" onClick={(e) => e.stopPropagation()}>
              <div className={`custom-select-trigger ${isTypeDropdownOpen ? 'active' : ''}`} id="type-trigger" onClick={toggleTypeDropdown}>
                <span className="trigger-icon">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="4" rx="1" />
                    <rect x="2" y="10" width="20" height="4" rx="1" />
                    <rect x="2" y="17" width="20" height="4" rx="1" />
                  </svg>
                </span>
                <span id="type-label">{getTypeLabel()}</span>
                <svg className="chevron" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
              </div>
              <div className="custom-select-dropdown" id="type-dropdown" style={{ display: isTypeDropdownOpen ? 'block' : 'none' }}>
                <div className={`select-option ${payTypeFilter === 'all' ? 'selected' : ''}`} onClick={() => handleTypeSelect('all')}>
                  <div className="type-icon-wrap" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                  </div>
                  All Types
                </div>
                <div className={`select-option ${payTypeFilter === 'swift' ? 'selected' : ''}`} onClick={() => handleTypeSelect('swift')}>
                  <div className="type-icon-wrap" style={{ background: 'rgba(26, 111, 255, 0.15)' }}>
                    <svg fill="none" stroke="#7ab8ff" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20" />
                    </svg>
                  </div>
                  SWIFT
                </div>
                <div className={`select-option ${payTypeFilter === 'local' ? 'selected' : ''}`} onClick={() => handleTypeSelect('local')}>
                  <div className="type-icon-wrap" style={{ background: 'rgba(14, 203, 203, 0.15)' }}>
                    <svg fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  Local
                </div>
                <div className={`select-option ${payTypeFilter === 'direct' ? 'selected' : ''}`} onClick={() => handleTypeSelect('direct')}>
                  <div className="type-icon-wrap" style={{ background: 'rgba(0, 232, 143, 0.15)' }}>
                    <svg fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  Direct
                </div>
              </div>
            </div>

          </div>
        </div>

        <Table columns={columns} data={payments} emptyMessage="No matching payments" />
      </div>
    </section>
  );
};

export default Dashboard;
