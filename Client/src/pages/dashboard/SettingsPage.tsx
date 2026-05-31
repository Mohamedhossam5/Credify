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

      </div>
    </section>
  );
};

export default SettingsPage;
