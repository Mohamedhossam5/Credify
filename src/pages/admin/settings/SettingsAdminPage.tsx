import React, { useState, useEffect } from 'react';

const SettingsAdminPage: React.FC = () => {
  const [twoFA, setTwoFA] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Profile · Security · Preferences</p>
          </div>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>
      <div className="settings-grid">
        <div className="settings-section">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5" /><path d="M3 21a9 9 0 0 1 18 0" /></svg>
            User Profile
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Full Name</div>
              <div className="settings-sublabel">Displayed across the system</div>
            </div>
            <input className="settings-input" defaultValue="Mahmoud Nady" placeholder="Full name" />
          </div>
          <div className="settings-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <div>
              <div className="settings-label">Email Address</div>
              <div className="settings-sublabel">Primary contact & alerts</div>
            </div>
            <input className="settings-input" defaultValue="m.nady@credify.io" placeholder="Email" />
          </div>
          <div style={{ marginTop: "20px" }}>
            <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>Update Profile</button>
          </div>
        </div>
        <div className="settings-section">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Security & Preferences
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Two-Factor Authentication</div>
              <div className="settings-sublabel">TOTP via authenticator app</div>
            </div>
            <div className="toggle-wrap" onClick={() => setTwoFA(!twoFA)}>
              <div className={`toggle ${twoFA ? "on" : ""}`} id="toggle-twoFA"></div>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Email Alerts</div>
              <div className="settings-sublabel">Critical fraud & system alerts</div>
            </div>
            <div className="toggle-wrap" onClick={() => setEmailAlerts(!emailAlerts)}>
              <div className={`toggle ${emailAlerts ? "on" : ""}`} id="toggle-emailAlerts"></div>
            </div>
          </div>
          <div className="settings-row" style={{ borderBottom: "none", paddingBottom: "8px" }}>
            <div>
              <div className="settings-label">Interface Theme</div>
              <div className="settings-sublabel">Dark or light mode</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
            <div className={`theme-option ${theme === "light" ? "active" : ""}`} onClick={() => toggleTheme("light")}>Light Mode</div>
            <div className={`theme-option ${theme === "dark" ? "active" : ""}`} onClick={() => toggleTheme("dark")}>Dark Mode</div>
          </div>
          <button className="btn btn-danger" style={{ width: "100%", justifyContent: "center" }}>Reset Password</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsAdminPage;
