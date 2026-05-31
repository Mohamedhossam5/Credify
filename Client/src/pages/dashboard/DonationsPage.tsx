import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight, ArrowLeft, Search, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';
import { financeService } from '../../services/finance.service';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const f = '"Inter",sans-serif';
const mono = '"JetBrains Mono", monospace';

const charities = [
  { id: 'resala', name: 'Resala Charity', logo: <img src="/logos/resala.png" alt="Resala" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', backgroundColor: '#fff', padding: '4px' }} />, brandGradient: 'linear-gradient(135deg, #e11d48, #be123c)', brandBg: 'rgba(225, 29, 72, 0.12)' },
  { id: 'misr-el-kheir', name: 'Misr El Kheir', logo: <img src="/logos/misr-el-kheir.png" alt="Misr El Kheir" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', backgroundColor: '#fff', padding: '4px' }} />, brandGradient: 'linear-gradient(135deg, #10b981, #059669)', brandBg: 'rgba(16, 185, 129, 0.12)' },
  { id: 'baheya', name: 'Baheya Foundation', logo: <img src="/logos/baheya.png" alt="Baheya" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', backgroundColor: '#fff', padding: '4px' }} />, brandGradient: 'linear-gradient(135deg, #f472b6, #db2777)', brandBg: 'rgba(244, 114, 182, 0.12)' },
  { id: 'hospital-57357', name: '57357 Hospital', logo: <img src="/logos/hospital-57357.png" alt="57357" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', backgroundColor: '#fff', padding: '4px' }} />, brandGradient: 'linear-gradient(135deg, #fbbf24, #d97706)', brandBg: 'rgba(251, 191, 36, 0.12)' },
  { id: 'magdi-yacoub', name: 'Magdi Yacoub Heart Foundation', logo: <img src="/logos/magdi-yacoub.png" alt="Magdi Yacoub" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'inherit', backgroundColor: '#fff', padding: '4px' }} />, brandGradient: 'linear-gradient(135deg, #ef4444, #b91c1c)', brandBg: 'rgba(239, 68, 68, 0.12)' },
];

const DonationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [donorName, setDonorName] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'inquiry' | 'confirm' | 'otp' | 'processing' | 'success'>('form');
  const [transferId, setTransferId] = useState('');
  const [otp, setOtp] = useState('');
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.user?.account) {
          setBalance(parseFloat(data.user.account.balance));
        }
      } catch { /* silent */ }
    })();
  }, []);

  const provider = charities.find((p) => p.id === selectedProvider);

  const resetPaymentForm = () => {
    setDonorName('');
    setDonationAmount('');
    setPaymentStep('form');
    setSelectedProvider(null);
    setTransferId('');
    setOtp('');
  };

  const parsedAmount = parseFloat(donationAmount) || 0;
  const isFormValid = parsedAmount > 0 && parsedAmount <= balance;

  const handlePayBill = async () => {
    if (parsedAmount <= 0 || parsedAmount > balance) return;
    try {
      setPaymentStep('processing');
      const res = await financeService.initiateDonation(parsedAmount, provider?.name || 'Donation', donorName || 'Anonymous');
      if (res.otpRequired && res.transferId) {
        setTransferId(res.transferId);
        setPaymentStep('otp');
        toast.success(res.message);
      } else {
        setPaymentStep('success');
        toast.success('Donation successful!');
        try {
          const { data } = await api.get('/auth/me');
          if (data.user?.account) setBalance(parseFloat(data.user.account.balance));
          queryClient.invalidateQueries({ queryKey: ['balance'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        } catch { /* silent */ }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : err.message) || 'Failed to initiate donation');
      setPaymentStep('confirm');
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    try {
      setPaymentStep('processing');
      await financeService.confirmBillPayment(transferId, otp);
      setPaymentStep('success');
      toast.success('Donation successful!');
      try {
        const { data } = await api.get('/auth/me');
        if (data.user?.account) setBalance(parseFloat(data.user.account.balance));
        queryClient.invalidateQueries({ queryKey: ['balance'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } catch { /* silent */ }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setOtp('');
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const renderOTPStep = (brandGradient: string, brandBg: string, amount: number) => (
    paymentStep === 'otp' && (
      <div style={{ textAlign: 'center', animation: 'fadeSlideUp 0.4s ease', padding: '10px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <KeyRound size={28} style={{ color: 'var(--text-primary)' }} />
        </div>
        <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Verification Required</h3>
        <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.5 }}>Enter the 6-digit code sent to your registered email to authorize this donation.</p>
        <div style={{ marginBottom: '24px' }}>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))} placeholder="• • • • • •" className="premium-input" style={{ width: '100%', borderRadius: '16px', padding: '16px', fontSize: '28px', fontWeight: 800, fontFamily: mono, letterSpacing: '12px', textAlign: 'center' }} />
        </div>
        <button onClick={handleVerifyOTP} disabled={otp.length !== 6} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', cursor: otp.length === 6 ? 'pointer' : 'not-allowed', background: otp.length === 6 ? brandGradient : 'var(--glass)', color: otp.length === 6 ? '#fff' : 'var(--text-secondary)', fontFamily: f, fontWeight: 700, fontSize: '15px', boxShadow: otp.length === 6 ? `0 6px 20px ${brandBg}` : 'none', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Verify & Donate {fmt(amount)} EGP
        </button>
      </div>
    )
  );

  return (
    <div className="dashboard-content">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={24} style={{ color: 'var(--teal)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', fontFamily: f }}>Make a Donation</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, fontFamily: f }}>Support your favorite charities and NGOs securely.</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
          {!selectedProvider && (
            <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="text" placeholder="Search charities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="premium-input" style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {charities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((charity) => (
                  <button key={charity.id} onClick={() => setSelectedProvider(charity.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)', background: 'var(--glass)', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: charity.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{charity.logo}</div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, marginBottom: '4px' }}>{charity.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: f }}>Tap to donate</div>
                      </div>
                    </div>
                    <ChevronRight size={20} style={{ color: 'var(--text-secondary)' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedProvider && provider && (
            <section style={{ animation: 'fadeSlideUp 0.4s ease' }}>
              <button onClick={resetPaymentForm} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f, cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease' }}>
                <ArrowLeft size={16} /> Back to Charities
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: provider.brandBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 16px' }}>{provider.logo}</div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', fontFamily: f }}>{provider.name}</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, fontFamily: f }}>Secure Donation</p>
              </div>

              {renderOTPStep(provider.brandGradient, provider.brandBg, parsedAmount)}

              {paymentStep === 'form' && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '28px', padding: '16px', background: 'var(--glass)', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: f }}>Available Balance</p>
                    <span style={{ fontFamily: f, fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{fmt(balance)} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span></span>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f }}>Donor Name (Optional)</label>
                    <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="e.g. John Doe" className="premium-input" style={{ width: '100%', borderRadius: '14px', padding: '16px' }} />
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f }}>Donation Amount (EGP)</label>
                    <input type="text" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0.00" className="premium-input" style={{ width: '100%', borderRadius: '14px', padding: '16px', fontSize: '20px', fontWeight: 700 }} />
                    {parsedAmount > balance && <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '8px', fontFamily: f }}>Insufficient balance</div>}
                  </div>

                  <button disabled={!isFormValid} onClick={() => setPaymentStep('confirm')} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', background: isFormValid ? provider.brandGradient : 'var(--glass)', color: isFormValid ? '#fff' : 'var(--text-secondary)', fontFamily: f, fontWeight: 700, fontSize: '15px', boxShadow: isFormValid ? `0 6px 20px ${provider.brandBg}` : 'none', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Proceed to Donate
                  </button>
                </div>
              )}

              {paymentStep === 'confirm' && (
                <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
                  <div style={{ background: 'var(--glass)', borderRadius: '16px', padding: '24px', border: '1px solid var(--glass-border)', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0', fontFamily: f }}>Confirm Donation</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: f }}>Charity</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, fontFamily: f }}>{provider.name}</span>
                    </div>
                    {donorName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontFamily: f }}>Donor</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, fontFamily: f }}>{donorName}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: f }}>Amount</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800, fontFamily: f }}>{fmt(parsedAmount)} EGP</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handlePayBill} disabled={parsedAmount > balance} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: provider.brandGradient, color: '#fff', fontFamily: f, fontWeight: 700, fontSize: '14px', boxShadow: `0 6px 20px ${provider.brandBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} /> Confirm Donation
                    </button>
                    <button onClick={() => setPaymentStep('form')} style={{ padding: '15px 24px', borderRadius: '14px', background: 'transparent', border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)', fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                  <div className="spinner" style={{ width: '48px', height: '48px', border: `3px solid ${provider.brandBg}`, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', fontFamily: f }}>Processing Donation...</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, fontFamily: f }}>Please wait while we process your secure transaction.</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 30px rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle2 size={40} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px 0', fontFamily: f }}>Thank You!</h3>
                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 32px 0', fontFamily: f, lineHeight: 1.6 }}>Your donation of <strong>{fmt(parsedAmount)} EGP</strong> to {provider.name} was successful.</p>
                  <button onClick={resetPaymentForm} style={{ padding: '14px 32px', borderRadius: '14px', background: 'var(--glass)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>Make Another Donation</button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
