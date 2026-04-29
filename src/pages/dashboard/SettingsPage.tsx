import React, { useState, useEffect } from 'react';

const defaultValues = {
  firstName: 'Mohamed',
  middleName: '',
  lastName: 'Hassan',
  email: 'm.hassan@gmail.com',
  phone: '+20 100 123 4567',
  address: '14 Hassan Allam St, Cairo',
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

const SettingsPage: React.FC = () => {
  const [formValues, setFormValues] = useState(defaultValues);
  const [initialValues, setInitialValues] = useState(defaultValues);
  const [isDirty, setIsDirty] = useState(false);

  const [isPwSectionOpen, setIsPwSectionOpen] = useState(false);
  const [pwVisibility, setPwVisibility] = useState({ current: false, new: false, confirm: false });
  const [pwValues, setPwValues] = useState({ current: '', new: '', confirm: '' });
  const [pwError, setPwError] = useState(false);
  const [isSavedAnimating, setIsSavedAnimating] = useState(false);

  useEffect(() => {
    const dirty = JSON.stringify(formValues) !== JSON.stringify(initialValues);
    setIsDirty(dirty);
  }, [formValues, initialValues]);

  const handleChange = (field: keyof typeof defaultValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    setInitialValues(formValues);
    setIsSavedAnimating(true);
    setTimeout(() => {
      setIsSavedAnimating(false);
    }, 2000);
  };

  const revertSettings = () => {
    setFormValues(initialValues);
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
  };

  return (
    <section id="settings" className="page active" style={{ display: 'block', paddingBottom: '100px' }}>

      {/* Sticky Save Bar */}
      <div id="sticky-save-bar" className={isDirty || isSavedAnimating ? 'visible' : ''}>
        {isDirty && !isSavedAnimating && (
          <div className="settings-dirty-indicator" onClick={revertSettings} title="Click to undo changes">
            <div className="dirty-dot"></div>
            <span className="dirty-label">Unsaved changes</span>
          </div>
        )}
        <button
          className="btn-primary"
          style={{
            padding: '12px 28px',
            fontSize: '14px',
            background: isSavedAnimating ? 'linear-gradient(135deg, var(--success), #00a86b)' : undefined
          }}
          onClick={saveSettings}
        >
          {isSavedAnimating ? (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px', maxWidth: '700px' }}>

        {/* Personal Info */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14, 203, 203, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="section-title text-[var(--text-primary)]" style={{ fontSize: '16px' }}>Personal Information</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="mb-0">
              <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">First Name</label>
              <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)]" value={formValues.firstName} onChange={e => handleChange('firstName', e.target.value)} />
            </div>
            <div className="mb-0">
              <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Middle Name</label>
              <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)] placeholder-white/30 dark:placeholder-black/30" placeholder="Optional" value={formValues.middleName} onChange={e => handleChange('middleName', e.target.value)} />
            </div>
            <div className="mb-0">
              <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Last Name</label>
              <input type="text" className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)]" value={formValues.lastName} onChange={e => handleChange('lastName', e.target.value)} />
            </div>
            <div className="mb-0">
              <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Email</label>
              <input type="email" className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)]" value={formValues.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="mb-0">
              <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Phone Number</label>
              <input type="tel" className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['DM_Mono',monospace] tabular-nums text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)]" value={formValues.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="mb-0 col-span-full">
              <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Address</label>
              <textarea className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)] min-h-[100px] resize-y" value={formValues.address} onChange={e => handleChange('address', e.target.value)} />
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
            <div className="section-title text-[var(--text-primary)]" style={{ fontSize: '16px' }}>Security</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>

            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Add extra layer of security</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.twoFa} onChange={e => handleChange('twoFa', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Biometric Login</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Use fingerprint or face ID</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.biometric} onChange={e => handleChange('biometric', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Login Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Get alerted on new logins</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.loginNotif} onChange={e => handleChange('loginNotif', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Transaction Alerts</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>SMS for every transaction</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.txAlerts} onChange={e => handleChange('txAlerts', e.target.checked)} />
                <span className="toggle-slider"></span>
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
            <div
              id="pw-expand-section"
              className={`grid transition-all duration-300 ease-in-out ${isPwSectionOpen ? 'grid-rows-[1fr] opacity-100 mt-[20px]' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
            >
              <div className="overflow-hidden">
                <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
                  <div className="mb-[16px]">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Current Password</label>
                    <div className="relative w-full">
                      <input type={pwVisibility.current ? 'text' : 'password'} className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] pr-[48px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)] placeholder-white/30 dark:placeholder-black/30" placeholder="Enter current password" value={pwValues.current} onChange={e => handlePwChange('current', e.target.value)} />
                      <button className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center justify-center bg-transparent border-none p-0 cursor-pointer" onClick={() => togglePwVis('current')}>
                        {pwVisibility.current ? (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18" /></svg>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-[16px]">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">New Password</label>
                    <div className="relative w-full">
                      <input type={pwVisibility.new ? 'text' : 'password'} className="w-full bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-[12px] px-[16px] py-[13px] pr-[48px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)] placeholder-white/30 dark:placeholder-black/30" placeholder="Enter new password" value={pwValues.new} onChange={e => handlePwChange('new', e.target.value)} />
                      <button className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center justify-center bg-transparent border-none p-0 cursor-pointer" onClick={() => togglePwVis('new')}>
                        {pwVisibility.new ? (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M3 3l18 18" /></svg>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mb-0">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-[var(--text-secondary)] mb-[8px] font-['Inter',sans-serif]">Confirm New Password</label>
                    <div className="relative w-full">
                      <input
                        type={pwVisibility.confirm ? 'text' : 'password'}
                        className={`w-full bg-[var(--input-bg)] border ${pwError ? 'border-[var(--danger)] shadow-[0_0_0_3px_rgba(255,77,106,0.15)]' : 'border-[var(--glass-border)] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)]'} rounded-[12px] px-[16px] py-[13px] text-[var(--text-primary)] font-['Inter',sans-serif] text-[14px] outline-none transition-all duration-[250ms] focus:bg-[rgba(14,203,203,0.04)] placeholder-white/30 dark:placeholder-black/30 pr-[48px]`}
                        placeholder="Repeat new password"
                        value={pwValues.confirm}
                        onChange={e => handlePwChange('confirm', e.target.value)}
                      />
                      <button className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center justify-center bg-transparent border-none p-0 cursor-pointer" onClick={() => togglePwVis('confirm')}>
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
                    <button onClick={togglePwSection} style={{ padding: '10px 20px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: '"Inter", sans-serif' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
            <div className="section-title text-[var(--text-primary)]" style={{ fontSize: '16px' }}>Notification Preferences</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Email Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Receive updates via email</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.emailNotif} onChange={e => handleChange('emailNotif', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Push Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>In-app alerts and reminders</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.pushNotif} onChange={e => handleChange('pushNotif', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="security-row">
              <div>
                <div className="text-[var(--text-primary)]" style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif' }}>Marketing Emails</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Offers and promotional content</div>
              </div>
              <label className="toggle">
                <input type="checkbox" className="settings-toggle" checked={formValues.marketing} onChange={e => handleChange('marketing', e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SettingsPage;
