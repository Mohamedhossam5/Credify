import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Loader2 } from 'lucide-react';

// ── TRANSACTIONS DATA ──
interface TransactionRecord {
  id: number;
  sender_id: number;
  sender_account_id: string;
  type: string;
  amount: number | string;
  fee: number | string;
  currency: string;
  status: string;
  recipient_name: string;
  recipient_account: string;
  recipient_bank?: string;
  swift_code?: string;
  recipient_address?: string;
  reference?: string;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_email?: string;
}

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
  return <span className={`badge ${map[status.toLowerCase()] || "badge-gray"}`}>{status.toUpperCase()}</span>;
};

const TransactionsAdminPage: React.FC = () => {
  const { data: txnDataRaw, isLoading: loading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/transactions?global=true');
      return (data.transactions || []) as TransactionRecord[];
    },
  });

  const txnData = txnDataRaw ?? [];

  const [txnActiveStatusChip, setTxnActiveStatusChip] = useState("all");
  const [txnActiveTypeChip, setTxnActiveTypeChip] = useState("all");
  const [search, setSearch] = useState("");
  const [flaggedTransactions, setFlaggedTransactions] = useState<Set<number>>(new Set());
  const [selectedTxnId, setSelectedTxnId] = useState<number | null>(null);

  const getFilteredTxns = () => {
    return txnData.filter((t) => {
      const isFlagged = flaggedTransactions.has(t.id);
      const effectiveStatus = isFlagged ? "flagged" : "completed"; // Mock status to completed unless flagged
      if (txnActiveStatusChip !== "all" && effectiveStatus !== txnActiveStatusChip) return false;
      
      // We'll normalize type to handle SAME_BANK, EXTERNAL etc.
      const normalizedType = t.type.toLowerCase().includes('deposit') ? 'deposit' : t.type.toLowerCase().includes('withdraw') ? 'withdrawal' : 'transfer';
      if (txnActiveTypeChip !== "all" && normalizedType !== txnActiveTypeChip) return false;
      
      const s = search.toLowerCase();
      const senderName = `${t.sender_first_name} ${t.sender_last_name}`.toLowerCase();
      if (s && !senderName.includes(s) && !t.recipient_name.toLowerCase().includes(s) && !t.id.toString().includes(s)) return false;
      return true;
    });
  };

  const filtered = getFilteredTxns();
  const totalAmt = txnData.reduce((a, t) => a + parseFloat(t.amount.toString()), 0);
  const completedCount = txnData.length; // all successful in backend so far
  const blockedFlaggedCount = flaggedTransactions.size;

  const typeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('deposit')) return "var(--accent-3)";
    if (t.includes('withdraw')) return "var(--accent-warn)";
    return "var(--accent)";
  };

  const selectedTxn = txnData.find(t => t.id === selectedTxnId);
  const isSelectedFlagged = selectedTxn ? flaggedTransactions.has(selectedTxn.id) : false;

  const toggleFlagTxn = (id: number) => {
    setFlaggedTransactions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedTxnId(null);
  };

  if (loading) {
    return (
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <>
      <div className="fade-up">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h1 className="page-title">Transactions</h1>
              <p className="page-subtitle">Ledger · Payments · {txnData.length} records</p>
            </div>
            <button className="btn btn-ghost">Export ↗</button>
          </div>
        </div>

        <div className="txn-stats-grid" style={{ marginBottom: "12px" }}>
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
              <button className={`filter-chip ${txnActiveStatusChip === 'flagged' ? 'active' : ''}`} onClick={() => setTxnActiveStatusChip('flagged')}><span className="chip-dot" style={{ background: "#dc2626" }}></span>Flagged</button>
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
                  <th>TXN ID</th><th>SENDER → RECEIVER</th><th>AMOUNT</th><th>STATUS</th><th>TYPE</th><th>DATE & TIME</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>No transactions match filters</td></tr>
                ) : (
                  filtered.map(t => {
                    const flagged = flaggedTransactions.has(t.id);
                    const tc = typeColor(t.type);
                    const senderName = `${t.sender_first_name} ${t.sender_last_name}`;
                    return (
                      <tr key={t.id} onClick={() => setSelectedTxnId(t.id)}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>TXN-{t.id}</td>
                        <td><div style={{ fontSize: "13px", fontWeight: 600 }}>{senderName}</div><div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>→ {t.recipient_name}</div></td>
                        <td style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "13.5px" }}>${parseFloat(t.amount.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td>{statusBadge(flagged ? "flagged" : "completed")}</td>
                        <td><span className="badge" style={{ background: `${tc}14`, color: tc }}>{t.type.replace(/_/g, ' ').toUpperCase()}</span></td>
                        <td style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{new Date(t.created_at).toLocaleString()}</td>
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
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)" }}>
              No transactions match filters
            </div>
          ) : (
            filtered.map(t => {
              const flagged = flaggedTransactions.has(t.id);
              const tc = typeColor(t.type);
              const senderName = `${t.sender_first_name} ${t.sender_last_name}`;
              return (
                <div key={t.id} className="txn-mobile-card" onClick={() => setSelectedTxnId(t.id)}>
                  <div className="card-top">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>TXN-{t.id}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {statusBadge(flagged ? "flagged" : "completed")}
                      <span className="badge" style={{ background: `${tc}14`, color: tc }}>{t.type.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="card-mid">
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{senderName}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>→ {t.recipient_name}</div>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {new Date(t.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <div className="card-bottom">
                    <div>
                      <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "2px" }}>AMOUNT</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                        ${parseFloat(t.amount.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-details"
                        style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}
                        onClick={() => setSelectedTxnId(t.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
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
                  <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>TXN-{selectedTxn.id}</div>
                </div>
                {statusBadge(isSelectedFlagged ? "flagged" : "completed")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", gridColumn: "span 2" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>FROM</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{selectedTxn.sender_first_name} {selectedTxn.sender_last_name}</div>
                    </div>
                    <div style={{ color: "var(--accent-3)", fontSize: "20px" }}>→</div>
                    <div style={{ flex: 1, textAlign: "center", minWidth: "80px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>TO</div>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{selectedTxn.recipient_name}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>AMOUNT</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>${parseFloat(selectedTxn.amount.toString()).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                </div>
                <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>FEE</div>
                  <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "var(--font-mono)" }}>${parseFloat(selectedTxn.fee.toString()).toFixed(2)}</div>
                </div>
              </div>
              <div style={{ background: "var(--bg-base)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "16px" }}>
                {[
                  ["Date & Time", new Date(selectedTxn.created_at).toLocaleString()],
                  ["Type", selectedTxn.type.replace(/_/g, ' ').toUpperCase()],
                  ["Recipient Account", selectedTxn.recipient_account],
                  ["Recipient Bank", selectedTxn.recipient_bank || 'N/A'],
                  ["Swift Code", selectedTxn.swift_code || 'N/A'],
                ].map(([k, v], idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: idx !== 4 ? "1px solid var(--border)" : "none", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>{k}</span>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, fontFamily: "var(--font-mono)", maxWidth: "200px", wordBreak: "break-all", textAlign: "right" }}>{v}</span>
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
