import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Landmark, Calculator, Clock, TrendingUp, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, AlertCircle, Send, Percent, Calendar,
  DollarSign, FileText, ArrowRight, BadgeCheck, Ban, HelpCircle, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { financeService } from '../../services/finance.service';

// ─── Helpers ─────────────────────────────────────────────────
const f = '"Inter",sans-serif';
const mono = '"DM Mono",monospace';
const formatEGP = (val: number) => val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TENURE_OPTIONS = [6, 12, 24, 36, 48, 60];

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  PENDING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={14} />, label: 'Pending Review' },
  APPROVED: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={14} />, label: 'Approved' },
  ACTIVE: { color: '#0ecbcb', bg: 'rgba(14,203,203,0.12)', icon: <BadgeCheck size={14} />, label: 'Active' },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={14} />, label: 'Rejected' },
  COMPLETED: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: <CheckCircle2 size={14} />, label: 'Completed' },
};

// ─── Main Component ──────────────────────────────────────────
const LoansPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Calculator state
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(24);
  const [purpose, setPurpose] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [expandedLoanId, setExpandedLoanId] = useState<number | null>(null);

  // Calculate preview
  const [calcResult, setCalcResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsCalculating(true);
      try {
        const result = await financeService.calculateLoan(amount, tenure);
        if (!cancelled) setCalcResult(result);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsCalculating(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [amount, tenure]);

  // My loans
  const { data: myLoans = [], isLoading: isLoadingLoans } = useQuery({
    queryKey: ['my-loans'],
    queryFn: financeService.getMyLoans,
    refetchInterval: 10000,
  });

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: () => financeService.applyForLoan(amount, tenure, purpose || undefined),
    onSuccess: () => {
      toast.success('Loan application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-loans'] });
      setShowApplyForm(false);
      setPurpose('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to submit application');
    },
  });

  const activeOrPendingCount = myLoans.filter((l: any) => l.status === 'PENDING' || l.status === 'ACTIVE').length;
  const canApply = activeOrPendingCount < 2;

  return (
    <section id="loans" className="page active">
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: f, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            <span style={{ color: 'var(--text-primary)' }}>Personal </span>
            <span style={{ background: 'linear-gradient(135deg, var(--teal), var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Loans</span>
          </div>
          <p style={{ fontFamily: f, color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', margin: '4px 0 0 0' }}>
            Calculate, apply, and track your loan applications.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

        {/* ─── LEFT COLUMN ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ═══ LOAN CALCULATOR ═══ */}
          <div className="glass-card" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(14,203,203,0.08), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(14,203,203,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calculator size={20} style={{ color: 'var(--teal)' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: f, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>Loan Calculator</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontFamily: f }}>Adjust amount & tenure to preview repayment</p>
              </div>
            </div>

            {/* Amount Slider */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Loan Amount</span>
                <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: f, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  EGP {formatEGP(amount)}
                </span>
              </div>
              <input
                type="range"
                min="5000" max="1000000" step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  width: '100%', height: '6px', borderRadius: '3px', outline: 'none', cursor: 'pointer',
                  appearance: 'none', WebkitAppearance: 'none',
                  background: `linear-gradient(to right, var(--teal) ${((amount - 5000) / 995000) * 100}%, var(--glass-border) ${((amount - 5000) / 995000) * 100}%)`,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f }}>EGP 5,000</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f }}>EGP 1,000,000</span>
              </div>
            </div>

            {/* Tenure Selector */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, display: 'block', marginBottom: '10px' }}>Loan Tenure</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                {TENURE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenure(t)}
                    style={{
                      padding: '10px 0', borderRadius: '10px', cursor: 'pointer', fontFamily: f,
                      fontSize: '13px', fontWeight: tenure === t ? 700 : 500, transition: 'all 0.2s ease',
                      background: tenure === t ? 'var(--teal)' : 'var(--glass)',
                      color: tenure === t ? '#fff' : 'var(--text-secondary)',
                      border: tenure === t ? 'none' : '1px solid var(--glass-border)',
                      boxShadow: tenure === t ? '0 4px 12px rgba(14,203,203,0.3)' : 'none',
                    }}
                  >
                    {t}mo
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {calcResult && (
              <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px',
                opacity: isCalculating ? 0.5 : 1, transition: 'opacity 0.2s'
              }}>
                {[
                  { label: 'Monthly Payment', value: `EGP ${formatEGP(calcResult.monthlyPayment)}`, icon: <Calendar size={16} />, color: 'var(--teal)', bg: 'rgba(14,203,203,0.1)' },
                  { label: 'Interest Rate', value: `${calcResult.interestRate}% / year`, icon: <Percent size={16} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  { label: 'Total Interest', value: `EGP ${formatEGP(calcResult.totalInterest)}`, icon: <TrendingUp size={16} />, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
                  { label: 'Total Repayment', value: `EGP ${formatEGP(calcResult.totalRepayment)}`, icon: <DollarSign size={16} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
                ].map((item) => (
                  <div key={item.label} style={{ padding: '16px', borderRadius: '14px', background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: f, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}



            {/* Apply Button / Form */}
            {!showApplyForm ? (
              <button
                onClick={() => setShowApplyForm(true)}
                disabled={!canApply}
                className="btn-primary"
                style={{
                  width: '100%', padding: '14px', fontSize: '14px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: !canApply ? 0.5 : 1, cursor: !canApply ? 'not-allowed' : 'pointer',
                }}
              >
                <Landmark size={18} />
                {!canApply ? 'Maximum Loan Limit Reached (2)' : 'Apply for This Loan'}
              </button>
            ) : (
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, fontFamily: f, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Loan Purpose (Optional)</h3>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Home renovation, Car purchase, Education..."
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', fontFamily: f, fontSize: '13px',
                    border: '1px solid var(--glass-border)', background: 'var(--glass)',
                    color: 'var(--text-primary)', resize: 'vertical', minHeight: '80px',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    onClick={() => setShowApplyForm(false)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)',
                      background: 'var(--glass)', color: 'var(--text-secondary)', fontSize: '13px',
                      fontWeight: 600, fontFamily: f, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => applyMutation.mutate()}
                    disabled={applyMutation.isPending}
                    className="btn-primary"
                    style={{
                      flex: 2, padding: '12px', fontSize: '13px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    {applyMutation.isPending ? (
                      <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                    ) : (
                      <><Send size={16} /> Submit Application</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ═══ QUICK SUMMARY ═══ */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: f, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Loan Summary</h3>
            {calcResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', opacity: isCalculating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                {[
                  { label: 'You borrow', value: `EGP ${formatEGP(amount)}` },
                  { label: 'You receive', value: `EGP ${formatEGP(calcResult.netDisbursement)}` },
                  { label: 'Monthly payment', value: `EGP ${formatEGP(calcResult.monthlyPayment)}` },
                  { label: 'For', value: `${tenure} months` },
                  { label: 'You repay', value: `EGP ${formatEGP(calcResult.totalRepayment)}` },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: f }}>{row.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: f, color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Loader2 size={20} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
          </div>

          {/* ═══ MY LOANS ═══ */}
          <div className="glass-card" style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ padding: '0 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: f, color: 'var(--text-primary)', margin: 0 }}>My Loans</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 500 }}>
                {myLoans.length} total
              </span>
            </div>

            <div style={{ flex: 1 }}>
              {isLoadingLoans ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : myLoans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                  <Landmark size={36} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '12px' }} />
                  <p style={{ fontFamily: f, fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>No loans yet</p>
                  <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Use the calculator to apply for your first loan.</p>
                </div>
              ) : (
                myLoans.map((loan: any) => {
                  const status = STATUS_CONFIG[loan.status] || STATUS_CONFIG.PENDING;
                  const isExpanded = expandedLoanId === loan.id;
                  return (
                    <div key={loan.id}>
                      <div
                        onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '14px 24px', cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--row-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: status.color }}>
                            <Landmark size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: f, color: 'var(--text-primary)' }}>
                              EGP {formatEGP(parseFloat(loan.amount))}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f }}>
                              {loan.tenure_months}mo · {loan.interest_rate}% · EGP {formatEGP(parseFloat(loan.monthly_payment))}/mo
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            fontFamily: f, color: status.color, background: status.bg,
                          }}>
                            {status.icon} {status.label}
                          </span>
                          {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div style={{ padding: '0 24px 16px', animation: 'fadein 0.2s ease' }}>
                          <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: loan.rejection_reason ? '12px' : '0' }}>
                              {[
                                { l: 'Total Repayment', v: `EGP ${formatEGP(parseFloat(loan.total_repayment))}` },
                                { l: 'Total Interest', v: `EGP ${formatEGP(parseFloat(loan.total_interest))}` },
                                { l: 'Admin Fee', v: `EGP ${formatEGP(parseFloat(loan.admin_fee))}` },
                                { l: 'Applied', v: new Date(loan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                              ].map(r => (
                                <div key={r.l}>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f, marginBottom: '2px' }}>{r.l}</div>
                                  <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: f, color: 'var(--text-primary)' }}>{r.v}</div>
                                </div>
                              ))}
                            </div>
                            {loan.purpose && (
                              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(14,203,203,0.05)', border: '1px solid rgba(14,203,203,0.1)' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: f }}>Purpose: </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: f }}>{loan.purpose}</span>
                              </div>
                            )}
                            {loan.rejection_reason && (
                              <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                <span style={{ fontSize: '11px', color: '#ef4444', fontFamily: f, fontWeight: 600 }}>Rejection Reason: </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: f }}>{loan.rejection_reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--teal);
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(14,203,203,0.4);
          transition: transform 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--teal);
          cursor: pointer;
          border: 3px solid #fff;
          box-shadow: 0 2px 8px rgba(14,203,203,0.4);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default LoansPage;
