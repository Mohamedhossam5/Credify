import React, { useState } from 'react';

// Data from the provided HTML
const accountsData = [
  { id: "ACC001", name: "Sarah Kowalski", email: "sarah.k@email.com", balance: 48230.50, risk: 12, lastActivity: "2m ago", country: "US", joined: "Jan 12, 2023", txnCount: 342, kycStatus: "verified", status: "active" },
  { id: "ACC002", name: "Omar Taleb", email: "o.taleb@email.com", balance: 3810.00, risk: 78, lastActivity: "3d ago", country: "AE", joined: "Mar 5, 2023", txnCount: 89, kycStatus: "verified", status: "frozen" },
  { id: "ACC003", name: "Priya Mehta", email: "priya.m@email.com", balance: 124500.00, risk: 5, lastActivity: "5m ago", country: "IN", joined: "Nov 2, 2022", txnCount: 1204, kycStatus: "verified", status: "active" },
  { id: "ACC004", name: "James Liu", email: "j.liu@finance.com", balance: 72100.75, risk: 31, lastActivity: "1h ago", country: "CN", joined: "Feb 28, 2023", txnCount: 567, kycStatus: "pending", status: "pending" },
  { id: "ACC005", name: "Nadia Rousseau", email: "nadia.r@eu.com", balance: 9200.20, risk: 65, lastActivity: "12h ago", country: "FR", joined: "Jul 19, 2023", txnCount: 201, kycStatus: "failed", status: "blocked" },
  { id: "ACC006", name: "Chen Wei", email: "chen.wei@corp.cn", balance: 215000.00, risk: 8, lastActivity: "30m ago", country: "CN", joined: "Apr 1, 2022", txnCount: 3410, kycStatus: "verified", status: "active" },
  { id: "ACC007", name: "Ivan Petrov", email: "ivan.p@mail.ru", balance: 2340.90, risk: 44, lastActivity: "2h ago", country: "RU", joined: "Sep 14, 2023", txnCount: 78, kycStatus: "pending", status: "pending" },
  { id: "ACC008", name: "Aisha Baxter", email: "a.baxter@bank.uk", balance: 88900.00, risk: 15, lastActivity: "8m ago", country: "GB", joined: "Dec 3, 2022", txnCount: 892, kycStatus: "verified", status: "active" },
  { id: "ACC009", name: "Carlos Mendez", email: "c.mendez@mx.com", balance: 15700.30, risk: 22, lastActivity: "45m ago", country: "MX", joined: "May 7, 2023", txnCount: 315, kycStatus: "verified", status: "active" },
  { id: "ACC010", name: "Yuki Tanaka", email: "y.tanaka@jp.co", balance: 5600.00, risk: 91, lastActivity: "6d ago", country: "JP", joined: "Aug 22, 2023", txnCount: 44, kycStatus: "failed", status: "blocked" },
];

const initials = (name: string) => name.split(" ").map(n => n[0]).join("");

const AccountsAdminPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [frozenAccounts, setFrozenAccounts] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<typeof accountsData[0] | null>(null);

  const getDisplayStatus = (a: any) => {
    if (a.kycStatus === "pending") return "pending";
    if (a.kycStatus === "failed") return "blocked";
    return frozenAccounts.has(a.id) ? "frozen" : a.status;
  };

  const filteredAccounts = accountsData.filter(a => {
    const ds = getDisplayStatus(a);
    if (statusFilter !== "all" && ds !== statusFilter) return false;
    if (riskFilter === "low" && a.risk >= 40) return false;
    if (riskFilter === "medium" && (a.risk < 40 || a.risk >= 70)) return false;
    if (riskFilter === "high" && a.risk < 70) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleFreeze = () => {
    if (!selectedAcc) return;
    const newSet = new Set(frozenAccounts);
    if (newSet.has(selectedAcc.id)) {
      newSet.delete(selectedAcc.id);
    } else {
      newSet.add(selectedAcc.id);
    }
    setFrozenAccounts(newSet);
    setDrawerOpen(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "badge-green", frozen: "badge-blue", suspended: "badge-red", pending: "badge-yellow", blocked: "badge-red", completed: "badge-green", flagged: "badge-red", failed: "badge-gray"
    };
    return <span className={`admin-badge ${map[status] || "badge-gray"}`}>{status.toUpperCase()}</span>;
  };

  const riskBadge = (score: number) => {
    if (score >= 70) return <span className="admin-badge badge-red">HIGH {score}</span>;
    if (score >= 40) return <span className="admin-badge badge-yellow">MED {score}</span>;
    return <span className="admin-badge badge-green">LOW {score}</span>;
  };

  const kycBadge = (status: string) => {
    const map: Record<string, string> = { verified: "badge-green", pending: "badge-yellow", failed: "badge-red" };
    return <span className={`admin-badge ${map[status] || "badge-gray"}`}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="fade-up" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 className="page-title">Accounts</h1>
            <p className="page-subtitle">User account management · KYC · {accountsData.length} total accounts</p>
          </div>
          <button className="admin-btn btn-primary">+ Add Account</button>
        </div>
      </div>

      <div className="modern-filter-header">
        <div className="modern-search-wrap">
          <svg className="modern-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by name, email, account ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-chips-area">
          <div className="filter-chip-group">
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Status</span>
            <button className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</button>
            <button className={`filter-chip ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}><span className="chip-dot" style={{ background: '#059669' }}></span>Active</button>
            <button className={`filter-chip ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}><span className="chip-dot" style={{ background: '#d97706' }}></span>Pending</button>
            <button className={`filter-chip ${statusFilter === 'blocked' ? 'active' : ''}`} onClick={() => setStatusFilter('blocked')}><span className="chip-dot" style={{ background: '#dc2626' }}></span>Blocked</button>
            <button className={`filter-chip ${statusFilter === 'frozen' ? 'active' : ''}`} onClick={() => setStatusFilter('frozen')}><span className="chip-dot" style={{ background: '#2563eb' }}></span>Frozen</button>
          </div>
          <div className="filter-chip-separator"></div>
          <div className="filter-chip-group">
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Risk</span>
            <button className={`filter-chip ${riskFilter === 'all' ? 'active' : ''}`} onClick={() => setRiskFilter('all')}>All</button>
            <button className={`filter-chip ${riskFilter === 'low' ? 'active' : ''}`} onClick={() => setRiskFilter('low')}><span className="chip-dot" style={{ background: '#059669' }}></span>Low</button>
            <button className={`filter-chip ${riskFilter === 'medium' ? 'active' : ''}`} onClick={() => setRiskFilter('medium')}><span className="chip-dot" style={{ background: '#d97706' }}></span>Medium</button>
            <button className={`filter-chip ${riskFilter === 'high' ? 'active' : ''}`} onClick={() => setRiskFilter('high')}><span className="chip-dot" style={{ background: '#dc2626' }}></span>High</button>
          </div>
        </div>
      </div>

      <div className="modern-table-card desktop-table">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>USER</th><th>EMAIL</th><th>BALANCE</th><th>STATUS</th><th>RISK</th><th>LAST ACTIVE</th><th>KYC</th></tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No accounts match the current filters</td></tr>
              ) : filteredAccounts.map(a => {
                const ds = getDisplayStatus(a);
                return (
                  <tr key={a.id} onClick={() => { setSelectedAcc(a); setDrawerOpen(true); }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(a.name)}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px' }}>{a.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{a.email}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                    <td>{statusBadge(ds)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="risk-bar" style={{ width: '56px' }}>
                          <div className="risk-fill" style={{ width: `${a.risk}%`, background: a.risk >= 70 ? "var(--accent-danger)" : a.risk >= 40 ? "var(--accent-warn)" : "var(--accent-3)" }}></div>
                        </div>
                        {riskBadge(a.risk)}
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{a.lastActivity}</td>
                    <td>{kycBadge(a.kycStatus)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="mobile-card-list mobile-card-container">
        {filteredAccounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>No accounts match filters</div>
        ) : filteredAccounts.map(a => {
          const ds = getDisplayStatus(a);
          return (
            <div className="mobile-card-item" key={a.id} onClick={() => { setSelectedAcc(a); setDrawerOpen(true); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(a.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                </div>
                {statusBadge(ds)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div><div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '3px' }}>BALANCE</div><div style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-3)' }}>${a.balance.toLocaleString("en-US", { minimumFractionDigits: 0 })}</div></div>
                <div><div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '3px' }}>RISK</div>{riskBadge(a.risk)}</div>
                <div><div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '3px' }}>KYC</div>{kycBadge(a.kycStatus)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
      <div className={`drawer-panel ${drawerOpen ? 'open' : ''}`}>
        <button onClick={() => setDrawerOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
        {selectedAcc && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', marginTop: '8px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 700, color: '#fff' }}>{initials(selectedAcc.name)}</div>
              <div><div style={{ fontSize: '19px', fontWeight: 800 }}>{selectedAcc.name}</div><div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{selectedAcc.email}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>BALANCE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-3)' }}>${selectedAcc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>RISK SCORE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: selectedAcc.risk >= 70 ? "var(--accent-danger)" : selectedAcc.risk >= 40 ? "var(--accent-warn)" : "var(--accent-3)" }}>{selectedAcc.risk}/100</div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>STATUS</div>
                <div style={{ marginTop: '4px' }}>{statusBadge(getDisplayStatus(selectedAcc))}</div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>KYC</div>
                <div style={{ marginTop: '4px' }}>{kycBadge(selectedAcc.kycStatus)}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>ACCOUNT DETAILS</div>
              {[
                ["Account ID", selectedAcc.id],
                ["Country", selectedAcc.country],
                ["Member Since", selectedAcc.joined],
                ["Transactions", selectedAcc.txnCount.toLocaleString()],
                ["Last Activity", selectedAcc.lastActivity]
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>ACCOUNT ACTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {selectedAcc.kycStatus === "verified" ? (
                <button className={`admin-btn ${frozenAccounts.has(selectedAcc.id) ? "btn-success" : "btn-danger"}`} onClick={toggleFreeze} style={{ justifyContent: 'center' }}>
                  {frozenAccounts.has(selectedAcc.id) ? "✓ Unfreeze" : "❄ Freeze Account"}
                </button>
              ) : (
                <button className="admin-btn btn-ghost" disabled style={{ justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>❄ Freeze (KYC not verified)</button>
              )}
              <button className="admin-btn btn-warn" onClick={() => {}} style={{ justifyContent: 'center' }}>⚠ Require KYC</button>
              <button className="admin-btn btn-ghost" onClick={() => {}} style={{ justifyContent: 'center' }}>View Transactions</button>
              <button className="admin-btn btn-ghost" onClick={() => {}} style={{ justifyContent: 'center' }}>✉ Contact</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsAdminPage;
