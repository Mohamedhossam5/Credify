import React, { useState, useEffect } from 'react';
import { Wifi, Smartphone, Zap, Droplets, Flame, ChevronRight, ArrowLeft, Search, Phone, DollarSign, CheckCircle2, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';
import { financeService } from '../../services/finance.service';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

const f = '"Inter",sans-serif';
const mono = '"DM Mono",monospace';

// ─── Bill Categories ─────────────────────────────────────────
interface BillCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  accentColor: string;
}

const categories: BillCategory[] = [
  {
    id: 'telecom-bills',
    label: 'Telecom & Internet Bills',
    description: 'Pay your mobile, landline, and internet subscription bills',
    icon: <Wifi size={24} />,
    gradient: 'linear-gradient(135deg, rgba(14,203,203,0.12), rgba(26,111,255,0.08))',
    iconBg: 'rgba(14,203,203,0.15)',
    accentColor: 'var(--teal)',
  },
  {
    id: 'telecom-recharge',
    label: 'Telecom & Internet Recharge',
    description: 'Recharge your prepaid mobile or internet balance instantly',
    icon: <Smartphone size={24} />,
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(168,85,247,0.08))',
    iconBg: 'rgba(139,92,246,0.15)',
    accentColor: '#8b5cf6',
  },
  {
    id: 'electricity',
    label: 'Electricity Bills',
    description: 'Pay your electricity utility bills quickly and securely',
    icon: <Zap size={24} />,
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))',
    iconBg: 'rgba(245,158,11,0.15)',
    accentColor: '#f59e0b',
  },
  {
    id: 'water',
    label: 'Water Bills',
    description: 'Pay your water supply and sewage utility bills',
    icon: <Droplets size={24} />,
    gradient: 'linear-gradient(135deg, rgba(26,111,255,0.12), rgba(59,130,246,0.08))',
    iconBg: 'rgba(26,111,255,0.15)',
    accentColor: '#1a6fff',
  },
  {
    id: 'gas',
    label: 'Gas Bills',
    description: 'Pay your natural gas utility bills on time',
    icon: <Flame size={24} />,
    gradient: 'linear-gradient(135deg, rgba(255,77,106,0.12), rgba(239,68,68,0.08))',
    iconBg: 'rgba(255,77,106,0.15)',
    accentColor: '#ff4d6a',
  },
];

// ─── Providers Data ───────────────────────────────────────
interface BillProvider {
  id: string;
  name: string;
  logo: React.ReactNode;
  brandColor: string;
  brandBg: string;
  brandGradient: string;
  prefixes: string;
}

const ProviderLogo: React.FC<{ src: string; alt: string; padding?: string; scale?: number; translateY?: number }> = ({ src, alt, padding = '6px', scale = 1.0, translateY = 0 }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      borderRadius: '18px',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: padding,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          transition: 'transform 0.2s ease',
        }}
      />
    </div>
  );
};

const telecomProviders: BillProvider[] = [
  {
    id: 'etisalat',
    name: 'Etisalat',
    logo: <ProviderLogo src="/logos/etisalat.png" alt="Etisalat" padding="6px" scale={1.1} />,
    brandColor: '#00a651',
    brandBg: 'rgba(0,166,81,0.12)',
    brandGradient: 'linear-gradient(135deg, #00a651, #00c853)',
    prefixes: '011',
  },
  {
    id: 'orange',
    name: 'Orange',
    logo: <ProviderLogo src="/logos/orange.png" alt="Orange" padding="0px" scale={1.0} translateY={-5} />,
    brandColor: '#ff6600',
    brandBg: 'rgba(255,102,0,0.12)',
    brandGradient: 'linear-gradient(135deg, #ff6600, #ff8c00)',
    prefixes: '012',
  },
  {
    id: 'vodafone',
    name: 'Vodafone',
    logo: <ProviderLogo src="/logos/vodafone.png" alt="Vodafone" padding="4px" scale={1.1} />,
    brandColor: '#e60000',
    brandBg: 'rgba(230,0,0,0.12)',
    brandGradient: 'linear-gradient(135deg, #e60000, #ff1744)',
    prefixes: '010',
  },
  {
    id: 'we',
    name: 'WE',
    logo: <ProviderLogo src="/logos/we.png" alt="WE" padding="4px" scale={1.15} />,
    brandColor: '#7b2d8e',
    brandBg: 'rgba(123,45,142,0.12)',
    brandGradient: 'linear-gradient(135deg, #7b2d8e, #9c27b0)',
    prefixes: '015',
  },
];

const electricityProviders: BillProvider[] = [
  {
    id: 'south-cairo-elec',
    name: 'South Cairo Electricity',
    logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="3px" scale={1.3} />,
    brandColor: '#f59e0b',
    brandBg: 'rgba(245,158,11,0.12)',
    brandGradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    prefixes: '',
  },
  {
    id: 'north-cairo-elec',
    name: 'North Cairo Electricity',
    logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="3px" scale={1.3} />,
    brandColor: '#f59e0b',
    brandBg: 'rgba(245,158,11,0.12)',
    brandGradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    prefixes: '',
  },
  {
    id: 'canal-elec',
    name: 'Canal Electricity',
    logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="3px" scale={1.3} />,
    brandColor: '#f59e0b',
    brandBg: 'rgba(245,158,11,0.12)',
    brandGradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    prefixes: '',
  },
  {
    id: 'alex-elec',
    name: 'Alexandria Electricity',
    logo: <ProviderLogo src="/logos/eehc.png" alt="EEHC" padding="3px" scale={1.3} />,
    brandColor: '#f59e0b',
    brandBg: 'rgba(245,158,11,0.12)',
    brandGradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    prefixes: '',
  },
];

const waterProviders: BillProvider[] = [
  {
    id: 'cairo-water', name: 'Greater Cairo Water', logo: <ProviderLogo src="/logos/hcww.png" alt="HCWW" padding="3px" scale={1.4} />,
    brandColor: '#0ea5e9',
    brandBg: 'rgba(14,165,233,0.12)',
    brandGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    prefixes: '',
  },
  {
    id: 'alex-water', name: 'Alexandria Water', logo: <ProviderLogo src="/logos/hcww.png" alt="Alexandria Water" padding="3px" scale={1.4} />,
    brandColor: '#0ea5e9',
    brandBg: 'rgba(14,165,233,0.12)',
    brandGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    prefixes: '',
  },
  {
    id: 'giza-water', name: 'Giza Water', logo: <ProviderLogo src="/logos/hcww.png" alt="HCWW" padding="3px" scale={1.4} />,
    brandColor: '#0ea5e9',
    brandBg: 'rgba(14,165,233,0.12)',
    brandGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    prefixes: '',
  },
  {
    id: 'canal-water', name: 'Canal Cities Water', logo: <ProviderLogo src="/logos/hcww.png" alt="HCWW" padding="3px" scale={1.4} />,
    brandColor: '#0ea5e9',
    brandBg: 'rgba(14,165,233,0.12)',
    brandGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    prefixes: '',
  },
];

const gasProviders: BillProvider[] = [
  {
    id: 'petrotrade', name: 'Petrotrade', logo: <ProviderLogo src="/logos/petrotrade.png" alt="Petrotrade" padding="3px" scale={1.2} />,
    brandColor: '#ef4444',
    brandBg: 'rgba(239,68,68,0.12)',
    brandGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    prefixes: '',
  },
  {
    id: 'town-gas', name: 'Town Gas', logo: <ProviderLogo src="/logos/town-gas.png" alt="Town Gas" padding="1px" scale={1.2} />,
    brandColor: '#ef4444',
    brandBg: 'rgba(239,68,68,0.12)',
    brandGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    prefixes: '',
  },
  {
    id: 'natgas', name: 'Natgas', logo: <ProviderLogo src="/logos/natgas.png" alt="Natgas" padding="0px" scale={1.1} />,
    brandColor: '#ef4444',
    brandBg: 'rgba(239,68,68,0.12)',
    brandGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    prefixes: '',
  },
  {
    id: 'taqa-gas', name: 'Taqa Gas', logo: <ProviderLogo src="/logos/taqa-gas.png" alt="Taqa Gas" padding="3px" scale={1.25} />,
    brandColor: '#ef4444',
    brandBg: 'rgba(239,68,68,0.12)',
    brandGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    prefixes: '',
  },
];

// ─── Recharge Presets ────────────────────────────────────────
const RECHARGE_PRESETS = [10, 25, 50, 75, 100, 150, 200, 250];
const RECHARGE_RATIO = 0.70; // Recharge balance = 70% of amount paid

const BillPaymentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Bill payment form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ePaymentCode, setEPaymentCode] = useState('');
  const [billingAccount, setBillingAccount] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'inquiry' | 'confirm' | 'otp' | 'processing' | 'success'>('form');
  const [transferId, setTransferId] = useState('');
  const [otp, setOtp] = useState('');
  const [balance, setBalance] = useState(0);

  // Recharge state
  const [rechargeBalance, setRechargeBalance] = useState<number | null>(null);
  const [customRecharge, setCustomRecharge] = useState('');
  const [rechargeMode, setRechargeMode] = useState<'preset' | 'custom'>('preset');

  // Fetch balance
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

  const filteredCategories = categories.filter((cat) =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCat = categories.find((c) => c.id === selectedCategory);
  const provider = telecomProviders.find((p) => p.id === selectedProvider)
    || electricityProviders.find((p) => p.id === selectedProvider)
    || waterProviders.find((p) => p.id === selectedProvider)
    || gasProviders.find((p) => p.id === selectedProvider);

  const resetPaymentForm = () => {
    setPhoneNumber('');
    setEPaymentCode('');
    setBillingAccount('');
    setBillAmount('');
    setPaymentStep('form');
    setSelectedProvider(null);
    setRechargeBalance(null);
    setCustomRecharge('');
    setRechargeMode('preset');
    setTransferId('');
    setOtp('');
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 11);
    setPhoneNumber(v);
  };

  const handleEPaymentCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 16);
    setEPaymentCode(v);
  };

  const handleBillingAccountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 16);
    setBillingAccount(v);
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^\d.]/g, '');
    setBillAmount(v);
  };

  const parsedAmount = parseFloat(billAmount) || 0;
  const isFormValid = phoneNumber.length === 11 && parsedAmount > 0 && parsedAmount <= balance;

  const handlePayBill = async (overrideAmount?: number) => {
    const amountToUse = overrideAmount ?? parsedAmount;
    if (amountToUse <= 0 || amountToUse > balance) return;

    try {
      setPaymentStep('processing');
      const accountIdentifier = ePaymentCode || billingAccount || phoneNumber || 'Recharge';
      const res = await financeService.initiateBillPayment(amountToUse, provider?.name || 'Recharge', accountIdentifier);

      if (res.otpRequired && res.transferId) {
        setTransferId(res.transferId);
        setPaymentStep('otp');
        toast.success(res.message);
      } else {
        setPaymentStep('success');
        toast.success('Bill paid successfully!');
        try {
          const { data } = await api.get('/auth/me');
          if (data.user?.account) setBalance(parseFloat(data.user.account.balance));
          queryClient.invalidateQueries({ queryKey: ['balance'] });
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        } catch { /* silent */ }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to initiate payment';
      toast.dismiss('server-error');
      toast.error(errorMsg, { id: 'bill-payment-error' });
      setPaymentStep('confirm');
    }
  };


  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    try {
      setPaymentStep('processing');
      await financeService.confirmBillPayment(transferId, otp);
      setPaymentStep('success');
      toast.success('Bill paid successfully!');
      try {
        const { data } = await api.get('/auth/me');
        if (data.user?.account) setBalance(parseFloat(data.user.account.balance));
        queryClient.invalidateQueries({ queryKey: ['balance'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } catch { /* silent */ }
    } catch (err: any) {
      toast.dismiss('server-error');
      toast.error(err.message || 'Invalid or expired verification code', { id: 'bill-otp-error' });
      setPaymentStep('otp');
    }
  };

  const renderOTPStep = (brandGradient: string, brandBg: string, amount: number) => (
    paymentStep === 'otp' && (
      <div style={{ textAlign: 'center', animation: 'fadeSlideUp 0.4s ease', padding: '10px 0' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--glass)',
          border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <KeyRound size={28} style={{ color: 'var(--text-primary)' }} />
        </div>
        <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
          Verification Required
        </h3>
        <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
          Enter the 6-digit code sent to your registered email to authorize this payment.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
            placeholder="• • • • • •"
            className="premium-input"
            style={{
              width: '100%', borderRadius: '16px', padding: '16px',
              fontSize: '28px', fontWeight: 800, fontFamily: mono, letterSpacing: '12px',
              textAlign: 'center',
            }}
          />
        </div>

        <button onClick={handleVerifyOTP} disabled={otp.length !== 6} style={{
          width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
          cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
          background: otp.length === 6 ? brandGradient : 'var(--glass)',
          color: otp.length === 6 ? '#fff' : 'var(--text-secondary)',
          fontFamily: f, fontWeight: 700, fontSize: '15px',
          boxShadow: otp.length === 6 ? `0 6px 20px ${brandBg}` : 'none',
          transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          Verify & Pay {fmt(amount)} EGP
        </button>
      </div>
    )
  );



  const fmt = (n: number) => new Intl.NumberFormat("en-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  // ─── Provider Bill Payment Form ────────────────────────────
  if (selectedCategory === 'telecom-bills' && selectedProvider && provider) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>
          {/* Back button */}
          <button
            onClick={() => { resetPaymentForm(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Providers
          </button>

          <div className="glass-card" style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px',
              background: `radial-gradient(circle, ${provider.brandBg}, transparent)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Provider Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', background: provider.brandGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: '#fff', fontWeight: 800, fontFamily: f,
                boxShadow: `0 8px 24px ${provider.brandBg}`,
              }}>
                {provider.logo}
              </div>
              <div>
                <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  {provider.name}
                </h2>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Pay your {provider.name} bill
                </p>
              </div>
            </div>

            {/* ─── Success State ─── */}
            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,232,143,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                </div>
                <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Payment Successful!
                </h3>
                <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  {fmt(parsedAmount)} EGP paid to {provider.name}
                </p>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                  Phone: {phoneNumber}
                </p>
                <button onClick={() => { resetPaymentForm(); }} style={{
                  padding: '14px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))', color: '#fff',
                  fontFamily: f, fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(14,203,203,0.3)',
                }}>
                  Pay Another Bill
                </button>
              </div>
            )}

            {/* ─── Processing State ─── */}
            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Processing Payment...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Please wait while we process your {provider.name} bill payment
                </p>
              </div>
            )}

            {/* ─── Inquiry State ─── */}
            {paymentStep === 'inquiry' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Inquiring Bill...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Connecting to {provider.name} to fetch your latest bill details for {phoneNumber}
                </p>
              </div>
            )}

            {/* ─── Confirm State ─── */}
            {paymentStep === 'confirm' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 20px 0', textAlign: 'center' }}>
                  Confirm Payment
                </h3>

                <div style={{
                  background: 'var(--input-bg)', borderRadius: '16px', padding: '20px 24px',
                  border: '1px solid var(--glass-border)', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Provider</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: provider.brandColor, fontFamily: f }}>{provider.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Phone Number</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>{phoneNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', fontFamily: f }}>AMOUNT DUE</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--teal)', fontFamily: f }}>{fmt(parsedAmount)} EGP</span>
                  </div>
                </div>

                {parsedAmount > balance ? (
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <AlertCircle size={14} /> Insufficient balance to pay this bill
                    </p>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handlePayBill()} disabled={parsedAmount > balance} style={{
                    flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: parsedAmount > balance ? 'not-allowed' : 'pointer',
                    background: parsedAmount > balance ? 'var(--glass)' : provider.brandGradient,
                    color: parsedAmount > balance ? 'var(--text-secondary)' : '#fff',
                    fontFamily: f, fontWeight: 700, fontSize: '14px',
                    boxShadow: parsedAmount > balance ? 'none' : `0 6px 20px ${provider.brandBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <CheckCircle2 size={16} /> Confirm & Pay
                  </button>
                  <button onClick={() => setPaymentStep('form')} style={{
                    padding: '15px 24px', borderRadius: '14px', background: 'transparent',
                    border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ─── OTP State ─── */}
            {renderOTPStep(provider.brandGradient, provider.brandBg, parsedAmount)}

            {/* ─── Form State ─── */}
            {paymentStep === 'form' && (
              <div>
                {/* Balance Display */}
                <div style={{
                  textAlign: 'center', marginBottom: '28px', padding: '16px',
                  background: 'var(--glass)', borderRadius: '14px', border: '1px solid var(--glass-border)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: f }}>
                    Available Balance
                  </p>
                  <span style={{ fontFamily: f, fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    {fmt(balance)} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span>
                  </span>
                </div>

                {/* Phone Number */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f,
                  }}>
                    <Phone size={13} /> Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneInput}
                    placeholder={`e.g. ${provider.prefixes}XXXXXXXX`}
                    className="premium-input"
                    style={{
                      width: '100%', borderRadius: '14px', padding: '14px 16px',
                      fontSize: '16px', fontWeight: 600, fontFamily: mono, letterSpacing: '1px',
                    }}
                  />
                  {phoneNumber.length > 0 && phoneNumber.length < 11 && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Enter a valid 11-digit phone number
                    </p>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  onClick={async () => {
                    setPaymentStep('inquiry');
                    await new Promise(r => setTimeout(r, 1500));
                    // Generate random bill amount between 50 and 600 EGP
                    const randomAmount = Math.floor(Math.random() * 550) + 50;
                    setBillAmount(randomAmount.toString());
                    setPaymentStep('confirm');
                  }}
                  disabled={phoneNumber.length !== 11}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                    background: phoneNumber.length === 11 ? provider.brandGradient : 'var(--glass)',
                    color: phoneNumber.length === 11 ? '#fff' : 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 700, fontSize: '15px', cursor: phoneNumber.length === 11 ? 'pointer' : 'not-allowed',
                    boxShadow: phoneNumber.length === 11 ? `0 6px 24px ${provider.brandBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.3s ease',
                    ...(phoneNumber.length === 11 ? {} : { border: '1.5px solid var(--glass-border)' }),
                  }}
                >
                  <Search size={16} /> Inquire Bill
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Telecom Providers List ────────────────────────────────
  if (selectedCategory === 'telecom-bills' && selectedCat) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Back button */}
          <button
            onClick={() => { setSelectedCategory(null); setSelectedProvider(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>

          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: selectedCat.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCat.accentColor,
              boxShadow: `0 8px 24px ${selectedCat.iconBg}`,
            }}>
              {selectedCat.icon}
            </div>
            <div>
              <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                {selectedCat.label}
              </h2>
              <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select your service provider
              </p>
            </div>
          </div>

          {/* Provider Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {telecomProviders.map((prov, index) => (
              <div
                key={prov.id}
                className="glass-card"
                onClick={() => setSelectedProvider(prov.id)}
                style={{
                  padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 0 0 2px ${prov.brandBg}`;
                  e.currentTarget.style.borderColor = prov.brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Decorative glow */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
                  background: `radial-gradient(circle, ${prov.brandBg}, transparent)`,
                  borderRadius: '50%', pointerEvents: 'none', opacity: 0.5,
                }} />

                {/* Logo circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', background: prov.brandGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#fff', fontWeight: 800, fontFamily: f,
                  boxShadow: `0 8px 24px ${prov.brandBg}`,
                  transition: 'transform 0.3s ease',
                }}>
                  {prov.logo}
                </div>

                {/* Provider name */}
                <div>
                  <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {prov.name}
                  </h3>
                  <p style={{ fontFamily: f, fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    Prefix: {prov.prefixes}
                  </p>
                </div>

                {/* Pay now label */}
                <div style={{
                  padding: '6px 16px', borderRadius: '20px', background: prov.brandBg,
                  fontSize: '11px', fontWeight: 700, color: prov.brandColor, fontFamily: f,
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  Pay Bill →
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Recharge Provider Form ────────────────────────────────
  if (selectedCategory === 'telecom-recharge' && selectedProvider && provider) {
    const activeRecharge = rechargeMode === 'custom' ? (parseFloat(customRecharge) || 0) : (rechargeBalance || 0);
    const amountToPay = activeRecharge > 0 ? Math.round((activeRecharge / RECHARGE_RATIO) * 100) / 100 : 0;
    const isRechargeValid = phoneNumber.length === 11 && activeRecharge > 0 && amountToPay <= balance;

    const handleRecharge = async () => {
      if (!isRechargeValid) return;
      setBillAmount(amountToPay.toString());
      await handlePayBill(amountToPay);
    };

    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '620px' }}>
          {/* Back button */}
          <button
            onClick={() => { resetPaymentForm(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Providers
          </button>

          <div className="glass-card" style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px',
              background: `radial-gradient(circle, ${provider.brandBg}, transparent)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Provider Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', background: provider.brandGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: '#fff', fontWeight: 800, fontFamily: f,
                boxShadow: `0 8px 24px ${provider.brandBg}`,
              }}>
                {provider.logo}
              </div>
              <div>
                <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  {provider.name} Recharge
                </h2>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Recharge your {provider.name} prepaid balance
                </p>
              </div>
            </div>

            {/* ─── Success State ─── */}
            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,232,143,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                </div>
                <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Recharge Successful!
                </h3>
                <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  {fmt(activeRecharge)} EGP recharged to {provider.name}
                </p>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  Amount paid: {fmt(amountToPay)} EGP • Phone: {phoneNumber}
                </p>
                <button onClick={() => { resetPaymentForm(); }} style={{
                  padding: '14px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer', marginTop: '20px',
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))', color: '#fff',
                  fontFamily: f, fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(14,203,203,0.3)',
                }}>
                  Recharge Again
                </button>
              </div>
            )}

            {/* ─── Processing State ─── */}
            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Processing Recharge...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Please wait while we process your {provider.name} recharge
                </p>
              </div>
            )}

            {/* ─── Confirm State ─── */}
            {paymentStep === 'confirm' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 20px 0', textAlign: 'center' }}>
                  Confirm Recharge
                </h3>

                <div style={{
                  background: 'var(--input-bg)', borderRadius: '16px', padding: '20px 24px',
                  border: '1px solid var(--glass-border)', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Provider</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: provider.brandColor, fontFamily: f }}>{provider.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Phone Number</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>{phoneNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Recharge Balance</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)', fontFamily: f }}>{fmt(activeRecharge)} EGP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', fontFamily: f }}>AMOUNT TO PAY</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--teal)', fontFamily: f }}>{fmt(amountToPay)} EGP</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleRecharge} style={{
                    flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: provider.brandGradient, color: '#fff',
                    fontFamily: f, fontWeight: 700, fontSize: '14px',
                    boxShadow: `0 6px 20px ${provider.brandBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <CheckCircle2 size={16} /> Confirm & Recharge
                  </button>
                  <button onClick={() => setPaymentStep('form')} style={{
                    padding: '15px 24px', borderRadius: '14px', background: 'transparent',
                    border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}>
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* ─── OTP State ─── */}
            {renderOTPStep(provider.brandGradient, provider.brandBg, amountToPay)}

            {/* ─── Form State ─── */}
            {paymentStep === 'form' && (
              <div>
                {/* Balance Display */}
                <div style={{
                  textAlign: 'center', marginBottom: '24px', padding: '16px',
                  background: 'var(--glass)', borderRadius: '14px', border: '1px solid var(--glass-border)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: f }}>
                    Available Balance
                  </p>
                  <span style={{ fontFamily: f, fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    {fmt(balance)} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span>
                  </span>
                </div>

                {/* Phone Number */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f,
                  }}>
                    <Phone size={13} /> Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneInput}
                    placeholder={`e.g. ${provider.prefixes}XXXXXXXX`}
                    className="premium-input"
                    style={{
                      width: '100%', borderRadius: '14px', padding: '14px 16px',
                      fontSize: '16px', fontWeight: 600, fontFamily: mono, letterSpacing: '1px',
                    }}
                  />
                  {phoneNumber.length > 0 && phoneNumber.length < 11 && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Enter a valid 11-digit phone number
                    </p>
                  )}
                </div>

                {/* Mode Toggle */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontFamily: f,
                  }}>
                    <Smartphone size={13} /> Recharge Amount
                  </label>
                  <div style={{ display: 'flex', gap: '0', background: 'var(--glass)', borderRadius: '10px', padding: '3px', border: '1px solid var(--glass-border)', marginBottom: '16px' }}>
                    {([['preset', 'Quick Select'], ['custom', 'Custom Amount']] as const).map(([val, label]) => (
                      <button key={val} onClick={() => { setRechargeMode(val); setRechargeBalance(null); setCustomRecharge(''); }} style={{
                        flex: 1, padding: '9px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: rechargeMode === val ? 700 : 500, fontFamily: f,
                        background: rechargeMode === val ? provider.brandGradient : 'transparent',
                        color: rechargeMode === val ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s ease',
                      }}>{label}</button>
                    ))}
                  </div>

                  {/* Preset Amounts */}
                  {rechargeMode === 'preset' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                      {RECHARGE_PRESETS.map((amt) => {
                        const cost = Math.round((amt / RECHARGE_RATIO) * 100) / 100;
                        const isSelected = rechargeBalance === amt;
                        const canAfford = cost <= balance;
                        return (
                          <button
                            key={amt}
                            onClick={() => canAfford && setRechargeBalance(amt)}
                            style={{
                              padding: '16px 8px', borderRadius: '14px', cursor: canAfford ? 'pointer' : 'not-allowed',
                              background: isSelected ? provider.brandGradient : 'var(--glass)',
                              border: isSelected ? 'none' : '1.5px solid var(--glass-border)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? `0 4px 16px ${provider.brandBg}` : 'none',
                              opacity: canAfford ? 1 : 0.4,
                              transform: isSelected ? 'scale(1.04)' : 'none',
                            }}
                          >
                            <span style={{
                              fontSize: '18px', fontWeight: 800, fontFamily: f,
                              color: isSelected ? '#fff' : 'var(--text-primary)',
                            }}>
                              {amt}
                            </span>
                            <span style={{
                              fontSize: '10px', fontWeight: 600, fontFamily: f,
                              color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                            }}>
                              EGP
                            </span>
                            <span style={{
                              fontSize: '9px', fontWeight: 600, fontFamily: mono, marginTop: '2px',
                              color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                              background: isSelected ? 'rgba(255,255,255,0.15)' : 'var(--input-bg)',
                              padding: '2px 8px', borderRadius: '6px',
                            }}>
                              Pay {fmt(cost)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom Amount */}
                  {rechargeMode === 'custom' && (
                    <div>
                      <input
                        type="text"
                        value={customRecharge}
                        onChange={(e) => setCustomRecharge(e.target.value.replace(/[^\d.]/g, ''))}
                        placeholder="Enter recharge amount"
                        className="premium-input"
                        style={{
                          width: '100%', borderRadius: '14px', padding: '14px 16px',
                          fontSize: '16px', fontWeight: 700, fontFamily: mono,
                        }}
                      />
                      {amountToPay > balance && activeRecharge > 0 && (
                        <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={12} /> Insufficient balance
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount Summary */}
                {activeRecharge > 0 && (
                  <div style={{
                    background: 'var(--input-bg)', borderRadius: '14px', padding: '16px 20px',
                    border: '1px solid var(--glass-border)', marginBottom: '24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    animation: 'fadeSlideUp 0.2s ease',
                  }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Recharge Balance</p>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--success)', fontFamily: f, margin: 0 }}>{fmt(activeRecharge)} EGP</p>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--glass-border)' }} />
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>You Pay</p>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--teal)', fontFamily: f, margin: 0 }}>{fmt(amountToPay)} EGP</p>
                    </div>
                  </div>
                )}

                {/* Recharge Button */}
                <button
                  onClick={() => setPaymentStep('confirm')}
                  disabled={!isRechargeValid}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                    background: isRechargeValid ? provider.brandGradient : 'var(--glass)',
                    color: isRechargeValid ? '#fff' : 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 700, fontSize: '15px', cursor: isRechargeValid ? 'pointer' : 'not-allowed',
                    boxShadow: isRechargeValid ? `0 6px 24px ${provider.brandBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.3s ease',
                    ...(isRechargeValid ? {} : { border: '1.5px solid var(--glass-border)' }),
                  }}
                >
                  <Smartphone size={16} /> Review Recharge
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Recharge Providers List ────────────────────────────────
  if (selectedCategory === 'telecom-recharge' && selectedCat) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Back button */}
          <button
            onClick={() => { setSelectedCategory(null); setSelectedProvider(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>

          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: selectedCat.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCat.accentColor,
              boxShadow: `0 8px 24px ${selectedCat.iconBg}`,
            }}>
              {selectedCat.icon}
            </div>
            <div>
              <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                {selectedCat.label}
              </h2>
              <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select your service provider to recharge
              </p>
            </div>
          </div>

          {/* Provider Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {telecomProviders.map((prov, index) => (
              <div
                key={prov.id}
                className="glass-card"
                onClick={() => setSelectedProvider(prov.id)}
                style={{
                  padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 0 0 2px ${prov.brandBg}`;
                  e.currentTarget.style.borderColor = prov.brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Decorative glow */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
                  background: `radial-gradient(circle, ${prov.brandBg}, transparent)`,
                  borderRadius: '50%', pointerEvents: 'none', opacity: 0.5,
                }} />

                {/* Logo circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', background: prov.brandGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#fff', fontWeight: 800, fontFamily: f,
                  boxShadow: `0 8px 24px ${prov.brandBg}`,
                  transition: 'transform 0.3s ease',
                }}>
                  {prov.logo}
                </div>

                {/* Provider name */}
                <div>
                  <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {prov.name}
                  </h3>
                  <p style={{ fontFamily: f, fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    Prefix: {prov.prefixes}
                  </p>
                </div>

                {/* Recharge label */}
                <div style={{
                  padding: '6px 16px', borderRadius: '20px', background: prov.brandBg,
                  fontSize: '11px', fontWeight: 700, color: prov.brandColor, fontFamily: f,
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  Recharge →
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Electricity Provider Bill Payment Form ────────────────
  if (selectedCategory === 'electricity' && selectedProvider && provider) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>
          {/* Back button */}
          <button
            onClick={() => { resetPaymentForm(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Providers
          </button>

          <div className="glass-card" style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px',
              background: `radial-gradient(circle, ${provider.brandBg}, transparent)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Provider Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', background: provider.brandGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: '#fff', fontWeight: 800, fontFamily: f,
                boxShadow: `0 8px 24px ${provider.brandBg}`,
              }}>
                {provider.logo}
              </div>
              <div>
                <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  {provider.name}
                </h2>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Pay your electricity bill
                </p>
              </div>
            </div>

            {/* ─── Success State ─── */}
            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,232,143,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                </div>
                <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Payment Successful!
                </h3>
                <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  {fmt(parsedAmount)} EGP paid to {provider.name}
                </p>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                  E-payments Code: {ePaymentCode}
                </p>
                <button onClick={() => { resetPaymentForm(); }} style={{
                  padding: '14px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))', color: '#fff',
                  fontFamily: f, fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(14,203,203,0.3)',
                }}>
                  Pay Another Bill
                </button>
              </div>
            )}

            {/* ─── Processing State ─── */}
            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Processing Payment...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Please wait while we process your electricity bill payment
                </p>
              </div>
            )}

            {/* ─── Inquiry State ─── */}
            {paymentStep === 'inquiry' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Inquiring Bill...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Connecting to {provider.name} to fetch your latest bill details
                </p>
              </div>
            )}

            {/* ─── Confirm State ─── */}
            {paymentStep === 'confirm' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 20px 0', textAlign: 'center' }}>
                  Confirm Payment
                </h3>

                <div style={{
                  background: 'var(--input-bg)', borderRadius: '16px', padding: '20px 24px',
                  border: '1px solid var(--glass-border)', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Provider</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: provider.brandColor, fontFamily: f }}>{provider.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>E-payments Code</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>{ePaymentCode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', fontFamily: f }}>AMOUNT DUE</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--teal)', fontFamily: f }}>{fmt(parsedAmount)} EGP</span>
                  </div>
                </div>

                {parsedAmount > balance ? (
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <AlertCircle size={14} /> Insufficient balance to pay this bill
                    </p>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handlePayBill()} disabled={parsedAmount > balance} style={{
                    flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: parsedAmount > balance ? 'not-allowed' : 'pointer',
                    background: parsedAmount > balance ? 'var(--glass)' : provider.brandGradient,
                    color: parsedAmount > balance ? 'var(--text-secondary)' : '#fff',
                    fontFamily: f, fontWeight: 700, fontSize: '14px',
                    boxShadow: parsedAmount > balance ? 'none' : `0 6px 20px ${provider.brandBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <CheckCircle2 size={16} /> Confirm & Pay
                  </button>
                  <button onClick={() => setPaymentStep('form')} style={{
                    padding: '15px 24px', borderRadius: '14px', background: 'transparent',
                    border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ─── OTP State ─── */}
            {renderOTPStep(provider.brandGradient, provider.brandBg, parsedAmount)}

            {/* ─── Form State ─── */}
            {paymentStep === 'form' && (
              <div>
                {/* Balance Display */}
                <div style={{
                  textAlign: 'center', marginBottom: '28px', padding: '16px',
                  background: 'var(--glass)', borderRadius: '14px', border: '1px solid var(--glass-border)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: f }}>
                    Available Balance
                  </p>
                  <span style={{ fontFamily: f, fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    {fmt(balance)} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span>
                  </span>
                </div>

                {/* E-payments Code */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f,
                  }}>
                    <Zap size={13} /> E-payments Code (رقم السداد الالكتروني)
                  </label>
                  <input
                    type="text"
                    value={ePaymentCode}
                    onChange={handleEPaymentCodeInput}
                    placeholder="Enter your E-payments code"
                    className="premium-input"
                    style={{
                      width: '100%', borderRadius: '14px', padding: '14px 16px',
                      fontSize: '16px', fontWeight: 600, fontFamily: mono, letterSpacing: '1px',
                    }}
                  />
                  {ePaymentCode.length > 0 && ePaymentCode.length < 9 && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Minimum 9 digits required
                    </p>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  onClick={async () => {
                    setPaymentStep('inquiry');
                    await new Promise(r => setTimeout(r, 1500));
                    // Generate random bill amount between 150 and 800 EGP
                    const randomAmount = Math.floor(Math.random() * 650) + 150;
                    setBillAmount(randomAmount.toString());
                    setPaymentStep('confirm');
                  }}
                  disabled={ePaymentCode.length < 9}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                    background: ePaymentCode.length >= 9 ? provider.brandGradient : 'var(--glass)',
                    color: ePaymentCode.length >= 9 ? '#fff' : 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 700, fontSize: '15px', cursor: ePaymentCode.length >= 9 ? 'pointer' : 'not-allowed',
                    boxShadow: ePaymentCode.length >= 9 ? `0 6px 24px ${provider.brandBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.3s ease',
                    ...(ePaymentCode.length >= 9 ? {} : { border: '1.5px solid var(--glass-border)' }),
                  }}
                >
                  <Search size={16} /> Inquire Bill
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Electricity Providers List ────────────────────────────────
  if (selectedCategory === 'electricity' && selectedCat) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Back button */}
          <button
            onClick={() => { setSelectedCategory(null); setSelectedProvider(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>

          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: selectedCat.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCat.accentColor,
              boxShadow: `0 8px 24px ${selectedCat.iconBg}`,
            }}>
              {selectedCat.icon}
            </div>
            <div>
              <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                {selectedCat.label}
              </h2>
              <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select your service provider
              </p>
            </div>
          </div>

          {/* Provider Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {electricityProviders.map((prov, index) => (
              <div
                key={prov.id}
                className="glass-card"
                onClick={() => setSelectedProvider(prov.id)}
                style={{
                  padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 0 0 2px ${prov.brandBg}`;
                  e.currentTarget.style.borderColor = prov.brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Decorative glow */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
                  background: `radial-gradient(circle, ${prov.brandBg}, transparent)`,
                  borderRadius: '50%', pointerEvents: 'none', opacity: 0.5,
                }} />

                {/* Logo circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', background: prov.brandGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#fff', fontWeight: 800, fontFamily: f,
                  boxShadow: `0 8px 24px ${prov.brandBg}`,
                  transition: 'transform 0.3s ease',
                }}>
                  {prov.logo}
                </div>

                {/* Provider name */}
                <div>
                  <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {prov.name}
                  </h3>
                </div>

                {/* Pay now label */}
                <div style={{
                  padding: '6px 16px', borderRadius: '20px', background: prov.brandBg,
                  fontSize: '11px', fontWeight: 700, color: prov.brandColor, fontFamily: f,
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  Select →
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Water Provider Bill Payment Form ────────────────
  if (selectedCategory === 'water' && selectedProvider && provider) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>
          {/* Back button */}
          <button
            onClick={() => { resetPaymentForm(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Providers
          </button>

          <div className="glass-card" style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px',
              background: `radial-gradient(circle, ${provider.brandBg}, transparent)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Provider Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', background: provider.brandGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: '#fff', fontWeight: 800, fontFamily: f,
                boxShadow: `0 8px 24px ${provider.brandBg}`,
              }}>
                {provider.logo}
              </div>
              <div>
                <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  {provider.name}
                </h2>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Pay your water bill
                </p>
              </div>
            </div>

            {/* ─── Success State ─── */}
            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,232,143,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                </div>
                <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Payment Successful!
                </h3>
                <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  {fmt(parsedAmount)} EGP paid to {provider.name}
                </p>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                  E-payments Code: {ePaymentCode}
                </p>
                <button onClick={() => { resetPaymentForm(); }} style={{
                  padding: '14px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))', color: '#fff',
                  fontFamily: f, fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(14,203,203,0.3)',
                }}>
                  Pay Another Bill
                </button>
              </div>
            )}

            {/* ─── Processing State ─── */}
            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Processing Payment...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Please wait while we process your water bill payment
                </p>
              </div>
            )}

            {/* ─── Inquiry State ─── */}
            {paymentStep === 'inquiry' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Inquiring Bill...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Connecting to {provider.name} to fetch your latest bill details
                </p>
              </div>
            )}

            {/* ─── Confirm State ─── */}
            {paymentStep === 'confirm' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 20px 0', textAlign: 'center' }}>
                  Confirm Payment
                </h3>

                <div style={{
                  background: 'var(--input-bg)', borderRadius: '16px', padding: '20px 24px',
                  border: '1px solid var(--glass-border)', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Provider</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: provider.brandColor, fontFamily: f }}>{provider.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>E-payments Code</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>{ePaymentCode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', fontFamily: f }}>AMOUNT DUE</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--teal)', fontFamily: f }}>{fmt(parsedAmount)} EGP</span>
                  </div>
                </div>

                {parsedAmount > balance ? (
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <AlertCircle size={14} /> Insufficient balance to pay this bill
                    </p>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handlePayBill()} disabled={parsedAmount > balance} style={{
                    flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: parsedAmount > balance ? 'not-allowed' : 'pointer',
                    background: parsedAmount > balance ? 'var(--glass)' : provider.brandGradient,
                    color: parsedAmount > balance ? 'var(--text-secondary)' : '#fff',
                    fontFamily: f, fontWeight: 700, fontSize: '14px',
                    boxShadow: parsedAmount > balance ? 'none' : `0 6px 20px ${provider.brandBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <CheckCircle2 size={16} /> Confirm & Pay
                  </button>
                  <button onClick={() => setPaymentStep('form')} style={{
                    padding: '15px 24px', borderRadius: '14px', background: 'transparent',
                    border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ─── OTP State ─── */}
            {renderOTPStep(provider.brandGradient, provider.brandBg, parsedAmount)}

            {/* ─── Form State ─── */}
            {paymentStep === 'form' && (
              <div>
                {/* Balance Display */}
                <div style={{
                  textAlign: 'center', marginBottom: '28px', padding: '16px',
                  background: 'var(--glass)', borderRadius: '14px', border: '1px solid var(--glass-border)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: f }}>
                    Available Balance
                  </p>
                  <span style={{ fontFamily: f, fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    {fmt(balance)} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span>
                  </span>
                </div>

                {/* E-payments Code */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f,
                  }}>
                    <Droplets size={13} /> E-payments Code (رقم السداد الالكتروني)
                  </label>
                  <input
                    type="text"
                    value={ePaymentCode}
                    onChange={handleEPaymentCodeInput}
                    placeholder="Enter your E-payments code"
                    className="premium-input"
                    style={{
                      width: '100%', borderRadius: '14px', padding: '14px 16px',
                      fontSize: '16px', fontWeight: 600, fontFamily: mono, letterSpacing: '1px',
                    }}
                  />
                  {ePaymentCode.length > 0 && ePaymentCode.length < 9 && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Minimum 9 digits required
                    </p>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  onClick={async () => {
                    setPaymentStep('inquiry');
                    await new Promise(r => setTimeout(r, 1500));
                    // Generate random bill amount between 20 and 300 EGP
                    const randomAmount = Math.floor(Math.random() * 280) + 20;
                    setBillAmount(randomAmount.toString());
                    setPaymentStep('confirm');
                  }}
                  disabled={ePaymentCode.length < 9}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                    background: ePaymentCode.length >= 9 ? provider.brandGradient : 'var(--glass)',
                    color: ePaymentCode.length >= 9 ? '#fff' : 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 700, fontSize: '15px', cursor: ePaymentCode.length >= 9 ? 'pointer' : 'not-allowed',
                    boxShadow: ePaymentCode.length >= 9 ? `0 6px 24px ${provider.brandBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.3s ease',
                    ...(ePaymentCode.length >= 9 ? {} : { border: '1.5px solid var(--glass-border)' }),
                  }}
                >
                  <Search size={16} /> Inquire Bill
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Water Providers List ────────────────────────────────
  if (selectedCategory === 'water' && selectedCat) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Back button */}
          <button
            onClick={() => { setSelectedCategory(null); setSelectedProvider(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>

          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: selectedCat.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCat.accentColor,
              boxShadow: `0 8px 24px ${selectedCat.iconBg}`,
            }}>
              {selectedCat.icon}
            </div>
            <div>
              <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                {selectedCat.label}
              </h2>
              <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select your service provider
              </p>
            </div>
          </div>

          {/* Provider Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {waterProviders.map((prov, index) => (
              <div
                key={prov.id}
                className="glass-card"
                onClick={() => setSelectedProvider(prov.id)}
                style={{
                  padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 0 0 2px ${prov.brandBg}`;
                  e.currentTarget.style.borderColor = prov.brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Decorative glow */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
                  background: `radial-gradient(circle, ${prov.brandBg}, transparent)`,
                  borderRadius: '50%', pointerEvents: 'none', opacity: 0.5,
                }} />

                {/* Logo circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', background: prov.brandGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#fff', fontWeight: 800, fontFamily: f,
                  boxShadow: `0 8px 24px ${prov.brandBg}`,
                  transition: 'transform 0.3s ease',
                }}>
                  {prov.logo}
                </div>

                {/* Provider name */}
                <div>
                  <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {prov.name}
                  </h3>
                </div>

                {/* Pay now label */}
                <div style={{
                  padding: '6px 16px', borderRadius: '20px', background: prov.brandBg,
                  fontSize: '11px', fontWeight: 700, color: prov.brandColor, fontFamily: f,
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  Select →
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Gas Provider Bill Payment Form ────────────────
  if (selectedCategory === 'gas' && selectedProvider && provider) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>
          {/* Back button */}
          <button
            onClick={() => { resetPaymentForm(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Providers
          </button>

          <div className="glass-card" style={{ padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px',
              background: `radial-gradient(circle, ${provider.brandBg}, transparent)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            {/* Provider Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', position: 'relative' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', background: provider.brandGradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', color: '#fff', fontWeight: 800, fontFamily: f,
                boxShadow: `0 8px 24px ${provider.brandBg}`,
              }}>
                {provider.logo}
              </div>
              <div>
                <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                  {provider.name}
                </h2>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Pay your gas bill
                </p>
              </div>
            </div>

            {/* ─── Success State ─── */}
            {paymentStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeSlideUp 0.4s ease' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(0,232,143,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                </div>
                <h3 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Payment Successful!
                </h3>
                <p style={{ fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                  {fmt(parsedAmount)} EGP paid to {provider.name}
                </p>
                <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                  Billing Account: {billingAccount}
                </p>
                <button onClick={() => { resetPaymentForm(); }} style={{
                  padding: '14px 32px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))', color: '#fff',
                  fontFamily: f, fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(14,203,203,0.3)',
                }}>
                  Pay Another Bill
                </button>
              </div>
            )}

            {/* ─── Processing State ─── */}
            {paymentStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Processing Payment...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Please wait while we process your gas bill payment
                </p>
              </div>
            )}

            {/* ─── Inquiry State ─── */}
            {paymentStep === 'inquiry' && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader2 size={40} style={{ color: provider.brandColor, animation: 'ring-spin 1s linear infinite', marginBottom: '20px' }} />
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  Inquiring Bill...
                </h3>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Connecting to {provider.name} to fetch your latest bill details
                </p>
              </div>
            )}

            {/* ─── Confirm State ─── */}
            {paymentStep === 'confirm' && (
              <div style={{ animation: 'fadeSlideUp 0.3s ease' }}>
                <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 20px 0', textAlign: 'center' }}>
                  Confirm Payment
                </h3>

                <div style={{
                  background: 'var(--input-bg)', borderRadius: '16px', padding: '20px 24px',
                  border: '1px solid var(--glass-border)', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Provider</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: provider.brandColor, fontFamily: f }}>{provider.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: f }}>Billing Account</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: mono }}>{billingAccount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', fontFamily: f }}>AMOUNT DUE</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--teal)', fontFamily: f }}>{fmt(parsedAmount)} EGP</span>
                  </div>
                </div>

                {parsedAmount > balance ? (
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <AlertCircle size={14} /> Insufficient balance to pay this bill
                    </p>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handlePayBill()} disabled={parsedAmount > balance} style={{
                    flex: 1, padding: '15px', borderRadius: '14px', border: 'none', cursor: parsedAmount > balance ? 'not-allowed' : 'pointer',
                    background: parsedAmount > balance ? 'var(--glass)' : provider.brandGradient,
                    color: parsedAmount > balance ? 'var(--text-secondary)' : '#fff',
                    fontFamily: f, fontWeight: 700, fontSize: '14px',
                    boxShadow: parsedAmount > balance ? 'none' : `0 6px 20px ${provider.brandBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    <CheckCircle2 size={16} /> Confirm & Pay
                  </button>
                  <button onClick={() => setPaymentStep('form')} style={{
                    padding: '15px 24px', borderRadius: '14px', background: 'transparent',
                    border: '1.5px solid var(--glass-border)', color: 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ─── OTP State ─── */}
            {renderOTPStep(provider.brandGradient, provider.brandBg, parsedAmount)}

            {/* ─── Form State ─── */}
            {paymentStep === 'form' && (
              <div>
                {/* Balance Display */}
                <div style={{
                  textAlign: 'center', marginBottom: '28px', padding: '16px',
                  background: 'var(--glass)', borderRadius: '14px', border: '1px solid var(--glass-border)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', fontFamily: f }}>
                    Available Balance
                  </p>
                  <span style={{ fontFamily: f, fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    {fmt(balance)} <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>EGP</span>
                  </span>
                </div>

                {/* Billing Account Code */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase',
                    letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontFamily: f,
                  }}>
                    <Flame size={13} /> Billing Account (رقم المشترك)
                  </label>
                  <input
                    type="text"
                    value={billingAccount}
                    onChange={handleBillingAccountInput}
                    placeholder="Enter your Billing Account number"
                    className="premium-input"
                    style={{
                      width: '100%', borderRadius: '14px', padding: '14px 16px',
                      fontSize: '16px', fontWeight: 600, fontFamily: mono, letterSpacing: '1px',
                    }}
                  />
                  {billingAccount.length > 0 && billingAccount.length < 8 && (
                    <p style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600, fontFamily: f, margin: '6px 0 0 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Minimum 8 digits required
                    </p>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  onClick={async () => {
                    setPaymentStep('inquiry');
                    await new Promise(r => setTimeout(r, 1500));
                    // Generate random bill amount between 20 and 400 EGP
                    const randomAmount = Math.floor(Math.random() * 380) + 20;
                    setBillAmount(randomAmount.toString());
                    setPaymentStep('confirm');
                  }}
                  disabled={billingAccount.length < 8}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                    background: billingAccount.length >= 8 ? provider.brandGradient : 'var(--glass)',
                    color: billingAccount.length >= 8 ? '#fff' : 'var(--text-secondary)',
                    fontFamily: f, fontWeight: 700, fontSize: '15px', cursor: billingAccount.length >= 8 ? 'pointer' : 'not-allowed',
                    boxShadow: billingAccount.length >= 8 ? `0 6px 24px ${provider.brandBg}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    transition: 'all 0.3s ease',
                    ...(billingAccount.length >= 8 ? {} : { border: '1.5px solid var(--glass-border)' }),
                  }}
                >
                  <Search size={16} /> Inquire Bill
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Gas Providers List ────────────────────────────────
  if (selectedCategory === 'gas' && selectedCat) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Back button */}
          <button
            onClick={() => { setSelectedCategory(null); setSelectedProvider(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>

          {/* Category Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: selectedCat.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCat.accentColor,
              boxShadow: `0 8px 24px ${selectedCat.iconBg}`,
            }}>
              {selectedCat.icon}
            </div>
            <div>
              <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                {selectedCat.label}
              </h2>
              <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Select your service provider
              </p>
            </div>
          </div>

          {/* Provider Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {gasProviders.map((prov, index) => (
              <div
                key={prov.id}
                className="glass-card"
                onClick={() => setSelectedProvider(prov.id)}
                style={{
                  padding: '28px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeSlideUp 0.4s ease ${index * 0.08}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.12), 0 0 0 2px ${prov.brandBg}`;
                  e.currentTarget.style.borderColor = prov.brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                {/* Decorative glow */}
                <div style={{
                  position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px',
                  background: `radial-gradient(circle, ${prov.brandBg}, transparent)`,
                  borderRadius: '50%', pointerEvents: 'none', opacity: 0.5,
                }} />

                {/* Logo circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px', background: prov.brandGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#fff', fontWeight: 800, fontFamily: f,
                  boxShadow: `0 8px 24px ${prov.brandBg}`,
                  transition: 'transform 0.3s ease',
                }}>
                  {prov.logo}
                </div>

                {/* Provider name */}
                <div>
                  <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {prov.name}
                  </h3>
                </div>

                {/* Pay now label */}
                <div style={{
                  padding: '6px 16px', borderRadius: '20px', background: prov.brandBg,
                  fontSize: '11px', fontWeight: 700, color: prov.brandColor, fontFamily: f,
                  letterSpacing: '0.5px', textTransform: 'uppercase',
                }}>
                  Select →
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    );
  }

  // ─── Generic Category Detail (Coming Soon) ─────────────────
  if (selectedCategory && selectedCat) {
    return (
      <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '780px' }}>
          {/* Back button */}
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--glass)',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, fontFamily: f,
              cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ArrowLeft size={16} /> Back to Categories
          </button>

          {/* Category Header */}
          <div className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px',
              background: `radial-gradient(circle, ${selectedCat.iconBg}, transparent)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px', background: selectedCat.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedCat.accentColor,
                boxShadow: `0 8px 24px ${selectedCat.iconBg}`,
              }}>
                {selectedCat.icon}
              </div>
              <div>
                <h2 style={{ fontFamily: f, fontWeight: 800, fontSize: '22px', color: 'var(--text-primary)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
                  {selectedCat.label}
                </h2>
                <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  {selectedCat.description}
                </p>
              </div>
            </div>

            {/* Coming Soon Content */}
            <div style={{
              textAlign: 'center', padding: '60px 24px', background: 'var(--glass)', borderRadius: '16px',
              border: '1px dashed var(--glass-border)',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: selectedCat.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                color: selectedCat.accentColor, opacity: 0.7,
              }}>
                {selectedCat.icon}
              </div>
              <h3 style={{ fontFamily: f, fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                Coming Soon
              </h3>
              <p style={{ fontFamily: f, fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
                Service providers for this category will be available shortly. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── Main Category Grid ───
  return (
    <section id="bill-payment" className="page active" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '880px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontFamily: f, fontWeight: 800, fontSize: '26px', color: 'var(--text-primary)',
            margin: '0 0 6px 0', letterSpacing: '-0.5px',
          }}>
            Bill Payment
          </h1>
          <p style={{
            fontFamily: f, fontSize: '14px', color: 'var(--text-secondary)', margin: 0,
          }}>
            Pay your bills quickly and securely. Select a category to get started.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '28px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bill categories..."
            className="premium-input"
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: '14px',
              fontSize: '14px', fontWeight: 500, fontFamily: f,
            }}
          />
        </div>

        {/* Category Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="glass-card"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '20px', background: cat.gradient, position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: `fadeSlideUp 0.4s ease ${index * 0.07}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px ${cat.iconBg}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              {/* Decorative corner glow */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px',
                background: `radial-gradient(circle, ${cat.iconBg}, transparent)`,
                borderRadius: '50%', pointerEvents: 'none', opacity: 0.6,
              }} />

              {/* Icon */}
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px', background: cat.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: cat.accentColor, transition: 'transform 0.3s ease',
                boxShadow: `0 4px 16px ${cat.iconBg}`,
              }}>
                {cat.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontFamily: f, fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)',
                  margin: '0 0 4px 0', letterSpacing: '-0.2px',
                }}>
                  {cat.label}
                </h3>
                <p style={{
                  fontFamily: f, fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0,
                  lineHeight: '1.5',
                }}>
                  {cat.description}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0, opacity: 0.6, transition: 'all 0.2s ease' }} />
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <Search size={32} style={{ color: 'var(--text-secondary)', marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontFamily: f, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                No categories found
              </p>
              <p style={{ fontFamily: f, fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default BillPaymentPage;

