import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

const defaultValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  twoFa: true,
  biometric: false,
  loginNotif: true,
  txAlerts: true,
  emailNotif: true,
  pushNotif: true,
  marketing: false,
  language: 'en',
  currency: 'EGP'
};

const f = '"Inter",sans-serif';
const mono = '"JetBrains Mono", monospace';

const SettingsPage: React.FC = () => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [initialValues, setInitialValues] = useState(defaultValues);
  const [isPwSectionOpen, setIsPwSectionOpen] = useState(false);
  const [pwVisibility, setPwVisibility] = useState({ current: false, new: false, confirm: false });
  const [pwValues, setPwValues] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState(false);
  const [isSavedAnimating, setIsSavedAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user, setUser } = useAuthStore();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isDirty = JSON.stringify(formValues) !== JSON.stringify(initialValues);

  // FAQ Chatbot State & Data
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLauncherPulse, setIsLauncherPulse] = useState(true);

  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'system'; text: string; timestamp: Date }>>([
    {
      id: 'welcome',
      sender: 'system',
      text: `Hello ${user?.firstName || 'Ahmed'}! 👋 Welcome to Credify Priority Support. Click one of the quick questions below, or type a custom message to chat with our smart support assistant!`,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Show welcome tooltip after 2.5 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when messages or typing states update
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isChatOpen]);

  const faqs = [
    {
      id: 'faq-1',
      question: "Lost device / freeze card",
      text: "I lost my registered device, how can I securely access my account or temporarily freeze my cards?",
      answer: "If you've lost your device, don't worry! You can instantly freeze all cards via our SMS quick-action portal (text 'FREEZE' to 1603) or by logging in from a secure desktop web session. Our security system will restrict withdrawals until you complete biometric verification on your new device."
    },
    {
      id: 'faq-2',
      question: "Transaction fees info",
      text: "Are there any transaction fees when sending money or transferring funds to external bank accounts?",
      answer: "Internal transfers between Credify users are 100% free! External transfers to local banks incur a flat 0.5% network fee (capped at 50 EGP). For international transfers, we utilize real-time wholesale interbank exchange rates with zero hidden markups."
    },
    {
      id: 'faq-3',
      question: "Generate virtual card",
      text: "Can I instantly generate a virtual debit card for online purchases, and how do spend limits work?",
      answer: "Absolutely! Go to 'Cards & Accounts' and click '+ Add New' -> 'Virtual Card'. You can instantly generate one for online purchases, set custom spending caps, or create a 'burnable' single-use card that automatically destroys itself after a transaction."
    },
    {
      id: 'faq-4',
      question: "Upgrade limits & verification",
      text: "My daily transaction limit is currently capped. How can I upgrade my account verification tier?",
      answer: "To upgrade your transaction limits, you simply need a quick KYC update. Go to your Profile and upload a valid national ID or proof of address. Our compliance team reviews these in under 15 minutes, unlocking tier-2 limits up to 250,000 EGP daily."
    },
    {
      id: 'faq-5',
      question: "Dispute a transaction",
      text: "I noticed an unfamiliar transaction on my account. How do I dispute a charge?",
      answer: "Safety first! If you see a charge you don't recognize, immediately click on that transaction in your History page and press 'Dispute Transaction'. This instantly freezes the funds and opens a secure priority ticket with our 24/7 fraud dispute team."
    },
    {
      id: 'faq-6',
      question: "Customize dashboard views",
      text: "Can I customize my dashboard view to prioritize specific accounts or currency charts?",
      answer: "Yes! At the top of your Dashboard page, click 'Customize Layout'. You can drag-and-drop widgets, hide specific currency trends, or pin your most frequent transfer beneficiaries right to the quick-actions bar for a personalized experience."
    }
  ];

  const handleFaqClick = (faqText: string, faqAnswer: string) => {
    const userMsgId = `msg-user-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: faqText,
        timestamp: new Date()
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          text: faqAnswer,
          timestamp: new Date()
        }
      ]);
    }, 800);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsgId = `msg-user-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: userText,
        timestamp: new Date()
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const query = userText.toLowerCase();
      let replyText = "";

      if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        replyText = `Hi ${user?.firstName || 'there'}! 👋 How can I help you with your Credify dashboard today? You can ask me about card freezes, transaction fees, limits, or how to customize your widgets.`;
      } else if (query.includes('fee') || query.includes('charge') || query.includes('cost') || query.includes('price')) {
        replyText = "We keep our pricing fully transparent! Internal Credify transfers are 100% free of charge. External local transfers cost a flat 0.5% (capped at 50 EGP), and FX rates match the wholesale market rates with zero markups.";
      } else if (query.includes('freeze') || query.includes('lost') || query.includes('stolen') || query.includes('card')) {
        replyText = "If your card is lost or stolen, you can lock it immediately from the 'Cards & Accounts' section or by texting 'FREEZE' to 1603 from your registered phone number. This instantly stops all withdrawals.";
      } else if (query.includes('password') || query.includes('security') || query.includes('reset') || query.includes('2fa')) {
        replyText = "You can update your security settings, change your login password, or enable biometric login and Two-Factor Authentication right in the 'Security' section located directly above this support chat!";
      } else if (query.includes('limit') || query.includes('kyc') || query.includes('tier') || query.includes('verify')) {
        replyText = "To increase your daily transfer limits, navigate to your profile KYC section to upload an updated National ID or proof of address. Verification is processed by our compliance team in under 15 minutes!";
      } else if (query.includes('contact') || query.includes('human') || query.includes('agent') || query.includes('support') || query.includes('phone') || query.includes('call')) {
        replyText = "Need human assistance? Our 24/7 priority support team is always active! You can contact us instantly at admin@credify.com or place a priority direct call to our support hotline at 02 27570574.";
      } else {
        replyText = "That is a great question! While I'm simulating our conversational AI Assistant, you can instantly resolve this or get custom guidance from our official support team at admin@credify.com or via hot-line at 02 27570574. Would you like me to help you with card freezes, limits, or fees instead?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          text: replyText,
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        // Start a brand-new chat session when opening
        setMessages([
          {
            id: 'welcome',
            sender: 'system',
            text: `Hello ${user?.firstName || 'Ahmed'}! 👋 Welcome to Credify Priority Support. Click one of the quick questions below, or type a custom message to chat with our smart support assistant!`,
            timestamp: new Date()
          }
        ]);
      }
      return nextState;
    });
    setShowTooltip(false);
    setIsLauncherPulse(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.user) {
          const fetchedData = {
            firstName: data.user.firstName || '',
            middleName: data.user.middleName || '',
            lastName: data.user.lastName || '',
            email: data.user.email || '',
            phone: data.user.phoneNumber || '',
            address: data.user.address || '',
            twoFa: true,
            biometric: false,
            loginNotif: true,
            txAlerts: true,
            emailNotif: true,
            pushNotif: true,
            marketing: false,
            language: 'en',
            currency: 'EGP'
          };
          setInitialValues(fetchedData);
          setFormValues(fetchedData);
          setProfilePic(data.user.profilePicture || null);
        }
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof typeof defaultValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    setInitialValues(formValues);
    setIsSavedAnimating(true);
    setTimeout(() => {
      setIsSavedAnimating(false);
      toast.success('Settings updated successfully');
    }, 1500);
  };

  const revertSettings = () => {
    setFormValues(initialValues);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePic || !user) return;
    setIsUploading(true);
    try {
      await authService.updateProfilePicture(profilePic);
      setUser({ ...user, profilePicture: profilePic });
      setSelectedFile(null);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error('Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  const togglePwSection = () => {
    setIsPwSectionOpen(!isPwSectionOpen);
  };

  const togglePwVis = (field: keyof typeof pwVisibility) => {
    setPwVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePwChange = (field: keyof typeof pwValues, value: string) => {
    setPwValues(prev => ({ ...prev, [field]: value }));
    if (field === 'confirm' || field === 'new') {
      setPwError(false);
    }
  };

  const submitPasswordChange = () => {
    const { current, new: nw, confirm } = pwValues;
    if (!current || !nw || !confirm) return;
    if (nw !== confirm) {
      setPwError(true);
      return;
    }
    setPwValues({ current: '', new: '', confirm: '' });
    setPwError(false);
    setIsPwSectionOpen(false);
    toast.success('Password updated successfully');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '300px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const inputStyle = { width: '100%', borderRadius: '12px', padding: '14px 16px', fontSize: '14px' };

  return (
    <section id="settings" className="page active" style={{ display: 'block', paddingBottom: '100px' }}>

      <div style={{ display: 'grid', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>

        {/* Profile Picture */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            {profilePic ? (
              <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--glass-border)' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <label style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <svg width="16" height="16" fill="none" stroke="var(--text-primary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </label>
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f }}>Profile Picture</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '12px' }}>Upload a photo to personalize your account.</div>
            {selectedFile && (
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={uploadProfilePicture} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Save Picture'}
              </button>
            )}
          </div>
        </div>

        {/* Personal Info */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14, 203, 203, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="section-title" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Personal Information</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>First Name</label>
              <input type="text" className="premium-input" style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} value={formValues.firstName} readOnly />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Middle Name</label>
              <input type="text" className="premium-input" style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} placeholder="Optional" value={formValues.middleName} readOnly />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Last Name</label>
              <input type="text" className="premium-input" style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} value={formValues.lastName} readOnly />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Email</label>
              <input type="email" className="premium-input" style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} value={formValues.email} readOnly />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Phone Number</label>
              <input type="tel" className="premium-input" style={{ ...inputStyle, fontFamily: mono, opacity: 0.7, cursor: 'not-allowed' }} value={formValues.phone} readOnly />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Address</label>
              <textarea className="premium-input" style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', opacity: 0.7, cursor: 'not-allowed' }} value={formValues.address} readOnly />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26, 111, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="#7AB8FF" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="section-title" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Security</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>

            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Add extra layer of security</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.twoFa} onChange={e => handleChange('twoFa', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>

            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Biometric Login</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Use fingerprint or face ID</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.biometric} onChange={e => handleChange('biometric', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>

            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Login Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Get alerted on new logins</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.loginNotif} onChange={e => handleChange('loginNotif', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>

            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Transaction Alerts</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>SMS for every transaction</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.txAlerts} onChange={e => handleChange('txAlerts', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>

          </div>

          <div style={{ marginTop: '16px' }}>
            <button
              className="btn-primary"
              style={{ fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={togglePwSection}
            >
              {isPwSectionOpen ? (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="18 15 12 9 6 15" />
                  </svg> Hide
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg> Change Password
                </>
              )}
            </button>
            {isPwSectionOpen && (
              <div style={{ marginTop: '20px', padding: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', animation: 'fadein 0.3s ease' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={pwVisibility.current ? 'text' : 'password'} className="premium-input" style={inputStyle} placeholder="Enter current password" value={pwValues.current} onChange={e => handlePwChange('current', e.target.value)} />
                    <button style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => togglePwVis('current')}>
                      {pwVisibility.current ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18" /></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={pwVisibility.new ? 'text' : 'password'} className="premium-input" style={inputStyle} placeholder="Enter new password" value={pwValues.new} onChange={e => handlePwChange('new', e.target.value)} />
                    <button style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => togglePwVis('new')}>
                      {pwVisibility.new ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18" /></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: f }}>Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={pwVisibility.confirm ? 'text' : 'password'}
                      className="premium-input"
                      style={{ ...inputStyle, border: pwError ? '1px solid var(--red)' : undefined }}
                      placeholder="Repeat new password"
                      value={pwValues.confirm}
                      onChange={e => handlePwChange('confirm', e.target.value)}
                    />
                    <button style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => togglePwVis('confirm')}>
                      {pwVisibility.confirm ? (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18" /></svg>
                      ) : (
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #4F46E5, #8B5CF6)', boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)', border: 'none' }} onClick={submitPasswordChange}>
                    Update Password
                  </button>
                  <button onClick={togglePwSection} style={{ padding: '10px 20px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: f }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 232, 143, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="var(--success)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className="section-title" style={{ color: 'var(--text-primary)', fontSize: '16px' }}>Notification Preferences</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Email Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Receive updates via email</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.emailNotif} onChange={e => handleChange('emailNotif', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>
            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Push Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>In-app alerts and reminders</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.pushNotif} onChange={e => handleChange('pushNotif', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>
            <div className="security-row">
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', fontFamily: f }}>Marketing Emails</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Offers and promotional content</div>
              </div>
              <label className="modern-toggle-label">
                <input type="checkbox" className="settings-toggle" checked={formValues.marketing} onChange={e => handleChange('marketing', e.target.checked)} />
                <span className="modern-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Inline Unsaved Changes Bar */}
        {(isDirty || isSavedAnimating) && (
          <div 
            style={{ 
              width: '100%', 
              marginTop: '12px', 
              animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div className="save-bar-pill" style={{ 
              maxWidth: '700px', 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', 
              border: '1px solid var(--glass-border)', 
              background: 'var(--navy-mid)',
              pointerEvents: 'all'
            }}>
              {/* Left: status */}
              <div className="save-bar-left">
                {!isSavedAnimating && <div className="dirty-dot" />}
                {isSavedAnimating ? (
                  <div className="save-bar-text">
                    <span className="save-bar-title">Changes saved</span>
                    <span className="save-bar-subtitle">All modifications have been applied</span>
                  </div>
                ) : (
                  <div className="save-bar-text">
                    <span className="save-bar-title">Unsaved Changes</span>
                    <span className="save-bar-subtitle">You have pending modifications</span>
                  </div>
                )}
              </div>

              {/* Right: actions */}
              <div className="save-bar-right">
                {isDirty && !isSavedAnimating && (
                  <button className="save-bar-revert" onClick={revertSettings} style={{ cursor: 'pointer' }}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Revert
                  </button>
                )}
                <button
                  className={`save-bar-save${isSavedAnimating ? ' saved' : ''}`}
                  onClick={saveSettings}
                  style={{ cursor: 'pointer' }}
                >
                  {isSavedAnimating ? (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help & Support Chatbot Card (Follows the exact same card rhythm and size as Security & Notification cards above) */}
        <div style={{ 
          marginTop: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-end', 
          width: '100%'
        }}>
          {/* Welcome Tooltip & Launcher (Floating fixed at the bottom-right of the screen when closed) */}
          {!isChatOpen && (
            <div style={{ 
              position: 'fixed', 
              bottom: '30px', 
              right: '30px', 
              zIndex: 1000, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <div 
                className="chat-welcome-tooltip-inline"
                onClick={toggleChat}
                style={{ 
                  background: 'linear-gradient(135deg, var(--teal), var(--blue))',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                  cursor: 'pointer',
                  position: 'relative',
                  animation: 'tooltip-pulse 2s infinite ease-in-out',
                  whiteSpace: 'nowrap'
                }}
              >
                Need help? Ask me anything. 
                <div style={{
                  content: "''",
                  position: 'absolute',
                  top: '50%',
                  right: '-4px',
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: '8px',
                  height: '8px',
                  background: 'var(--blue)'
                }} />
              </div>
              
              <button 
                className={`chat-launcher-inline ${isLauncherPulse ? 'pulse-active' : ''}`}
                onClick={toggleChat}
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'var(--glass)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleChat();
                  }
                }}
                aria-label="Toggle support chat"
                aria-expanded={isChatOpen}
                tabIndex={0}
              >
                <img 
                  src="logos/icons8-chatbot.gif" 
                  alt="Support Assistant" 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    objectFit: 'contain',
                    borderRadius: '50%'
                  }} 
                />
              </button>
            </div>
          )}

          {/* Expanded Inline Chat Panel styled EXACTLY like the settings cards above */}
          {isChatOpen && (
            <div 
              className="glass-card" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                animation: 'fadein 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
                padding: '28px' /* Identical padding of other cards */
              }}
            >
              {/* Header: Replicates exact card header design of Security and Notification cards */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: 'rgba(14, 203, 203, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  <img src="logos/icons8-chatbot.gif" alt="Support Chatbot" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Help & Support
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                    Online • 24/7 Virtual Assistant
                  </div>
                </div>
                {/* Close Button in header */}
                <button 
                  onClick={toggleChat}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-secondary)', 
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s'
                  }}
                  aria-label="Close chat"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Message History */}
              <div 
                style={{ 
                  height: '280px', 
                  overflowY: 'auto', 
                  padding: '12px 14px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  background: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  marginBottom: '16px'
                }} 
                className="chat-messages-container"
              >
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      animation: 'fadein 0.25s cubic-bezier(0.16, 1, 0.3, 1) both'
                    }}
                  >
                    <div style={{ 
                      maxWidth: '85%', 
                      padding: '11px 15px', 
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--teal), var(--blue))' : 'var(--navy-mid)',
                      color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(99, 102, 241, 0.15)' : 'none',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
                    }}>
                      {msg.text}
                      <div style={{ 
                        fontSize: '9px', 
                        color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', 
                        textAlign: 'right', 
                        marginTop: '4px',
                        fontFamily: mono
                      }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Animated Typing Indicator */}
                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadein 0.2s ease both' }}>
                    <div style={{ 
                      background: 'var(--navy-mid)', 
                      padding: '10px 16px', 
                      borderRadius: '16px 16px 16px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid var(--glass-border)'
                    }}>
                      <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                      <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                      <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Quick FAQs Pill Buttons */}
              <div style={{ 
                padding: '0 0 12px 0', 
                background: 'transparent'
              }}>
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.8px', marginBottom: '8px', fontFamily: f }}>
                  Quick Questions
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }} className="chat-messages-container">
                  {faqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFaqClick(faq.text, faq.answer)}
                      className="faq-pill-btn"
                      style={{
                        background: 'var(--navy-mid)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '10px',
                        padding: '7px 12px',
                        fontSize: '11.5px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: f,
                        fontWeight: 500
                      }}
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input Bar */}
              <form 
                onSubmit={handleSendMessage}
                style={{ 
                  paddingTop: '12px', 
                  borderTop: '1px solid var(--glass-border)', 
                  background: 'transparent',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                <input 
                  type="text" 
                  placeholder="Type a custom message..." 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  style={{ 
                    flex: 1, 
                    background: 'var(--navy-mid)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '10px', 
                    padding: '10px 14px', 
                    color: 'var(--text-primary)', 
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: f,
                    transition: 'border-color 0.2s'
                  }}
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: chatInput.trim() ? 'linear-gradient(135deg, var(--teal), var(--blue))' : 'var(--navy-mid)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.25s ease',
                    color: chatInput.trim() ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>


      </div>
    </section>
  );
};

export default SettingsPage;
