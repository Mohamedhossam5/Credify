import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Snowflake, XCircle, Loader2, DollarSign, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { realtime, RealtimeEvent } from '../../lib/realtime';

const fmt = (n: number) => new Intl.NumberFormat('en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const f = '"Inter",sans-serif';
const mono = '"DM Mono",monospace';

interface CardData {
  id: number; card_type: 'DEBIT' | 'PREPAID'; card_number_masked: string; last_four: string;
  expiry_month: number; expiry_year: number; cardholder_name: string; status: 'ACTIVE' | 'FROZEN' | 'CANCELLED';
  prepaid_balance: number; linked_account_id: string | null; daily_limit: number; created_at: string;
}

const AccountsPage: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [accountBalance, setAccountBalance] = useState(0);
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState<'DEBIT' | 'PREPAID'>('DEBIT');
  const [newLimit, setNewLimit] = useState('10000');
  const [creating, setCreating] = useState(false);

  const [fundModal, setFundModal] = useState<{ cardId: number; mode: 'load' | 'unload' } | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);

  const fetchCards = async () => {
    try {
      const [cardsRes, meRes] = await Promise.all([api.get('/cards'), api.get('/auth/me')]);
      const activeCards = (cardsRes.data.cards || []).filter((c: CardData) => c.status !== 'CANCELLED');
      setCards(activeCards);
      setAccountBalance(cardsRes.data.accountBalance || 0);
      if (meRes.data.user?.account) setAccountId(meRes.data.user.account.accountId);
    } catch { toast.error('Failed to load cards'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCards(); }, []);

  const createCard = async () => {
    setCreating(true);
    try {
      await api.post('/cards/request', { cardType: newType, dailyLimit: parseFloat(newLimit) || 10000 });
      toast.success(`${newType === 'DEBIT' ? 'Debit' : 'Prepaid'} card created!`);
      setShowCreate(false);
      await fetchCards();
      realtime.publish(RealtimeEvent.CARDS_UPDATED);
      realtime.publish(RealtimeEvent.BALANCE_UPDATED);
    } catch (err: any) { toast.error(err?.message || 'Failed to create card'); }
    finally { setCreating(false); }
  };

  const toggleFreeze = async (cardId: number) => {
    setActionLoading(`freeze-${cardId}`);
    try {
      const { data } = await api.post(`/cards/${cardId}/freeze`);
      toast.success(data.message); await fetchCards();
      realtime.publish(RealtimeEvent.CARDS_UPDATED);
    } catch (err: any) { toast.error(err?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const cancelCard = async (cardId: number) => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    setActionLoading(`cancel-${cardId}`);
    try {
      const { data } = await api.post(`/cards/${cardId}/cancel`);
      toast.success(data.message); setExpandedId(null); await fetchCards();
      realtime.publish(RealtimeEvent.CARDS_UPDATED);
    } catch (err: any) { toast.error(err?.message || 'Failed'); }
    finally { setActionLoading(''); }
  };

  const handleFund = async () => {
    if (!fundModal || !fundAmount) return;
    setFunding(true);
    try {
      const { data } = await api.post(fundModal.mode === 'load' ? '/cards/load' : '/cards/unload', { cardId: fundModal.cardId, amount: parseFloat(fundAmount) });
      toast.success(data.message); setFundModal(null); setFundAmount(''); await fetchCards();
      realtime.publish(RealtimeEvent.CARDS_UPDATED);
      realtime.publish(RealtimeEvent.BALANCE_UPDATED);
    } catch (err: any) { toast.error(err?.message || 'Failed'); }
    finally { setFunding(false); }
  };

  const statusDot = (s: string) => s === 'ACTIVE' ? 'var(--success)' : s === 'FROZEN' ? '#3b82f6' : 'var(--danger)';

  if (loading) return (
    <section id="accounts" className="page active" style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <Loader2 size={32} style={{ color: 'var(--teal)', animation: 'ring-spin 1s linear infinite' }} />
    </section>
  );

  return (
    <section id="accounts" className="page active" style={{ display: 'block' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="section-title" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Cards & Accounts</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: f, margin: 0 }}>
            Account: <strong style={{ fontFamily: mono }}>{accountId}</strong> • Balance: <strong style={{ color: 'var(--teal)' }}>{fmt(accountBalance)} EGP</strong>
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,var(--teal),var(--blue))', color: '#fff', fontFamily: f, fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(14,203,203,0.3)' }}>
          <Plus size={16} /> New Card
        </button>
      </div>

      {/* Cards List — Vertical Stack */}
      {cards.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <CreditCard size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
          <p style={{ fontFamily: f, fontSize: '15px', color: 'var(--text-secondary)' }}>No cards yet. Create your first card!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cards.map(card => {
            const expanded = expandedId === card.id;
            const isDebit = card.card_type === 'DEBIT';
            const cardGrad = isDebit
              ? 'linear-gradient(135deg,#1a1f2e 0%,#2d3548 50%,#1a1f2e 100%)'
              : 'linear-gradient(135deg,#3730A3 0%,#6366f1 50%,#3730A3 100%)';
            const brandGrad = isDebit
              ? 'linear-gradient(90deg,#c0c0c0,#e8e8e8,#a0a0a0)'
              : 'linear-gradient(90deg,#d080ff,#a020f0,#e060ff)';

            return (
              <div key={card.id} className="glass-card" style={{ padding: 0, overflow: 'hidden', transition: 'box-shadow 0.3s ease', boxShadow: expanded ? '0 8px 32px rgba(0,0,0,0.15)' : undefined }}>
                {/* Card visual + clickable header */}
                <div
                  onClick={() => setExpandedId(expanded ? null : card.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 20px', cursor: 'pointer', transition: 'background 0.2s ease' }}
                >
                  {/* Mini card visual */}
                  <div style={{
                    width: '200px', minWidth: '200px', height: '120px', borderRadius: '16px', background: cardGrad,
                    padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    position: 'relative', overflow: 'hidden', flexShrink: 0,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  }}>
                    {/* Decorative glow circle */}
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: isDebit ? 'radial-gradient(circle,rgba(200,210,240,0.08),transparent)' : 'radial-gradient(circle,rgba(160,0,255,0.15),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
                    {card.status === 'FROZEN' && <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}><Snowflake size={12} style={{ color: '#60a5fa' }} /></div>}
                    {card.status === 'CANCELLED' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', zIndex: 2 }}><span style={{ fontFamily: f, fontWeight: 700, fontSize: '10px', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px' }}>Cancelled</span></div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '24px', height: '16px', borderRadius: '3px', background: 'linear-gradient(135deg,#f5d67b,#d4af37)', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                      <span style={{ fontFamily: f, fontSize: '7px', fontWeight: 800, letterSpacing: '1.5px', background: brandGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as any}>CREDIFY</span>
                    </div>
                    <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '1.5px', color: 'rgba(255,255,255,.75)', fontVariantNumeric: 'tabular-nums' }}>
                      {card.card_number_masked}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.6px', fontFamily: f }}>
                        {String(card.expiry_month).padStart(2, '0')}/{String(card.expiry_year).slice(-2)}
                      </div>
                      <span style={{ fontSize: '7px', fontWeight: 800, fontFamily: f, color: 'rgba(255,255,255,.65)', background: 'rgba(255,255,255,.1)', padding: '2px 7px', borderRadius: '5px' }}>{card.card_type}</span>
                    </div>
                  </div>

                  {/* Card info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: f, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{card.card_type} Card</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: statusDot(card.status), background: `${statusDot(card.status)}15`, padding: '3px 10px', borderRadius: '20px', fontFamily: f }}>● {card.status}</span>
                    </div>
                    <div style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{card.cardholder_name}</div>
                    <div style={{ fontFamily: f, fontSize: '13px', fontWeight: 700, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums' }}>
                      {card.card_type === 'PREPAID' ? `Prepaid: ${fmt(card.prepaid_balance)} EGP` : `Linked: ${card.linked_account_id || '—'}`}
                    </div>
                  </div>

                  {/* Expand arrow */}
                  <ChevronDown size={20} style={{ color: 'var(--text-secondary)', transition: 'transform 0.3s ease', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} />
                </div>

                {/* Expandable details */}
                <div style={{
                  maxHeight: expanded ? '300px' : '0', opacity: expanded ? 1 : 0, overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease, padding 0.3s ease',
                  borderTop: expanded ? '1px solid var(--glass-border)' : '1px solid transparent',
                  padding: expanded ? '20px' : '0 20px',
                }}>
                  {/* Detail chips */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px 16px', flex: '1 1 120px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: f, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Daily Limit</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: f, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(card.daily_limit)} EGP</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px 16px', flex: '1 1 120px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: f, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Expires</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', fontFamily: f, color: 'var(--text-primary)' }}>{String(card.expiry_month).padStart(2, '0')} / {card.expiry_year}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '12px 16px', flex: '1 1 120px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: f, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Created</div>
                      <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: f, color: 'var(--text-primary)' }}>{new Date(card.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    {card.card_type === 'PREPAID' && (
                      <div style={{ background: 'rgba(14,203,203,.06)', border: '1px solid rgba(14,203,203,.15)', borderRadius: '12px', padding: '12px 16px', flex: '1 1 120px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: f, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Prepaid Balance</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--teal)', fontFamily: f, fontVariantNumeric: 'tabular-nums' }}>{fmt(card.prepaid_balance)} EGP</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {card.status !== 'CANCELLED' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button onClick={(e) => { e.stopPropagation(); toggleFreeze(card.id); }} disabled={actionLoading === `freeze-${card.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid var(--glass-border)', background: 'var(--glass)', color: card.status === 'FROZEN' ? 'var(--success)' : '#3b82f6', fontFamily: f, fontWeight: 600, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <Snowflake size={13} /> {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                      </button>
                      {card.card_type === 'PREPAID' && card.status === 'ACTIVE' && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); setFundModal({ cardId: card.id, mode: 'load' }); setFundAmount(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,var(--teal),var(--blue))', color: '#fff', fontFamily: f, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                            <DollarSign size={13} /> Load Funds
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setFundModal({ cardId: card.id, mode: 'unload' }); setFundAmount(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                            <DollarSign size={13} /> Withdraw
                          </button>
                        </>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); cancelCard(card.id); }} disabled={actionLoading === `cancel-${card.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontFamily: f, fontWeight: 600, fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' }}>
                        <XCircle size={13} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Card Modal ── */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(4,9,24,0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowCreate(false)}>
          <div className="modal-inner" style={{ padding: '32px', maxWidth: '420px', width: '100%', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 20px' }}>Request New Card</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: '8px', fontFamily: f }}>Card Type</label>
              <div style={{ display: 'flex', gap: 0, background: 'var(--glass)', borderRadius: '12px', padding: '3px', border: '1px solid var(--glass-border)' }}>
                {(['DEBIT', 'PREPAID'] as const).map(t => (
                  <button key={t} onClick={() => setNewType(t)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: newType === t ? 700 : 500, fontFamily: f, background: newType === t ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'transparent', color: newType === t ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>{t === 'DEBIT' ? 'Debit Card' : 'Prepaid Card'}</button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f, marginTop: '8px' }}>
                {newType === 'DEBIT' ? 'Linked to your main account. Max 1 active.' : 'Separate balance, load funds as needed. Max 3 active.'}
              </p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: '8px', fontFamily: f }}>Daily Spending Limit (EGP)</label>
              <input type="text" value={newLimit} onChange={e => setNewLimit(e.target.value.replace(/\D/g, ''))} className="premium-input" style={{ width: '100%', borderRadius: '14px', padding: '14px 16px', fontSize: '14px', fontWeight: 700, fontFamily: mono }} placeholder="10000" />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={createCard} disabled={creating} style={{ flex: 1, padding: '15px', background: 'linear-gradient(135deg,var(--teal),var(--blue))', border: 'none', borderRadius: '14px', color: '#fff', fontFamily: f, fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(14,203,203,0.3)' }}>
                {creating ? <Loader2 size={16} style={{ animation: 'ring-spin 1s linear infinite' }} /> : <Plus size={16} />} {creating ? 'Creating...' : 'Create Card'}
              </button>
              <button onClick={() => setShowCreate(false)} style={{ padding: '15px 20px', border: '1.5px solid var(--glass-border)', borderRadius: '14px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: f }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Load/Unload Modal ── */}
      {fundModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(4,9,24,0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setFundModal(null)}>
          <div className="modal-inner" style={{ padding: '32px', maxWidth: '400px', width: '100%', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {fundModal.mode === 'load' ? 'Load Funds to Card' : 'Withdraw from Card'}
            </h3>
            <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              {fundModal.mode === 'load' ? `Available: ${fmt(accountBalance)} EGP` : 'Transfer back to main account'}
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block', marginBottom: '8px', fontFamily: f }}>Amount (EGP)</label>
              <input type="text" value={fundAmount} onChange={e => setFundAmount(e.target.value.replace(/[^0-9.]/g, ''))} className="premium-input" style={{ width: '100%', borderRadius: '14px', padding: '14px 16px', fontSize: '18px', fontWeight: 700, fontFamily: mono }} placeholder="0.00" autoFocus />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleFund} disabled={funding || !fundAmount} style={{ flex: 1, padding: '15px', background: parseFloat(fundAmount) > 0 ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'var(--glass)', border: parseFloat(fundAmount) > 0 ? 'none' : '1.5px solid var(--glass-border)', borderRadius: '14px', color: parseFloat(fundAmount) > 0 ? '#fff' : 'var(--text-secondary)', fontFamily: f, fontWeight: 700, fontSize: '14px', cursor: parseFloat(fundAmount) > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {funding ? <Loader2 size={16} style={{ animation: 'ring-spin 1s linear infinite' }} /> : <DollarSign size={16} />} {funding ? 'Processing...' : 'Confirm'}
              </button>
              <button onClick={() => setFundModal(null)} style={{ padding: '15px 20px', border: '1.5px solid var(--glass-border)', borderRadius: '14px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: f }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountsPage;
