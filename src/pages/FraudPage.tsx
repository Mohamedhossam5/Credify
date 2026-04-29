import React, { useState, useEffect } from 'react';

// ── FRAUD DATA ──
type TimelineEvent = {
  time: string;
  event: string;
  type: "info" | "warn" | "danger";
};

type Alert = {
  id: string;
  user: string;
  userId?: string;
  score: number;
  severity: "critical" | "suspicious" | "safe";
  reason: string;
  txnId: string | null;
  amount: number | null;
  time: string;
  status: string;
  timeline?: TimelineEvent[];
};

const fraudAlertsBase: Alert[] = [
  {
    id: "FRA-001", user: "Yuki Tanaka", userId: "ACC010", score: 91, severity: "critical", reason: "Unusual large withdrawal from new device in foreign country", txnId: "TXN-8816", amount: 25000, time: "11:55 AM", status: "open",
    timeline: [
      { time: "11:50 AM", event: "Login from unknown IP (1.2.3.4 · Tokyo, JP)", type: "warn" },
      { time: "11:53 AM", event: "Device fingerprint mismatch detected", type: "danger" },
      { time: "11:55 AM", event: "Wire transfer initiated: $25,000 to external account", type: "danger" },
      { time: "11:55 AM", event: "Risk engine triggered — BLOCK applied", type: "info" },
    ],
  },
  {
    id: "FRA-002", user: "Omar Taleb", userId: "ACC002", score: 78, severity: "suspicious", reason: "Multiple failed logins followed by high-value withdrawal", txnId: "TXN-8820", amount: 15000, time: "1:58 PM", status: "open",
    timeline: [
      { time: "1:30 PM", event: "5 failed login attempts from Dubai, AE", type: "warn" },
      { time: "1:44 PM", event: "Password reset via email", type: "info" },
      { time: "1:58 PM", event: "Wire transfer $15,000 to unverified account", type: "danger" },
      { time: "1:59 PM", event: "Alert escalated to compliance team", type: "warn" },
    ],
  },
  {
    id: "FRA-003", user: "Nadia Rousseau", userId: "ACC005", score: 65, severity: "suspicious", reason: "Account accessed from 3 different countries within 1 hour", txnId: null, amount: null, time: "12:30 PM", status: "investigating",
    timeline: [
      { time: "12:10 PM", event: "Login from Paris, FR (normal)", type: "info" },
      { time: "12:18 PM", event: "Login from London, GB", type: "warn" },
      { time: "12:29 PM", event: "Login from Moscow, RU — impossible travel", type: "danger" },
      { time: "12:30 PM", event: "Session terminated, account suspended", type: "info" },
    ],
  },
];

const fraudEventTemplates = [
  { user: "Chen Wei", score: 42, severity: "suspicious" as const, reason: "Unusual login from new country" },
  { user: "Carlos Mendez", score: 58, severity: "suspicious" as const, reason: "Multiple rapid transactions detected" },
  { user: "James Liu", score: 71, severity: "suspicious" as const, reason: "High-value transfer to unverified account" },
  { user: "Aisha Baxter", score: 28, severity: "safe" as const, reason: "Normal activity pattern confirmed" },
  { user: "Ivan Petrov", score: 83, severity: "critical" as const, reason: "Device fingerprint mismatch + VPN detected" },
];

const FraudPage: React.FC = () => {
  const [fraudAlerts, setFraudAlerts] = useState<Alert[]>(fraudAlertsBase);
  const [liveAlerts, setLiveAlerts] = useState<Alert[]>([]);
  const [frozenAccounts, setFrozenAccounts] = useState<Set<string>>(new Set());
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  useEffect(() => {
    const fraudSimInterval = setInterval(() => {
      const t = fraudEventTemplates[Math.floor(Math.random() * fraudEventTemplates.length)];
      const newAlert: Alert = {
        id: "FRA-" + String(Math.floor(Math.random() * 9000) + 1000),
        user: t.user,
        score: t.score,
        severity: t.severity,
        reason: t.reason,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "open",
        txnId: null,
        amount: null,
        timeline: [
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event: t.reason,
            type: t.severity === "critical" ? "danger" : "warn",
          },
        ],
      };
      setLiveAlerts(prev => {
        const next = [newAlert, ...prev];
        if (next.length > 5) next.pop();
        return next;
      });
    }, 6000);

    return () => clearInterval(fraudSimInterval);
  }, []);

  const critCount = fraudAlerts.filter((a) => a.severity === "critical").length;
  const suspCount = fraudAlerts.filter((a) => a.severity === "suspicious").length;
  const avgScore = Math.round(fraudAlerts.reduce((a, x) => a + x.score, 0) / (fraudAlerts.length || 1)) || 0;

  const allAlerts = [...liveAlerts, ...fraudAlerts].slice(0, 8);
  const selectedAlert = allAlerts.find(a => a.id === selectedAlertId);

  const getScoreColor = (score: number) => score >= 70 ? "#dc2626" : score >= 40 ? "#d97706" : "#059669";

  const dismissAlert = (id: string) => {
    setFraudAlerts(prev => prev.filter(a => a.id !== id));
    setLiveAlerts(prev => prev.filter(a => a.id !== id));
    setSelectedAlertId(null);
  };

  const freezeFraudAccount = (userId: string | undefined, name: string) => {
    if (userId) {
      setFrozenAccounts(prev => new Set(prev).add(userId));
    }
    // showToast(`❄ Account frozen: ${name}`, "warn");
    setSelectedAlertId(null);
  };

  return (
    <>
      <div className="fade-up">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h1 className="page-title">Fraud Detection</h1>
              <p className="page-subtitle">ML Risk Engine · Real-time Alerts · Case Management</p>
            </div>
            <div className="live-system"><span className="live-dot-red"></span>LIVE SYSTEM</div>
          </div>
        </div>

        <div className="grid-4-fraud" style={{ marginBottom: "20px" }}>
          <div className="kpi-card" style={{ borderTop: "3px solid #fecaca" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "8px" }}>CRITICAL ALERTS</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-danger)" }}>{critCount}</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>Require immediate action</div>
          </div>
          <div className="kpi-card" style={{ borderTop: "3px solid #fde68a" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "8px" }}>SUSPICIOUS</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-warn)" }}>{suspCount}</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>Under investigation</div>
          </div>
          <div className="kpi-card" style={{ borderTop: "3px solid #a7f3d0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "8px" }}>AVG RISK SCORE</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: avgScore >= 70 ? "var(--accent-danger)" : avgScore >= 40 ? "var(--accent-warn)" : "var(--accent-3)" }}>{avgScore}</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>Across all alerts</div>
          </div>
          <div className="kpi-card" style={{ borderTop: "3px solid #bfdbfe" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "8px" }}>ACCOUNTS FROZEN</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{frozenAccounts.size}</div>
            <div style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginTop: "4px" }}>Pending review</div>
          </div>
        </div>

        <div className="grid-fraud-main">
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="section-title" style={{ marginBottom: "0" }}>Fraud Alert Feed</div>
                <span className="live-dot"></span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Click alert for panel</span>
            </div>
            <div id="fraud-live-feed">
              {allAlerts.map(a => {
                const scoreColor = getScoreColor(a.score);
                return (
                  <div key={a.id} className={`alert-row ${a.severity}`} onClick={() => setSelectedAlertId(a.id)}>
                    <div className="risk-score" style={{ background: `${scoreColor}18`, color: scoreColor, border: `1.5px solid ${scoreColor}38` }}>{a.score}</div>
                    <div style={{ flex: 1, minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-primary)" }}>{a.user}</span>
                        <span className={`badge ${a.severity === "critical" ? "badge-red" : a.severity === "suspicious" ? "badge-yellow" : "badge-green"}`}>{a.severity.toUpperCase()}</span>
                        {a.status === "investigating" && <span className="badge badge-blue">INVESTIGATING</span>}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "5px" }}>{a.reason}</div>
                      <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{a.id} · {a.time}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end", flexShrink: 0 }}>
                      {a.amount && <span style={{ fontSize: "13px", fontWeight: 800, fontFamily: "var(--font-mono)", color: scoreColor }}>${a.amount.toLocaleString()}</span>}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card" style={{ padding: "20px" }}>
              <div className="section-title">Risk Distribution</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { label: "Critical (70–100)", color: "var(--accent-danger)", pct: Math.round((critCount / (fraudAlerts.length || 1)) * 100) },
                  { label: "Suspicious (40–69)", color: "var(--accent-warn)", pct: Math.round((suspCount / (fraudAlerts.length || 1)) * 100) },
                  { label: "Safe (0–39)", color: "var(--accent-3)", pct: Math.round(((fraudAlerts.length - critCount - suspCount) / (fraudAlerts.length || 1)) * 100) },
                ].map((r, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{r.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-mono)", color: r.color }}>{r.pct}%</span>
                    </div>
                    <div className="risk-bar">
                      <div className="risk-fill" style={{ width: `${r.pct}%`, background: r.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <div className="section-title">System Status</div>
              {[
                { label: "ML Engine", val: "Online" },
                { label: "Rule Engine", val: "Active" },
                { label: "Data Feed", val: "Live" },
                { label: "Alerts/hour", val: "12" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i !== 3 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{s.label}</span>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-3)" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Alert Drawer overlay mask */}
      {selectedAlert && <div id="drawer-overlay" className="open" onClick={() => setSelectedAlertId(null)}></div>}

      {/* Fraud Alert Drawer */}
      <div id="drawer" className={selectedAlert ? "open" : ""}>
        <button onClick={() => setSelectedAlertId(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {selectedAlert && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", marginTop: "8px", flexWrap: "wrap" }}>
              <div className="risk-score" style={{ width: "52px", height: "52px", fontSize: "15px", background: `${getScoreColor(selectedAlert.score)}18`, color: getScoreColor(selectedAlert.score), border: `2px solid ${getScoreColor(selectedAlert.score)}38` }}>
                {selectedAlert.score}
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800 }}>{selectedAlert.user}</div>
                <div style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{selectedAlert.id}</div>
              </div>
              <span className={`badge ${selectedAlert.severity === "critical" ? "badge-red" : selectedAlert.severity === "suspicious" ? "badge-yellow" : "badge-green"}`} style={{ marginLeft: "auto" }}>
                {selectedAlert.severity.toUpperCase()}
              </span>
            </div>
            <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "8px" }}>REASONING</div>
              <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>{selectedAlert.reason}</div>
            </div>
            {selectedAlert.timeline && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "12px" }}>ACTIVITY TIMELINE</div>
                {selectedAlert.timeline.map((e, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" style={{ background: e.type === "danger" ? "var(--accent-danger)" : e.type === "warn" ? "var(--accent-warn)" : "var(--accent)" }}></div>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "2px" }}>{e.time}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>{e.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "12px" }}>ACTIONS</div>
            <div style={{ display: "grid", gap: "8px" }}>
              <button className="btn btn-danger" onClick={() => freezeFraudAccount(selectedAlert.userId || selectedAlert.user, selectedAlert.user)} style={{ justifyContent: "center" }}>❄ Freeze Account</button>
              {selectedAlert.txnId && <button className="btn btn-warn" style={{ justifyContent: "center" }}>⚠ Flag Transaction {selectedAlert.txnId}</button>}
              <button className="btn btn-warn" style={{ justifyContent: "center" }}>⚠ Require Identity Verification</button>
              <button className="btn btn-ghost" onClick={() => dismissAlert(selectedAlert.id)} style={{ justifyContent: "center" }}>✓ Dismiss Alert</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FraudPage;
