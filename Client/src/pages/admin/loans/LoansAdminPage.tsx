import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Landmark, Clock, CheckCircle2, XCircle, Loader2, BadgeCheck,
  Search, ChevronDown, ChevronUp, User, Calendar, Percent,
  TrendingUp, DollarSign, AlertTriangle, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { financeService } from '../../../services/finance.service';
import { realtime, RealtimeEvent } from '../../../lib/realtime';

// ─── Helpers ─────────────────────────────────────────────────
const f = '"Inter",sans-serif';
const mono = '"JetBrains Mono",monospace';
const formatEGP = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={14} />, label: 'Pending' },
  APPROVED: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={14} />, label: 'Approved' },
  ACTIVE: { color: '#0ecbcb', bg: 'rgba(14,203,203,0.12)', icon: <BadgeCheck size={14} />, label: 'Active' },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={14} />, label: 'Rejected' },
  COMPLETED: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: <CheckCircle2 size={14} />, label: 'Completed' },
};

const FILTER_TABS = ['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'COMPLETED'];

// ─── Main Component ──────────────────────────────────────────
const LoansAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLoanId, setExpandedLoanId] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ loanId: number; userName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch all loans
  const { data: allLoans = [], isLoading } = useQuery({
    queryKey: ['admin-loans', statusFilter],
    queryFn: () => financeService.getAllLoans(statusFilter !== 'ALL' ? statusFilter : undefined),
    refetchInterval: 8000,
  });

  // Filter by search
  const filteredLoans = allLoans.filter((loan: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${loan.first_name} ${loan.last_name}`.toLowerCase();
    return fullName.includes(q) || loan.email?.toLowerCase().includes(q) || String(loan.id).includes(q);
  });

  // Stats
  const stats = {
    pending: allLoans.filter((l: any) => l.status === 'PENDING').length,
    approved: allLoans.filter((l: any) => l.status === 'APPROVED' || l.status === 'ACTIVE').length,
    totalDisbursed: allLoans
      .filter((l: any) => l.status === 'ACTIVE' || l.status === 'APPROVED' || l.status === 'COMPLETED')
      .reduce((sum: number, l: any) => sum + parseFloat(l.amount || 0), 0),
    totalInterest: allLoans
      .filter((l: any) => l.status === 'ACTIVE' || l.status === 'APPROVED' || l.status === 'COMPLETED')
      .reduce((sum: number, l: any) => sum + parseFloat(l.total_interest || 0), 0),
  };

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: number) => financeService.approveLoan(id),
    onSuccess: (_, id) => {
      toast.success('Loan approved and funds disbursed!');
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      realtime.publish(RealtimeEvent.ADMIN_LOANS_UPDATED);
      realtime.publish(RealtimeEvent.LOANS_UPDATED);
      realtime.publish(RealtimeEvent.BALANCE_UPDATED);
      realtime.pushNotification({
        title: 'Loan Approved',
        message: `Loan application #${id} has been approved and funds disbursed.`
      });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => financeService.rejectLoan(id, reason),
    onSuccess: (_, { id, reason }) => {
      toast.success('Loan rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      realtime.publish(RealtimeEvent.ADMIN_LOANS_UPDATED);
      realtime.publish(RealtimeEvent.LOANS_UPDATED);
      setRejectModal(null);
      setRejectReason('');
      realtime.pushNotification({
        title: 'Loan Rejected',
        message: `Loan application #${id} was rejected: ${reason}`
      });
    },
    onError: (err: any) => toast.error(err?.response?.data?.error || 'Failed to reject'),
  });

  return (
    <div style={{ fontFamily: f }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: '0 0 4px 0' }}>
          Loan Management
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Review, approve, and manage loan applications.
        </p>
      </div>

      {/* Stats Cards */}
      {/* Stats Cards */}
      <div className="loans-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Review', value: stats.pending, icon: <Clock size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Approved / Active', value: stats.approved, icon: <CheckCircle2 size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Total Disbursed', value: `EGP ${formatEGP(stats.totalDisbursed)}`, icon: <DollarSign size={20} />, color: '#0ecbcb', bg: 'rgba(14,203,203,0.12)' },
          { label: 'Expected Interest', value: `EGP ${formatEGP(stats.totalInterest)}`, icon: <TrendingUp size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '2px' }}>{stat.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="glass-card" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div className="loans-filter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className="loans-tabs-container" style={{ display: 'flex', gap: '4px', background: 'var(--glass)', borderRadius: '10px', padding: '4px', border: '1px solid var(--glass-border)' }}>
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: statusFilter === tab ? 700 : 500, fontFamily: f,
                  background: statusFilter === tab ? 'var(--teal)' : 'transparent',
                  color: statusFilter === tab ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  boxShadow: statusFilter === tab ? '0 2px 8px rgba(14,203,203,0.3)' : 'none',
                }}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                background: 'var(--glass)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: f,
                outline: 'none', width: '240px', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div style={{ padding: '0', overflow: 'hidden' }}>
        {/* Table Header */}
        <div className="loans-table-header" style={{
          display: 'grid', gridTemplateColumns: '60px 1.5fr 1fr 0.6fr 0.7fr 1fr 140px',
          padding: '10px 24px', marginBottom: '8px', opacity: 0.8,
        }}>
          {['ID', 'Applicant', 'Amount', 'Tenure', 'Rate', 'Status', 'Actions'].map((h) => (
            <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: f }}>{h}</span>
          ))}
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Loader2 size={28} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
            <Landmark size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: 500 }}>No loan applications found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="loans-desktop-table" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLoans.map((loan: any) => {
                const status = STATUS_CONFIG[loan.status] || STATUS_CONFIG.PENDING;
                const isExpanded = expandedLoanId === loan.id;
                return (
                  <div key={loan.id} className={`loan-card-wrapper ${isExpanded ? 'expanded' : ''}`}>
                    <div
                      className="loan-wide-row"
                      onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: mono, color: 'var(--text-secondary)' }}>#{loan.id}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={15} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{loan.first_name} {loan.last_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{loan.email}</div>
                        </div>
                      </div>

                      <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>
                        EGP {formatEGP(parseFloat(loan.amount))}
                      </span>

                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{loan.tenure_months}mo</span>

                      <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: mono, color: 'var(--text-primary)' }}>{loan.interest_rate}%</span>

                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', width: 'fit-content',
                        padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        color: status.color, background: status.bg,
                      }}>
                        {status.icon} {status.label}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(loan.id)}
                              disabled={approveMutation.isPending}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontSize: '11px', fontWeight: 600, fontFamily: f,
                                background: 'rgba(16,185,129,0.15)', color: '#10b981',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.color = '#10b981'; }}
                            >
                              <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ loanId: loan.id, userName: `${loan.first_name} ${loan.last_name}` })}
                              style={{
                                padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                fontSize: '11px', fontWeight: 600, fontFamily: f,
                                background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444'; }}
                            >
                              <XCircle size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                              Reject
                            </button>
                          </>
                        )}
                        {loan.status !== 'PENDING' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Row Details */}
                    {isExpanded && (
                      <div className="loan-expanded-details">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                          {[
                            { l: 'Monthly Payment', v: `EGP ${formatEGP(parseFloat(loan.monthly_payment))}` },
                            { l: 'Total Repayment', v: `EGP ${formatEGP(parseFloat(loan.total_repayment))}` },
                            { l: 'Total Interest', v: `EGP ${formatEGP(parseFloat(loan.total_interest))}` },
                            { l: 'Admin Fee', v: `EGP ${formatEGP(parseFloat(loan.admin_fee))}` },
                            { l: 'Applied On', v: new Date(loan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                          ].map((r) => (
                            <div key={r.l}>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>{r.l}</div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.v}</div>
                            </div>
                          ))}
                        </div>
                        {loan.purpose && (
                          <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(14,203,203,0.05)', border: '1px solid rgba(14,203,203,0.1)' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Purpose: </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{loan.purpose}</span>
                          </div>
                        )}
                        {loan.rejection_reason && (
                          <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>Rejection Reason: </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{loan.rejection_reason}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="loans-mobile-list">
              {filteredLoans.map((loan: any) => {
                const status = STATUS_CONFIG[loan.status] || STATUS_CONFIG.PENDING;
                const isExpanded = expandedLoanId === loan.id;
                return (
                  <div key={loan.id} className="loans-mobile-card" style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'transparent',
                    cursor: 'pointer'
                  }} onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}>
                    {/* Top row: ID, Status, and Expand Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: mono, color: 'var(--text-secondary)' }}>#{loan.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600,
                          color: status.color, background: status.bg,
                        }}>
                          {status.icon} {status.label}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </div>
                    </div>

                    {/* Middle row: Applicant Details & Amount */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={14} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{loan.first_name} {loan.last_name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{loan.email}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>EGP {formatEGP(parseFloat(loan.amount))}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{loan.tenure_months}mo · {loan.interest_rate}% rate</div>
                      </div>
                    </div>

                    {/* Action buttons (only shown for pending loans, stop propagation to prevent expand toggle) */}
                    {loan.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => approveMutation.mutate(loan.id)}
                          disabled={approveMutation.isPending}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontSize: '11px', fontWeight: 600, fontFamily: f,
                            background: 'rgba(16,185,129,0.15)', color: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; e.currentTarget.style.color = '#10b981'; }}
                        >
                          <CheckCircle2 size={12} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ loanId: loan.id, userName: `${loan.first_name} ${loan.last_name}` })}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontSize: '11px', fontWeight: 600, fontFamily: f,
                            background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        marginTop: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {[
                            { l: 'Monthly Payment', v: `EGP ${formatEGP(parseFloat(loan.monthly_payment))}` },
                            { l: 'Total Repayment', v: `EGP ${formatEGP(parseFloat(loan.total_repayment))}` },
                            { l: 'Total Interest', v: `EGP ${formatEGP(parseFloat(loan.total_interest))}` },
                            { l: 'Admin Fee', v: `EGP ${formatEGP(parseFloat(loan.admin_fee))}` },
                            { l: 'Applied On', v: new Date(loan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                          ].map((r) => (
                            <div key={r.l}>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 500 }}>{r.l}</div>
                              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.v}</div>
                            </div>
                          ))}
                        </div>
                        {loan.purpose && (
                          <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(14,203,203,0.05)', border: '1px solid rgba(14,203,203,0.1)' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>Purpose</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>{loan.purpose}</div>
                          </div>
                        )}
                        {loan.rejection_reason && (
                          <div style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600, marginBottom: '2px' }}>Rejection Reason</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>{loan.rejection_reason}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─── Reject Modal ─── */}
      {rejectModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => { setRejectModal(null); setRejectReason(''); }}>
          <div
            style={{
              width: '440px', borderRadius: '20px', padding: '28px',
              background: 'var(--card-bg, #fff)', border: '1px solid var(--glass-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Reject Loan</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{rejectModal.userName}'s application</p>
                </div>
              </div>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', fontSize: '13px', fontFamily: f,
                border: '1px solid var(--glass-border)', background: 'var(--glass)',
                color: 'var(--text-primary)', resize: 'vertical', minHeight: '100px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                  background: 'var(--glass)', color: 'var(--text-secondary)', fontSize: '13px',
                  fontWeight: 600, fontFamily: f, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal.loanId, reason: rejectReason })}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                style={{
                  flex: 2, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, fontFamily: f,
                  background: rejectReason.trim() ? '#ef4444' : 'rgba(239,68,68,0.3)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {rejectMutation.isPending ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Rejecting...</>
                ) : (
                  <><XCircle size={16} /> Confirm Rejection</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          .loans-filter-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .loans-tabs-container {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            width: 100% !important;
            gap: 4px !important;
            padding: 4px !important;
          }
          .loans-tabs-container button {
            padding: 8px 4px !important;
            text-align: center !important;
            width: 100% !important;
            font-size: 11px !important;
          }
          .loans-filter-row > div:last-child {
            width: 100% !important;
          }
          .loans-filter-row input {
            width: 100% !important;
          }
        }
      `}} />
    </div>
  );
};

export default LoansAdminPage;
