import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, BarChart3, Loader2, Plus, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../services/finance.service';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

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

  const { data: accountData, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance'],
    queryFn: financeService.getBalance,
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

  const { payments, isLoadingPayments } = useTransactions();

  const filteredTx = useMemo(() => {
    if (txFilter === 'all') return payments;
    return payments.filter((tx) => tx.status === txFilter);
  }, [payments, txFilter]);

  const { totalReceived, totalSent } = useMemo(() => {
    let received = 0, sent = 0;
    payments.forEach((tx) => {
      const n = parseFloat(tx.amount.replace(/[^0-9.-]/g, ''));
      if (tx.status === 'received') received += Math.abs(n);
      else sent += Math.abs(n);
    });
    return { totalReceived: received, totalSent: sent };
  }, [payments]);

  return (
    <section id="dashboard" className="page active">
      {/* Welcome Message */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: f, letterSpacing: '-0.5px', lineHeight: 1.3 }}>
          <span style={{ color: 'var(--text-primary)' }}>Welcome back, </span>
          <span style={{ background: 'linear-gradient(135deg, var(--teal), var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.firstName ?? 'User'}</span>
          <span style={{ marginLeft: '6px', display: 'inline-block', animation: 'wave 1.8s ease-in-out infinite', transformOrigin: '70% 70%' }}></span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

        {/* ─── LEFT COLUMN ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Balance Card */}
          <div className="glass-card" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(14,203,203,0.08), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, letterSpacing: '0.3px' }}>Total Balance</span>
            </div>
            <div style={{ fontFamily: f, fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '16px', fontVariantNumeric: 'tabular-nums' }}>
              {isLoadingBalance ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)' }}>Loading...</span>
                </div>
              ) : `EGP ${formatEGP(balance)}`}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 500 }}>Received</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>EGP {formatEGP(totalReceived)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)' }} />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 500 }}>Sent</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>EGP {formatEGP(totalSent)}</div>
                </div>
              </div>
            </div>

            {/* Account Number */}
            {accountData && (
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: mono, fontWeight: 400, letterSpacing: '0.3px' }}>Acc. {accountData.accountId}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: '24px 28px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, display: 'block', marginBottom: '16px' }}>Quick Actions</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Send Money', icon: <ArrowUpRight size={18} style={{ color: 'var(--teal)' }} />, bg: 'rgba(14,203,203,0.12)', to: '/transfers' },
                { label: 'View History', icon: <BarChart3 size={18} style={{ color: '#1a6fff' }} />, bg: 'rgba(26,111,255,0.12)', to: '/transactions' },
              ].map((a) => (
                <button key={a.label} onClick={() => navigate(a.to)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: f, fontSize: '13px', fontWeight: 600, transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(14,203,203,0.1)'; e.currentTarget.style.borderColor = 'var(--teal)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.icon}</div>
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
            <div style={{ padding: '0 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <CreditCard size={32} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                  <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>No cards yet</p>
                </div>
              ) : (() => {
                const card = cards[0];
                const isDebit = card.card_type === 'DEBIT';
                const cardGrad = isDebit
                  ? 'linear-gradient(135deg, #1a1f2e 0%, #2d3548 50%, #1a1f2e 100%)'
                  : 'linear-gradient(135deg, #3730A3 0%, #6366f1 50%, #3730A3 100%)';
                return (
                  <div>
                    <div onClick={() => navigate('/accounts')} style={{
                      width: '100%', height: '185px', borderRadius: '18px',
                      background: cardGrad, padding: '22px 24px', position: 'relative', overflow: 'hidden',
                      cursor: 'pointer', transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.015)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px', background: 'radial-gradient(circle, rgba(255,255,255,0.06), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '22px', borderRadius: '4px', background: 'linear-gradient(135deg, #f5d67b, #d4af37)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                          <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.5)', fontFamily: f }}>{card.card_type}</span>
                        </div>
                        <span style={{ fontFamily: f, fontSize: '12px', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255,255,255,0.7)' }}>CREDIFY</span>
                      </div>

                      <div style={{ fontFamily: mono, fontSize: '16px', letterSpacing: '2.5px', color: 'rgba(255,255,255,0.8)', fontVariantNumeric: 'tabular-nums' }}>
                        {card.card_number_masked}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: f, marginBottom: '2px' }}>Card Holder</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: f, letterSpacing: '0.3px' }}>{card.cardholder_name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: f, marginBottom: '2px' }}>Exp</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: mono }}>
                            {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                          </div>
                        </div>
                      </div>

                      {card.status === 'FROZEN' && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(59,130,246,0.15)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(1px)' }}>
                          <span style={{ fontFamily: f, fontWeight: 700, fontSize: '11px', color: '#60a5fa', background: 'rgba(0,0,0,0.5)', padding: '4px 14px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Frozen</span>
                        </div>
                      )}
                    </div>

                    {cards.length > 1 && (
                      <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f }}>+{cards.length - 1} more card{cards.length - 1 > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* View All Cards button */}
            <div style={{ padding: '12px 24px 0', borderTop: '1px solid var(--glass-border)', marginTop: '16px' }}>
              <button onClick={() => navigate('/accounts')}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: f, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s ease' }}
              >View All Cards <ChevronRight size={14} /></button>
            </div>
          </div>

          {/* ══════ RECENT TRANSACTIONS ══════ */}
          <div className="glass-card" style={{ padding: '24px 0' }}>
            <div style={{ padding: '0 24px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: f, letterSpacing: '-0.3px', margin: '0 0 14px 0' }}>Recent Transactions</h3>
              <div style={{ display: 'flex', gap: '0', background: 'var(--glass)', borderRadius: '10px', padding: '3px', border: '1px solid var(--glass-border)' }}>
                {(['all', 'sent', 'received'] as const).map(fil => (
                  <button key={fil} onClick={() => setTxFilter(fil)}
                    style={{ flex: 1, padding: '7px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: txFilter === fil ? 700 : 500, fontFamily: f, background: txFilter === fil ? 'var(--teal)' : 'transparent', color: txFilter === fil ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}
                  >{fil.charAt(0).toUpperCase() + fil.slice(1)}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {isLoadingPayments ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <Loader2 size={24} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : filteredTx.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-secondary)', fontFamily: f, fontSize: '13px' }}>No transactions found</div>
              ) : (
                filteredTx.map((tx) => (
                  <div key={tx.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--row-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: tx.status === 'received' ? 'rgba(0,232,143,0.12)' : 'rgba(255,77,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {tx.status === 'received' ? <ArrowDownLeft size={18} style={{ color: 'var(--success)' }} /> : <ArrowUpRight size={18} style={{ color: 'var(--danger)' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: f }}>{tx.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f }}>{tx.desc} · {tx.time}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: f, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px', color: tx.status === 'received' ? 'var(--success)' : 'var(--danger)' }}>{tx.amount}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '12px 24px 0', borderTop: '1px solid var(--glass-border)', marginTop: '4px' }}>
              <button onClick={() => navigate('/transactions')}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, fontFamily: f, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s ease' }}
              >View All Transactions <ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
