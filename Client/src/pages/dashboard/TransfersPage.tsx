import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, ArrowRight, CreditCard, User, Hash, FileText, DollarSign, Building2, Globe, AlertCircle, Loader2, Star, Trash2, ChevronDown } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { realtime, RealtimeEvent } from '../../lib/realtime';
import { queryClient } from '../../lib/queryClient';

const fmt = (n: number) => new Intl.NumberFormat("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const FEE_RATE = 0.001; // 0.1% — matches backend TRANSFER_FEE_RATE

type TransferType = 'SAME_BANK' | 'DOMESTIC' | 'INTERNATIONAL';

interface Beneficiary {
  id: number;
  type: TransferType;
  name: string;
  account_number: string;
  bank_name?: string;
  swift_code?: string;
  address?: string;
}

const TransfersPage: React.FC = () => {
  // Account state from backend
  const [accountId, setAccountId] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isBeneficiariesOpen, setIsBeneficiariesOpen] = useState(false);
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const beneficiaryRef = useRef<HTMLDivElement>(null);

  // Form
  const [transferType, setTransferType] = useState<TransferType>('SAME_BANK');
  const [amount, setAmount] = useState(0);
  const [amtStr, setAmtStr] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [acctSameBank, setAcctSameBank] = useState('');
  const [acctDomestic, setAcctDomestic] = useState('');
  const [acctInternational, setAcctInternational] = useState('');

  const recipientAccount =
    transferType === 'SAME_BANK' ? acctSameBank :
      transferType === 'DOMESTIC' ? acctDomestic :
        acctInternational;

  const setRecipientAccount = (val: string) => {
    if (transferType === 'SAME_BANK') setAcctSameBank(val);
    else if (transferType === 'DOMESTIC') setAcctDomestic(val);
    else setAcctInternational(val);
  };

  const [recipientBank, setRecipientBank] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [reference, setReference] = useState('');

  // Flow state
  const [step, setStep] = useState(1); // 1=details, 2=review, 3=otp, 4=done
  const [transferId, setTransferId] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Computed
  let fee = Math.round(amount * FEE_RATE * 100) / 100;
  if (amount > 0) {
    if (fee < 0.5) fee = 0.5;
    if (fee > 20) fee = 20;
  }
  const totalDebit = amount + fee;

  const f = '"Inter",sans-serif';
  const mono = '"DM Mono",monospace';

  // ─── Fetch account balance on mount ───
  useEffect(() => {
    (async () => {
      try {
        const [meRes, benRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/transfer/beneficiaries')
        ]);
        const data = meRes.data;
        if (data.user?.account) {
          setAccountId(data.user.account.accountId);
          setBalance(parseFloat(data.user.account.balance));
        }
        setBeneficiaries(benRes.data.beneficiaries || []);
      } catch {
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    })();

    // Outside click handler
    const handleClickOutside = (e: MouseEvent) => {
      if (beneficiaryRef.current && !beneficiaryRef.current.contains(e.target as Node)) {
        setIsBeneficiariesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  // Refresh balance
  const refreshBalance = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.user?.account) {
        setBalance(parseFloat(data.user.account.balance));
      }
    } catch { /* silent */ }
  };

  // ─── Input handlers ───
  const onAcct = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (transferType === 'SAME_BANK') {
      v = v.substring(0, 12);
      setRecipientAccount(v);
    } else {
      v = v.replace(/[^0-9]/g, '').substring(0, 16);
      setRecipientAccount(v.match(/.{1,4}/g)?.join(' ') || v);
    }
  };

  const onAmt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
    setAmount(p);
    setAmtStr(p > 0 ? new Intl.NumberFormat('en-EG').format(p) : '');
  };

  // ─── Validation ───
  const rawAcctLen = recipientAccount.replace(/\s/g, '').length;
  const isAcctLengthValid = (transferType === 'SAME_BANK')
    ? rawAcctLen === 12
    : rawAcctLen === 16;

  const isBaseValid = recipientName.length > 2 && isAcctLengthValid && amount > 0 && totalDebit <= balance;
  const isDomesticValid = transferType !== 'DOMESTIC' || recipientBank.length > 1;
  const isInternationalValid = transferType !== 'INTERNATIONAL' || (recipientBank.length > 1 && swiftCode.length >= 8 && recipientAddress.length > 3);
  const valid = isBaseValid && isDomesticValid && isInternationalValid;

  // ─── Step 1 → 2: Initiate transfer (sends OTP) ───
  const initiateTransfer = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      const payload: any = {
        type: transferType,
        amount,
        recipientName,
        recipientAccount: recipientAccount.replace(/\s/g, ''),
        reference: reference || undefined,
      };
      if (transferType !== 'SAME_BANK') payload.recipientBank = recipientBank;
      if (transferType === 'INTERNATIONAL') {
        payload.swiftCode = swiftCode;
        payload.recipientAddress = recipientAddress;
      }

      const { data } = await api.post('/transfer/initiate', payload);

      if (data.otpRequired === false) {
        // Admin bypass — transfer executed immediately
        setStep(4);
        toast.success('Transfer successful!');
        if (saveBeneficiary) await handleSaveBeneficiary();
        await refreshBalance();
        queryClient.invalidateQueries({ queryKey: ['balance'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        realtime.publish(RealtimeEvent.TRANSACTIONS_UPDATED);
        setTimeout(() => resetForm(), 4000);
      } else {
        setTransferId(data.transferId);
        setStep(3); // Go to OTP step
        toast.success('Verification code sent to your email');
      }
    } catch (err: any) {
      toast.error(err?.message || err?.error || 'Failed to initiate transfer');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step 3: Confirm with OTP ───
  const confirmTransfer = async () => {
    if (otp.length !== 6) return;
    setConfirming(true);
    try {
      await api.post('/transfer/confirm', { transferId, otp });
      setStep(4);
      toast.success('Transfer successful!');
      if (saveBeneficiary) await handleSaveBeneficiary();
      await refreshBalance();
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      realtime.publish(RealtimeEvent.TRANSACTIONS_UPDATED);
      setTimeout(() => resetForm(), 4000);
    } catch (err: any) {
      toast.error(err?.message || err?.error || 'Verification failed');
    } finally {
      setConfirming(false);
    }
  };

  const resetForm = () => {
    setRecipientName('');
    setAcctSameBank('');
    setAcctDomestic('');
    setAcctInternational('');
    setRecipientBank('');
    setSwiftCode('');
    setRecipientAddress('');
    setReference('');
    setAmtStr(''); setAmount(0); setOtp(''); setTransferId('');
    setSaveBeneficiary(false);
    setStep(1);
  };


  const handleSaveBeneficiary = async () => {
    try {
      const payload: any = { type: transferType, name: recipientName, accountNumber: recipientAccount.replace(/\s/g, '') };
      if (transferType !== 'SAME_BANK') payload.bankName = recipientBank;
      if (transferType === 'INTERNATIONAL') {
        payload.swiftCode = swiftCode;
        payload.address = recipientAddress;
      }
      const { data } = await api.post('/transfer/beneficiaries', payload);
      setBeneficiaries(prev => {
        const exists = prev.find(b => b.account_number === data.beneficiary.account_number);
        if (exists) return prev.map(b => b.account_number === data.beneficiary.account_number ? data.beneficiary : b);
        return [data.beneficiary, ...prev];
      });
      toast.success('Beneficiary saved!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save beneficiary: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteBeneficiary = async (id: number) => {
    try {
      await api.delete(`/transfer/beneficiaries/${id}`);
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      toast.success('Beneficiary deleted');
    } catch {
      toast.error('Failed to delete beneficiary');
    }
  };

  const selectBeneficiary = (b: Beneficiary) => {
    setTransferType(b.type);
    setRecipientName(b.name);

    // Format account if it's alphanumeric/numeric
    const cleanAcct = b.account_number.replace(/\s/g, '').toUpperCase();
    if (b.type === 'SAME_BANK') {
      setRecipientAccount(cleanAcct.substring(0, 12));
    } else {
      setRecipientAccount((cleanAcct.match(/.{1,4}/g)?.join(' ') || cleanAcct).substring(0, 19));
    }

    setRecipientBank(b.bank_name || '');
    setSwiftCode(b.swift_code || '');
    setRecipientAddress(b.address || '');
    toast.success('Beneficiary selected');
  };

  const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f };
  const inputStyle: React.CSSProperties = { width: '100%', borderRadius: '14px', padding: '14px 16px', fontSize: '14px', fontWeight: 600, fontFamily: f };

  const steps = [
    { id: 1, label: 'Details' },
    { id: 2, label: 'Verify' },
    { id: 3, label: 'Done' },
  ];

  if (loading) {
    return (
      <section id="transfers" className="page active" style={{ display: 'flex' }}>
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', width: '100%', maxWidth: '680px' }}>
          <Loader2 size={32} style={{ color: 'var(--teal)', animation: 'ring-spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-secondary)', fontFamily: f, marginTop: '16px' }}>Loading account...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="transfers" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div className="transfers-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%', maxWidth: '1400px' }}>

        {/* Left Spacer */}
        <div className="transfers-left-col" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: '24px' }}>
          {/* Left Column: Beneficiaries Dropdown */}
          <div ref={beneficiaryRef} className="transfers-beneficiary-wrap" style={{ position: 'relative', width: '240px', flexShrink: 0, zIndex: 50 }}>
            <label style={{ ...labelStyle, marginBottom: '12px' }}><Star size={13} /> Saved Beneficiaries</label>
            {beneficiaries.length > 0 ? (
              <>
                <button onClick={() => setIsBeneficiariesOpen(!isBeneficiariesOpen)} style={{
                  width: '100%', padding: '14px 16px', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)', fontFamily: f, fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', outline: 'none'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
                  onMouseLeave={e => { if (!isBeneficiariesOpen) e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  Select Recipient <ChevronDown size={14} style={{ transform: isBeneficiariesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                </button>

                {isBeneficiariesOpen && (
                  <div className="transfers-dropdown-container" style={{
                    position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '6px', background: 'var(--floating-menu-bg, #ffffff)', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '280px', overflowY: 'auto', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 20px 48px -10px rgba(0, 0, 0, 0.15)', animation: 'floatingMenuIn 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {beneficiaries.map(b => (
                      <div key={b.id} className="dropdown-item" onClick={() => { selectBeneficiary(b); setIsBeneficiariesOpen(false); }} style={{
                        padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s ease', background: 'transparent'
                      }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--select-hover-bg, rgba(0,0,0,0.03))'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ flex: 1, overflow: 'hidden', paddingRight: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 3px', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--floating-menu-text, #1e293b)', fontFamily: f, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', margin: 0 }}>{b.name}</p>
                            <span style={{ fontSize: '9px', fontWeight: 600, padding: '1px 5px', background: b.type === 'SAME_BANK' ? 'rgba(16, 185, 129, 0.08)' : b.type === 'DOMESTIC' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(245, 158, 11, 0.08)', borderRadius: '4px', color: b.type === 'SAME_BANK' ? '#10b981' : b.type === 'DOMESTIC' ? '#3b82f6' : '#f59e0b', whiteSpace: 'nowrap', fontFamily: f }}>
                              {b.type === 'SAME_BANK' ? 'Within Bank' : b.type === 'DOMESTIC' ? 'Domestic' : 'International'}
                            </span>
                          </div>
                          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: mono, margin: 0 }}>{b.account_number}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteBeneficiary(b.id); }} style={{
                          background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.18s ease'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: f, margin: 0 }}>No saved beneficiaries yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Panel */}
        <div id="transfer-panel" className="glass-card" style={{ width: '100%', maxWidth: '680px', padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative glow */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', background: 'radial-gradient(circle,rgba(14,203,203,0.06),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(26,111,255,0.05),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
            {steps.map((s, i) => {
              const done = (s.id === 1 && step >= 3) || (s.id === 2 && step >= 4) || (s.id === 3 && step >= 4);
              const active = (s.id === 1 && step === 1) || (s.id === 2 && step === 3) || (s.id === 3 && step === 4);
              const iconBg = done ? 'var(--success)' : active ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'var(--glass)';
              return (
                <React.Fragment key={s.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: done || active ? '#fff' : 'var(--text-secondary)', fontFamily: f, border: !done && !active ? '1.5px solid var(--glass-border)' : 'none', boxShadow: done ? '0 4px 12px rgba(0,232,143,0.3)' : active ? '0 4px 12px rgba(14,203,203,0.3)' : 'none', transition: 'all 0.3s ease' }}>
                      {done ? <CheckCircle2 size={14} /> : s.id}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: done ? 'var(--success)' : active ? 'var(--teal)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', fontFamily: f }}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <div style={{ width: '48px', height: '2px', margin: '0 8px', borderRadius: '2px', background: done ? 'var(--teal)' : 'var(--glass-border)', transition: 'background 0.4s ease' }} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* ═══ STEP 4: Success ═══ */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,232,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
              </div>
              <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 8px' }}>Transfer Successful!</h3>
              <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                {fmt(amount)} EGP sent to {recipientName}
              </p>
              <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
                Fee: {fmt(fee)} EGP • Total debited: {fmt(totalDebit)} EGP
              </p>
              <p style={{ fontFamily: f, fontSize: '16px', fontWeight: 700, color: 'var(--teal)' }}>
                New Balance: {fmt(balance)} EGP
              </p>
            </div>
          )}

          {/* ═══ STEP 3: OTP Verification ═══ */}
          {step === 3 && (
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px' }}>Verify Transfer</h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Enter the 6-digit code sent to your email to confirm this transfer.
                </p>
              </div>

              {/* Transfer summary */}
              <div style={{ background: 'var(--input-bg)', borderRadius: '16px', padding: '16px 20px', border: '1px solid var(--glass-border)', marginBottom: '24px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>To</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>{recipientName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Amount</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>{fmt(amount)} EGP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Transfer Fee (0.1%)</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)', fontFamily: f }}>{fmt(fee)} EGP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)', fontFamily: f }}>TOTAL DEBIT</span>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--teal)', fontFamily: f }}>{fmt(totalDebit)} EGP</span>
                </div>
              </div>

              {/* OTP Input */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ''}
                    className="premium-input"
                    style={{ width: '48px', height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 800, borderRadius: '14px', fontFamily: mono, padding: 0 }}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/, '');
                      const newOtp = otp.split('');
                      newOtp[i] = v;
                      setOtp(newOtp.join(''));
                      if (v && i < 5) {
                        const next = e.target.nextElementSibling as HTMLInputElement;
                        next?.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        prev?.focus();
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
                      if (pasted) {
                        setOtp(pasted);
                        const targetIdx = Math.min(pasted.length - 1, 5);
                        const inputs = e.currentTarget.parentElement?.querySelectorAll('input');
                        if (inputs && inputs[targetIdx]) {
                          (inputs[targetIdx] as HTMLInputElement).focus();
                        }
                      }
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={confirmTransfer} disabled={otp.length !== 6 || confirming} style={{
                  flex: 1, padding: '15px', background: otp.length === 6 ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'var(--glass)', border: otp.length === 6 ? 'none' : '1.5px solid var(--glass-border)', borderRadius: '14px', color: otp.length === 6 ? '#fff' : 'var(--text-secondary)', fontFamily: f, fontWeight: 700, fontSize: '14px', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', boxShadow: otp.length === 6 ? '0 4px 20px rgba(14,203,203,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  {confirming ? <><Loader2 size={16} style={{ animation: 'ring-spin 1s linear infinite' }} /> Confirming...</> : <><CheckCircle2 size={16} /> Confirm Transfer</>}
                </button>
                <button onClick={() => { setStep(1); setOtp(''); setTransferId(''); }} style={{ padding: '15px 20px', border: '1.5px solid var(--glass-border)', borderRadius: '14px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: f }}>Cancel</button>
              </div>
            </div>
          )}

          {/* ═══ STEP 1: Transfer Form ═══ */}
          {step === 1 && (
            <>
              {/* Balance Display */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '4px', fontFamily: f }}>Available Balance</p>
                <div style={{ fontFamily: f, fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(balance)} <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: mono, marginTop: '4px' }}>{accountId}</p>
              </div>

              {/* Transfer Type Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ ...labelStyle, justifyContent: 'center', marginBottom: '12px' }}><Globe size={14} /> Transfer Type</label>
                <div style={{ display: 'flex', gap: '0', background: 'var(--glass)', borderRadius: '12px', padding: '3px', border: '1px solid var(--glass-border)' }}>
                  {([['SAME_BANK', 'Within Bank'], ['DOMESTIC', 'Domestic'], ['INTERNATIONAL', 'International']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setTransferType(val)} style={{
                      flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: transferType === val ? 700 : 500, fontFamily: f,
                      background: transferType === val ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'transparent',
                      color: transferType === val ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s ease',
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Amount Display */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '8px', fontFamily: f }}>Amount to Send</p>
                <div style={{ display: 'inline-flex', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: f, fontSize: '48px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
                    {amount > 0 ? new Intl.NumberFormat('en-EG').format(amount) : '0'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)', marginLeft: '8px', marginTop: '8px', fontFamily: f }}>EGP</span>
                </div>
                {amount > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', fontFamily: f }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Fee (1%): <strong style={{ color: 'var(--danger)' }}>{fmt(fee)}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Total: <strong style={{ color: 'var(--teal)' }}>{fmt(totalDebit)}</strong></span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="transfers-grid-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}><User size={13} /> Recipient Name</label>
                  <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="premium-input" style={inputStyle} placeholder="e.g. Ahmed Nady" />
                </div>
                <div>
                  <label style={labelStyle}><Hash size={13} /> {transferType === 'SAME_BANK' ? 'Credify Account ID' : 'Account / IBAN'}</label>
                  <input type="text" value={recipientAccount} onChange={onAcct} maxLength={transferType === 'SAME_BANK' ? 12 : 19} className="premium-input" style={{ ...inputStyle, fontFamily: mono, fontVariantNumeric: 'tabular-nums' }} placeholder={transferType === 'SAME_BANK' ? 'CRD123456789' : '1111 1111 1111 1111'} />
                </div>
              </div>

              <div className="transfers-grid-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={labelStyle}><DollarSign size={13} /> Amount (EGP)</label>
                  <input type="text" value={amtStr} onChange={onAmt} className="premium-input" style={{ ...inputStyle, fontFamily: mono, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }} placeholder="0.00" />
                  {amount > 0 && totalDebit > balance && (
                    <p style={{ position: 'absolute', bottom: '-20px', left: '4px', fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Insufficient balance
                    </p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}><FileText size={13} /> Reference <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '11px' }}>(Optional)</span></label>
                  <input type="text" value={reference} onChange={e => setReference(e.target.value)} id="tr-note" className="premium-input" style={{ ...inputStyle, fontWeight: 500 }} placeholder="e.g. Rent payment" />
                </div>
              </div>

              {/* Conditional fields for DOMESTIC / INTERNATIONAL */}
              {transferType !== 'SAME_BANK' && (
                <div className="transfers-grid-fields" style={{ display: 'grid', gridTemplateColumns: transferType === 'INTERNATIONAL' ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}><Building2 size={13} /> Recipient Bank</label>
                    <input type="text" value={recipientBank} onChange={e => setRecipientBank(e.target.value)} className="premium-input" style={inputStyle} placeholder="e.g. National Bank of Egypt" />
                  </div>
                  {transferType === 'INTERNATIONAL' && (
                    <div>
                      <label style={labelStyle}><Globe size={13} /> SWIFT / BIC Code</label>
                      <input type="text" value={swiftCode} onChange={e => setSwiftCode(e.target.value.toUpperCase())} className="premium-input" style={{ ...inputStyle, fontFamily: mono, textTransform: 'uppercase' }} placeholder="e.g. NBEGEGCX" />
                    </div>
                  )}
                </div>
              )}

              {transferType === 'INTERNATIONAL' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}><Building2 size={13} /> Bank Address</label>
                  <input type="text" value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} className="premium-input" style={inputStyle} placeholder="e.g. 10 Champollion St, Cairo, Egypt" />
                </div>
              )}
              {/* Save Beneficiary Checkbox */}
              {valid && !beneficiaries.find(b => b.account_number === recipientAccount.replace(/\s/g, '')) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '12px', background: 'rgba(14,203,203,0.05)', borderRadius: '12px', border: '1px solid rgba(14,203,203,0.2)' }}>
                  <input
                    type="checkbox"
                    id="save-ben"
                    checked={saveBeneficiary}
                    onChange={(e) => setSaveBeneficiary(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--teal)', cursor: 'pointer' }}
                  />
                  <label htmlFor="save-ben" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', fontFamily: f, margin: 0 }}>
                    Save this recipient as a beneficiary for future transfers
                  </label>
                </div>
              )}

              {/* Submit */}
              <button onClick={initiateTransfer} disabled={!valid || submitting} style={{
                width: '100%', padding: '16px', background: valid ? 'linear-gradient(135deg,var(--teal),var(--blue))' : 'var(--glass)', border: valid ? 'none' : '1.5px solid var(--glass-border)', borderRadius: '16px', color: valid ? '#fff' : 'var(--text-secondary)', fontFamily: f, fontWeight: 700, fontSize: '15px', transition: 'all 0.3s ease', boxShadow: valid ? '0 6px 24px rgba(14,203,203,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: valid ? 'pointer' : 'not-allowed', marginTop: '8px',
              }}>
                {submitting ? <><Loader2 size={16} style={{ animation: 'ring-spin 1s linear infinite' }} /> Sending Verification...</> : <><Send size={16} /> Review & Send <ArrowRight size={16} /></>}
              </button>
            </>
          )}
        </div>

        {/* Right Spacer */}
        <div className="transfers-right-col" style={{ flex: 1 }}></div>

      </div>
      <style>{`
        /* Styles for Tablets and Mobile (up to 1024px) */
        @media (max-width: 1024px) {
          .transfers-container {
            flex-direction: column !important;
            align-items: center !important;
            gap: 20px !important;
            padding: 0 !important;
          }
          .transfers-left-col {
            padding-right: 0 !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 100% !important;
            flex: none !important;
          }
          .transfers-beneficiary-wrap {
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
          }
          .transfers-right-col {
            display: none !important;
          }
          .transfers-dropdown-container {
            position: relative !important;
            top: 0 !important;
            margin-top: 12px !important;
            max-height: 120px !important;
            box-shadow: none !important;
            border: 1.5px solid var(--glass-border) !important;
            background: var(--glass) !important;
            backdrop-filter: blur(12px) !important;
            margin-bottom: 8px !important;
          }
          /* Premium custom scrollbar styling for mobile/tablet dropdown */
          .transfers-dropdown-container::-webkit-scrollbar {
            width: 4px !important;
          }
          .transfers-dropdown-container::-webkit-scrollbar-thumb {
            background: var(--teal) !important;
            border-radius: 4px !important;
          }
          .transfers-dropdown-container::-webkit-scrollbar-track {
            background: transparent !important;
          }
        }

        /* Specific Styles for Mobile Phones (up to 767px) */
        @media (max-width: 767px) {
          #transfers.page {
            padding: 16px !important;
          }
          #transfer-panel {
            padding: 24px 16px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .transfers-grid-fields {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TransfersPage;
