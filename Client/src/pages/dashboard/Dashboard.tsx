import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, BarChart3, Loader2, Plus, CreditCard, Send, TrendingUp, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../services/finance.service';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import FloatingSelect from '../../components/ui/FloatingSelect';

// ─── Types ───────────────────────────────────────────────────
interface CardData {
  id: number; card_type: 'DEBIT' | 'PREPAID'; card_number_masked: string; last_four: string;
  expiry_month: number; expiry_year: number; cardholder_name: string; status: 'ACTIVE' | 'FROZEN' | 'CANCELLED';
  prepaid_balance: number; linked_account_id: string | null; daily_limit: number; created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────
const f = '"Inter",sans-serif';
const mono = '"DM Mono",monospace';
const formatEGP = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Dashboard ───────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [txFilter, setTxFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [moneyFlowFilter, setMoneyFlowFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('today');
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const { data: accountData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance'],
    queryFn: financeService.getBalance,
    refetchInterval: 5000,
  });
  const balance = accountData?.balance ?? 0;

  const { data: cardsData, isLoading: isLoadingCards } = useQuery({
    queryKey: ['dashboard-cards'],
    queryFn: async () => {
      const { data } = await api.get<{ cards: CardData[] }>('/cards');
      return (data.cards || []).filter((c: CardData) => c.status !== 'CANCELLED');
    },
  });
  const cards = cardsData ?? [];

  const { data: kycRequests } = useQuery({
    queryKey: ['kyc-requests'],
    queryFn: async () => {
      const { data } = await api.get('/kyc/requests/my');
      return data.requests || [];
    },
    enabled: !!user,
  });

  const { payments, isLoadingPayments, allPayments = [] } = useTransactions();

  const filteredTx = useMemo(() => {
    if (txFilter === 'all') return payments;
    return payments.filter((tx) => tx.status === txFilter);
  }, [payments, txFilter]);

  const { totalReceived, totalSent } = useMemo(() => {
    let received = 0, sent = 0;
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 7 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();

    allPayments.forEach((tx) => {
      let include = true;
      if (moneyFlowFilter === 'today') {
        include = tx.timestamp >= todayStart;
      } else if (moneyFlowFilter === 'yesterday') {
        include = tx.timestamp >= yesterdayStart && tx.timestamp < todayStart;
      } else if (moneyFlowFilter === 'week') {
        include = tx.timestamp >= weekStart;
      } else if (moneyFlowFilter === 'month') {
        include = tx.timestamp >= monthStart;
      }

      if (include) {
        const n = parseFloat(tx.amount.replace(/[^0-9.-]/g, ''));
        if (tx.status === 'received') received += Math.abs(n);
        else sent += Math.abs(n);
      }
    });
    return { totalReceived: received, totalSent: sent };
  }, [allPayments, moneyFlowFilter]);

  const totalActivity = totalReceived + totalSent || 1; // Prevent division by zero
  const receivedPct = Math.round((totalReceived / totalActivity) * 100);
  const sentPct = Math.round((totalSent / totalActivity) * 100);

  return (
    <section id="dashboard" className="page active">
      {/* Welcome Message */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: f, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            <span style={{ color: 'var(--text-primary)' }}>Welcome back, </span>
            <span style={{ background: 'linear-gradient(135deg, var(--teal), var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.firstName ?? 'User'}</span>
            <span style={{ marginLeft: '8px', display: 'inline-block', animation: 'wave 1.8s ease-in-out infinite', transformOrigin: '70% 70%' }}></span>
          </div>
          <p style={{ fontFamily: f, color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>
            Here is what's happening with your finances today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/transfers')} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '10px' }}>
            <Send size={16} /> Send Money
          </button>
          <button onClick={() => navigate('/loans')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <Landmark size={16} style={{ color: 'var(--teal)' }} /> Loans
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

        {/* ─── LEFT COLUMN ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Balance & Insights Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

            {/* Balance Card */}
            <div className="glass-card" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(14,203,203,0.03), rgba(26,111,255,0.03))' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(14,203,203,0.1), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

              {/* Shimmer effect overlay */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 3s infinite' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '0.3px' }}>Available Balance</span>
                <div style={{ padding: '4px 8px', background: 'var(--glass)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                  EGP
                </div>
              </div>
              <div style={{ fontFamily: f, fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: '24px', fontVariantNumeric: 'tabular-nums' }}>
                {isLoadingBalance ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-secondary)' }}>Loading...</span>
                  </div>
                ) : `EGP ${formatEGP(Number(balance))}`}
              </div>

              {/* Sparkline purely visual */}
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '30px', gap: '4px', marginBottom: '16px', opacity: 0.6 }}>
                {[40, 65, 45, 80, 55, 90, 75, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, var(--teal), var(--blue))', borderRadius: '2px 2px 0 0', opacity: i === 7 ? 1 : 0.4 }} />
                ))}
              </div>

              {/* Account Number */}
              {accountData && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 500 }}>Account Number</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: mono, fontWeight: 600, letterSpacing: '0.5px' }}>{accountData.accountId}</span>
                </div>
              )}
            </div>

            {/* Spending Insights Card */}
            <div className="glass-card" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>Money Flow</span>
                <FloatingSelect
                  value={moneyFlowFilter}
                  onChange={(v) => setMoneyFlowFilter(v as any)}
                  options={[
                    { value: 'today',     label: 'Today' },
                    { value: 'yesterday', label: 'Yesterday' },
                    { value: 'week',      label: 'Last 7 Days' },
                    { value: 'month',     label: 'Last 30 Days' },
                    { value: 'all',       label: 'All Time' },
                  ]}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                {/* Received */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0,232,143,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                        <ArrowDownLeft size={16} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Income</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>+EGP {formatEGP(totalReceived)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${receivedPct}%`, height: '100%', background: 'var(--success)', borderRadius: '3px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>

                {/* Sent */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,77,106,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
                        <ArrowUpRight size={16} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Expenses</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>-EGP {formatEGP(totalSent)}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${sentPct}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* KYC Request Banner */}
          {kycRequests && kycRequests.filter((r: any) => r.status === 'PENDING').length > 0 && (
            <div style={{ background: 'rgba(255, 77, 106, 0.05)', border: '1px solid rgba(255, 77, 106, 0.2)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 77, 106, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Action Required: KYC Document</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{kycRequests.filter((r: any) => r.status === 'PENDING')[0].message}</p>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-kyc-upload', { detail: kycRequests.filter((r: any) => r.status === 'PENDING')[0] }))}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--danger)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'opacity 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Upload Now
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: '24px 28px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, display: 'block', marginBottom: '16px' }}>Quick Actions</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Send Money', icon: <ArrowUpRight size={18} style={{ color: 'var(--teal)' }} />, bg: 'rgba(14,203,203,0.12)', to: '/transfers' },
                { label: 'History', icon: <BarChart3 size={18} style={{ color: '#1a6fff' }} />, bg: 'rgba(26,111,255,0.12)', to: '/transactions' },
                { label: 'My Cards', icon: <CreditCard size={18} style={{ color: '#8b5cf6' }} />, bg: 'rgba(139,92,246,0.12)', to: '/accounts' },
                { label: 'Exchange', icon: <TrendingUp size={18} style={{ color: '#f59e0b' }} />, bg: 'rgba(245,158,11,0.12)', to: '/exchange' },
              ].map((a) => (
                <button key={a.label} onClick={() => navigate(a.to)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: 600, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</div>
                  {a.label}
                </button>
              ))}
            </div>
          </div>


        </div>

        {/* ─── RIGHT COLUMN ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ══════ MY CARDS SECTION ══════ */}
          <div className="glass-card" style={{ padding: '24px 0' }}>
            <div style={{ padding: '0 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: f, letterSpacing: '-0.3px', margin: 0 }}>My Cards</h3>
              <button onClick={() => navigate('/accounts')}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--teal)', fontSize: '12px', fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(14,203,203,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Plus size={13} /> Add New
              </button>
            </div>

            <div style={{ padding: '0 24px' }}>
              {isLoadingCards ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : cards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 0', background: 'var(--glass)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                  <CreditCard size={32} style={{ color: 'var(--text-secondary)', marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontFamily: f, fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>No cards yet</p>
                  <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Apply for a physical or virtual card.</p>
                </div>
              ) : (() => {
                const card = cards[activeCardIndex] || cards[0];
                const isDebit = card.card_type === 'DEBIT';
                const cardGrad = isDebit
                  ? 'linear-gradient(135deg, #1a1f2e 0%, #2d3548 50%, #1a1f2e 100%)'
                  : 'linear-gradient(135deg, #3730A3 0%, #6366f1 50%, #3730A3 100%)';
                return (
                  <div>
                    <div onClick={() => navigate('/accounts')} style={{
                      width: '100%', maxWidth: '340px', margin: '0 auto', height: '190px', borderRadius: '20px',
                      background: cardGrad, padding: '24px', position: 'relative', overflow: 'hidden',
                      cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.35)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'; }}
                    >
                      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, #f5d67b, #d4af37)', boxShadow: '0 2px 5px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                            <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)', fontFamily: f }}>{card.card_type}</span>
                        </div>
                        <span style={{ fontFamily: f, fontSize: '13px', fontWeight: 800, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.9)' }}>CREDIFY</span>
                      </div>

                      <div style={{ fontFamily: mono, fontSize: '18px', letterSpacing: '3px', color: 'rgba(255,255,255,0.95)', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {card.card_number_masked}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: f, marginBottom: '4px' }}>Card Holder</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontFamily: f, letterSpacing: '0.5px' }}>{card.cardholder_name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: f, marginBottom: '4px' }}>Exp</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.95)', fontFamily: mono, letterSpacing: '1px' }}>
                            {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                          </div>
                        </div>
                      </div>

                      {card.status === 'FROZEN' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4, 9, 24, 0.4)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                          <span style={{ fontFamily: f, fontWeight: 800, fontSize: '12px', color: '#fff', background: 'rgba(255, 185, 0, 0.8)', padding: '6px 16px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>Frozen</span>
                        </div>
                      )}
                    </div>

                    {cards.length > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                        {cards.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCardIndex(i)}
                            style={{
                              width: i === activeCardIndex ? '20px' : '6px',
                              height: '6px',
                              borderRadius: '3px',
                              background: i === activeCardIndex ? 'var(--teal)' : 'var(--text-secondary)',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              opacity: i === activeCardIndex ? 1 : 0.5,
                            }}
                            onMouseEnter={(e) => { if (i !== activeCardIndex) e.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={(e) => { if (i !== activeCardIndex) e.currentTarget.style.opacity = '0.5'; }}
                            title={`View Card ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ══════ RECENT TRANSACTIONS ══════ */}
          <div className="glass-card" style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ padding: '0 24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: f, letterSpacing: '-0.3px', margin: '0 0 16px 0' }}>Recent Transactions</h3>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--glass)', borderRadius: '10px', padding: '4px', border: '1px solid var(--glass-border)' }}>
                {(['all', 'sent', 'received'] as const).map(fil => (
                  <button key={fil} onClick={() => setTxFilter(fil)}
                    style={{ flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: txFilter === fil ? 700 : 500, fontFamily: f, background: txFilter === fil ? 'var(--teal)' : 'transparent', color: txFilter === fil ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s ease', boxShadow: txFilter === fil ? '0 2px 8px rgba(14,203,203,0.3)' : 'none' }}
                  >{fil.charAt(0).toUpperCase() + fil.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              {isLoadingPayments ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : filteredTx.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-secondary)', fontFamily: f, fontSize: '13px' }}>No transactions found</div>
              ) : (
                filteredTx.slice(0, 3).map((tx) => (
                  <div key={tx.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--row-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: tx.status === 'received' ? 'rgba(0,232,143,0.12)' : 'rgba(255,77,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tx.status === 'received' ? <ArrowDownLeft size={18} style={{ color: 'var(--success)' }} /> : <ArrowUpRight size={18} style={{ color: 'var(--danger)' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: f, marginBottom: '2px' }}>{tx.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: f }}>{tx.desc} · {tx.time}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: f, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', color: tx.status === 'received' ? 'var(--success)' : 'var(--text-primary)' }}>{tx.amount}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '16px 24px 0', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
              <button onClick={() => navigate('/transactions')}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >View All Activity <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};

export default Dashboard;
