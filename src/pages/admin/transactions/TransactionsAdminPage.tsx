import React, { useState } from 'react';

// ── TRANSACTIONS DATA ──
const txnBase = [
  { id: "TXN-8821", sender: "Sarah Kowalski", receiver: "James Liu", amount: 4200.0, status: "completed", type: "transfer", date: "2024-01-15 14:32", device: "iPhone 14 · iOS 17", ip: "192.168.1.14", method: "ACH", fee: 2.1, },
  { id: "TXN-8820", sender: "Omar Taleb", receiver: "External Bank", amount: 15000.0, status: "flagged", type: "withdrawal", date: "2024-01-15 13:58", device: "Chrome · Win11", ip: "185.234.xx.xx", method: "Wire", fee: 25.0, },
  { id: "TXN-8819", sender: "Priya Mehta", receiver: "Nadia Rousseau", amount: 890.5, status: "completed", type: "transfer", date: "2024-01-15 13:21", device: "Android · Samsung", ip: "10.0.0.22", method: "Internal", fee: 0.89, },
  { id: "TXN-8818", sender: "External", receiver: "Chen Wei", amount: 50000.0, status: "completed", type: "deposit", date: "2024-01-15 12:44", device: "MacBook · Safari", ip: "203.12.xx.xx", method: "Wire", fee: 15.0, },
  { id: "TXN-8817", sender: "Ivan Petrov", receiver: "Aisha Baxter", amount: 320.0, status: "pending", type: "transfer", date: "2024-01-15 12:10", device: "Firefox · Ubuntu", ip: "77.88.xx.xx", method: "ACH", fee: 0.32, },
  { id: "TXN-8816", sender: "Yuki Tanaka", receiver: "External", amount: 25000.0, status: "blocked", type: "withdrawal", date: "2024-01-15 11:55", device: "Unknown Device", ip: "1.2.3.4", method: "Wire", fee: 0, },
  { id: "TXN-8815", sender: "Carlos Mendez", receiver: "Sarah Kowalski", amount: 1200.0, status: "completed", type: "transfer", date: "2024-01-15 11:20", device: "iPhone 13 · iOS 17", ip: "192.168.2.5", method: "Internal", fee: 1.2, },
  { id: "TXN-8814", sender: "James Liu", receiver: "External", amount: 8000.0, status: "completed", type: "withdrawal", date: "2024-01-15 10:45", device: "Chrome · MacOS", ip: "125.32.xx.xx", method: "ACH", fee: 8.0, },
  { id: "TXN-8813", sender: "External", receiver: "Nadia Rousseau", amount: 500.0, status: "failed", type: "deposit", date: "2024-01-15 10:12", device: "Edge · Win10", ip: "91.22.xx.xx", method: "Card", fee: 0, },
  { id: "TXN-8812", sender: "Aisha Baxter", receiver: "Carlos Mendez", amount: 7500.0, status: "completed", type: "transfer", date: "2024-01-15 09:33", device: "iPad · iOS 16", ip: "85.12.xx.xx", method: "Internal", fee: 3.75, },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "badge-green",
    frozen: "badge-blue",
    suspended: "badge-red",
    pending: "badge-yellow",
    blocked: "badge-red",
    completed: "badge-green",
    flagged: "badge-red",
    failed: "badge-gray",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status.toUpperCase()}</span>;
};

const TransactionsAdminPage: React.FC = () => {
  const [txnData] = useState(txnBase);
  const [txnActiveStatusChip, setTxnActiveStatusChip] = useState("all");
  const [txnActiveTypeChip, setTxnActiveTypeChip] = useState("all");
  const [search, setSearch] = useState("");
  const [flaggedTransactions, setFlaggedTransactions] = useState<Set<string>>(new Set(
    txnBase.filter(t => t.status === "flagged").map(t => t.id)
  ));
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);

  const getFilteredTxns = () => {
    return txnData.filter((t) => {
      const isFlagged = flaggedTransactions.has(t.id);
      const effectiveStatus = isFlagged ? "flagged" : t.status;
      if (txnActiveStatusChip !== "all" && effectiveStatus !== txnActiveStatusChip) return false;
      if (txnActiveTypeChip !== "all" && t.type !== txnActiveTypeChip) return false;
      const s = search.toLowerCase();
      if (s && !t.sender.toLowerCase().includes(s) && !t.receiver.toLowerCase().includes(s) && !t.id.toLowerCase().includes(s)) return false;
      return true;
    });
  };

  const filtered = getFilteredTxns();
  const totalAmt = txnData.reduce((a, t) => a + t.amount, 0);
  const completedCount = txnData.filter((t) => t.status === "completed").length;
  const blockedFlaggedCount = txnData.filter((t) => t.status === "blocked" || flaggedTransactions.has(t.id)).length;

  const typeColor = (type: string) =>
    ({ transfer: "var(--accent)", deposit: "var(--accent-3)", withdrawal: "var(--accent-warn)" }[type] || "var(--text-secondary)");

  const selectedTxn = txnData.find(t => t.id === selectedTxnId);
  const isSelectedFlagged = selectedTxn ? flaggedTransactions.has(selectedTxn.id) : false;

  const toggleFlagTxn = (id: string) => {
    setFlaggedTransactions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // showToast("Flag removed", "success");
      } else {
        next.add(id);
        // showToast("Transaction flagged for review", "warn");
      }
      return next;
    });
    setSelectedTxnId(null);
  };

  return (
    <>
      <div className="fade-up">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h1 className="page-title">Transactions</h1>
              <p className="page-subtitle">Ledger · Payments · {txnData.length} records today</p>
            </div>
            <button className="btn btn-ghost">Export ↗</button>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: "16px" }}>
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "6px" }}>TOTAL VOLUME</div>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-3)" }}>
              ${totalAmt.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "6px" }}>COMPLETED</div>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>
              {completedCount} / {txnData.length}
            </div>
          </div>
          <div className="card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "6px" }}>BLOCKED / FLAGGED</div>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent-danger)" }}>
              {blockedFlaggedCount}
            </div>
          </div>
        </div>

        {/* MODERN FILTER HEADER */}
        <div className="modern-filter-header">
          <div className="modern-search-wrap">
            <svg className="modern-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search by name, ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-chips-area">
            {/* Group 1: Status */}
            <div className="filter-chip-group">
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Status</span>
              <button className={`filter-chip ${txnActiveStatusChip === 'all' ? 'active' : ''}`} onClick={() => setTxnActiveStatusChip('all')}>All</button>
              <button className={`filter-chip ${txnActiveStatusChip === 'completed' ? 'active' : ''}`} onClick={() => setTxnActiveStatusChip('completed')}><span className="chip-dot" style={{ background: "#059669" }}></span>Completed</button>
              <button className={`filter-chip ${txnActiveStatusChip === 'pending' ? 'active' : ''}`} onClick={() => setTxnActiveStatusChip('pending')}><span className="chip-dot" style={{ background: "#d97706" }}></span>Pending</button>
              <button className={`filter-chip ${txnActiveStatusChip === 'flagged' ? 'active' : ''}`} onClick={() => setTxnActiveStatusChip('flagged')}><span className="chip-dot" style={{ background: "#dc2626" }}></span>Flagged</button>
              <button className={`filter-chip ${txnActiveStatusChip === 'blocked' ? 'active' : ''}`} onClick={() => setTxnActiveStatusChip('blocked')}><span className="chip-dot" style={{ background: "#dc2626" }}></span>Blocked</button>
            </div>
            {/* Separator */}
            <div className="filter-chip-separator"></div>
            {/* Group 2: Type */}
            <div className="filter-chip-group">
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap" }}>Type</span>
              <button className={`filter-chip ${txnActiveTypeChip === 'all' ? 'active' : ''}`} onClick={() => setTxnActiveTypeChip('all')}>All</button>
              <button className={`filter-chip ${txnActiveTypeChip === 'transfer' ? 'active' : ''}`} onClick={() => setTxnActiveTypeChip('transfer')}>Transfer</button>
              <button className={`filter-chip ${txnActiveTypeChip === 'deposit' ? 'active' : ''}`} onClick={() => setTxnActiveTypeChip('deposit')}>Deposit</button>
              <button className={`filter-chip ${txnActiveTypeChip === 'withdrawal' ? 'active' : ''}`} onClick={() => setTxnActiveTypeChip('withdrawal')}>Withdrawal</button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="modern-table-card desktop-table">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>TXN ID</th><th>SENDER → RECEIVER</th><th>AMOUNT</th><th>STATUS</th><th>TYPE</th><th>DATE & TIME</th><th>DEVICE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>No transactions match filters</td></tr>
                ) : (
                  filtered.map(t => {
                    const flagged = flaggedTransactions.has(t.id);
                    const tc = typeColor(t.type);
                    return (
                      <tr key={t.id} onClick={() => setSelectedTxnId(t.id)}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>{t.id}</td>
                        <td><div style={{ fontSize: "13px", fontWeight: 600 }}>{t.sender}</div><div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>→ {t.receiver}</div></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "13.5px" }}>${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td>{statusBadge(flagged ? "flagged" : t.status)}</td>
                        <td><span className="badge" style={{ background: `${tc}14`, color: tc }}>{t.type.toUpperCase()}</span></td>
                        <td style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{t.date}</td>
                        <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{t.device}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="mobile-card-list mobile-card-container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>No transactions match filters</div>
          ) : (
            filtered.map(t => {
              const flagged = flaggedTransactions.has(t.id);
              const tc = typeColor(t.type);
              return (
                <div key={t.id} className="mobile-card-item" onClick={() => setSelectedTxnId(t.id)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>{t.id}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {statusBadge(flagged ? "flagged" : t.status)}
                      <span className="badge" style={{ background: `${tc}14`, color: tc }}>{t.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{t.sender}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>→ {t.receiver}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                      ${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{t.date} · {t.device}</div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {selectedTxn && (
        <div id="modal-overlay" className="open" onClick={() => setSelectedTxnId(null)}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "4px" }}>TRANSACTION ID</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{selectedTxn.id}</div>
                </div>
                {statusBadge(isSelectedFlagged ? "flagged" : selectedTxn.status)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", gridColumn: "span 2" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>FROM</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{selectedTxn.sender}</div>
                    </div>
                    <div style={{ color: "var(--accent-3)", fontSize: "20px" }}>→</div>
                    <div style={{ flex: 1, textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>TO</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{selectedTxn.receiver}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>AMOUNT</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>${selectedTxn.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>FEE</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>${selectedTxn.fee.toFixed(2)}</div>
                </div>
              </div>
              <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "16px" }}>
                {[
                  ["Date & Time", selectedTxn.date],
                  ["Type", selectedTxn.type.toUpperCase()],
                  ["Method", selectedTxn.method],
                  ["Device", selectedTxn.device],
                  ["IP Address", selectedTxn.ip],
                ].map(([k, v], idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: idx !== 4 ? "1px solid var(--border)" : "none", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{k}</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  className={`btn ${isSelectedFlagged ? "btn-ghost" : "btn-danger"}`}
                  onClick={() => toggleFlagTxn(selectedTxn.id)}
                  style={{ justifyContent: "center" }}
                >
                  {isSelectedFlagged ? "✓ Remove Flag" : "⚠ Flag Transaction"}
                </button>
                <button className="btn btn-ghost" onClick={() => setSelectedTxnId(null)} style={{ justifyContent: "center" }}>Close</button>
              </div>
            </div>
            <button onClick={() => setSelectedTxnId(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionsAdminPage;
