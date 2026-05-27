import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock, Loader2, ChevronRight, AlertTriangle } from 'lucide-react';
import { api } from '../../../lib/api';

// ── Types ──
interface AdminUser {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  role: string;
  kyc_status: string;
  kyc_app_status: string;
  face_match_score: number | null;
  face_match_passed: boolean | null;
  created_at: string;
}

interface Transaction {
  id: number;
  sender_id: number;
  sender_account_id: string;
  type: string;
  amount: number;
  fee: number;
  recipient_name: string;
  recipient_account: string;
  created_at: string;
}

const f = '"Inter",sans-serif';
const mono = '"DM Mono",monospace';
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return (data.users || []) as AdminUser[];
    },
  });

  const { data: txData, isLoading: isLoadingTx } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/transactions?global=true');
      return (data.transactions || []) as Transaction[];
    },
  });

  const users = usersData ?? [];
  const transactions = txData ?? [];
  const loading = isLoadingUsers || isLoadingTx;

  // ── Derived stats ──
  const totalUsers = users.filter(u => u.role !== 'ADMIN').length;
  const pendingKyc = users.filter(u => u.kyc_app_status === 'PENDING_ADMIN_REVIEW').length;
  const approvedUsers = users.filter(u => u.kyc_status === 'APPROVED').length;
  const totalTx = transactions.length;
  const totalVolume = transactions.reduce((s, t) => s + parseFloat(String(t.amount)), 0);
  const totalFees = transactions.reduce((s, t) => s + parseFloat(String(t.fee || 0)), 0);

  const kpis = [
    { label: 'Total Users', value: String(totalUsers), icon: <Users size={18} />, color: 'var(--accent, #5bc8f5)', bg: 'rgba(91,200,245,0.12)' },
    { label: 'Pending KYC', value: String(pendingKyc), icon: <Clock size={18} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', alert: pendingKyc > 0 },
    { label: 'Approved Users', value: String(approvedUsers), icon: <ShieldCheck size={18} />, color: 'var(--success, #00e88f)', bg: 'rgba(0,232,143,0.12)' },
    { label: 'Transactions', value: String(totalTx), icon: <ArrowUpRight size={18} />, color: 'var(--teal, #0ecbcb)', bg: 'rgba(14,203,203,0.12)' },
    { label: 'Volume (EGP)', value: fmt(totalVolume), icon: <DollarSign size={18} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Fees Earned', value: fmt(totalFees), icon: <DollarSign size={18} />, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  ];

  if (loading) {
    return (
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Real-time overview — {totalUsers} users, {totalTx} transactions</p>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {kpis.map(k => (
          <div key={k.label} className="admin-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
            {k.alert && <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px rgba(245,158,11,0.5)', animation: 'pulse 2s infinite' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted, var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: f, letterSpacing: '-0.5px' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Pending KYC Alert ── */}
      {pendingKyc > 0 && (
        <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>{pendingKyc} KYC application{pendingKyc > 1 ? 's' : ''} awaiting review</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, var(--text-secondary))', fontFamily: f }}>Users are waiting for admin approval to access banking services</div>
            </div>
          </div>
          <button onClick={() => navigate('/admin/kyc')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, fontFamily: f, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            Review Now <ChevronRight size={14} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* ── Users Table ── */}
        <div className="admin-card" style={{ padding: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="section-title" style={{ margin: 0 }}>All Users</div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted, var(--text-secondary))', fontWeight: 600, fontFamily: mono }}>{totalUsers} total</span>
          </div>
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {users.filter(u => u.role !== 'ADMIN').map(u => {
              const statusColor = u.kyc_status === 'APPROVED' ? 'var(--success, #00e88f)' : u.kyc_app_status === 'PENDING_ADMIN_REVIEW' ? '#f59e0b' : u.kyc_status === 'REJECTED' ? 'var(--danger, #ff4d6a)' : 'var(--text-muted, var(--text-secondary))';
              const statusLabel = u.kyc_status === 'APPROVED' ? 'APPROVED' : u.kyc_app_status === 'PENDING_ADMIN_REVIEW' ? 'PENDING REVIEW' : u.kyc_status === 'REJECTED' ? 'REJECTED' : u.kyc_app_status?.replace(/_/g, ' ') || 'PENDING';
              const initials = (u.first_name[0] + u.last_name[0]).toUpperCase();
              return (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border, var(--glass-border))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal, #0ecbcb), var(--blue, #1a6fff))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.first_name} {u.last_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, var(--text-secondary))', fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor, letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0, padding: '3px 8px', borderRadius: '6px', background: `${statusColor}14` }}>{statusLabel}</span>
                </div>
              );
            })}
            {totalUsers === 0 && <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted, var(--text-secondary))', fontSize: '13px', fontFamily: f }}>No users registered yet</div>}
          </div>
        </div>

        {/* ── Recent Transactions ── */}
        <div className="admin-card" style={{ padding: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="section-title" style={{ margin: 0 }}>Recent Transactions</div>
            <button onClick={() => navigate('/admin/transactions')} style={{ fontSize: '11px', color: 'var(--teal, #0ecbcb)', fontWeight: 600, fontFamily: f, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>View All <ChevronRight size={12} /></button>
          </div>
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {transactions.slice(0, 15).map(tx => {
              const isSent = true; // All transactions in the global list are outgoing from sender
              return (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border, var(--glass-border))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,77,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArrowUpRight size={14} style={{ color: 'var(--danger, #ff4d6a)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        To: {tx.recipient_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, var(--text-secondary))', fontFamily: mono }}>
                        {tx.type.replace(/_/g, ' ')} · {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--danger, #ff4d6a)', fontFamily: f, fontVariantNumeric: 'tabular-nums' }}>-{fmt(parseFloat(String(tx.amount)))} EGP</div>
                    {parseFloat(String(tx.fee)) > 0 && <div style={{ fontSize: '10px', color: 'var(--text-muted, var(--text-secondary))', fontFamily: mono }}>fee: {fmt(parseFloat(String(tx.fee)))}</div>}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted, var(--text-secondary))', fontSize: '13px', fontFamily: f }}>No transactions yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
