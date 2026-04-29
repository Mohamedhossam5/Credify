import React, { useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import type { Payment } from '../../hooks/useTransactions';

const dateLabels: Record<string, string> = {
  "21 Apr 2026": "Today",
  "20 Apr 2026": "Yesterday",
};

const Transactions: React.FC = () => {
  const { history, txFilter, setTxFilter, txSearchQuery, setTxSearchQuery } = useTransactions();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxSearchQuery(e.target.value);
  };

  const groupedHistory = useMemo(() => {
    const groups: Record<string, Payment[]> = {};
    history.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [history]);

  return (
    <section id="transactions" className="page active">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div className="section-title text-[var(--text-primary)]">Transaction History</div>
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-input text-[var(--text-primary)]"
            placeholder="Search transactions..."
            id="txSearch"
            value={txSearchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className={`filter-tab ${txFilter === 'all' ? 'active' : ''}`} onClick={() => setTxFilter('all')}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          All
        </div>
        <div className={`filter-tab ${txFilter === 'sent' ? 'active' : ''}`} onClick={() => setTxFilter('sent')}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7" /></svg>
          Sent
        </div>
        <div className={`filter-tab ${txFilter === 'received' ? 'active' : ''}`} onClick={() => setTxFilter('received')}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7" /></svg>
          Received
        </div>
        <div className={`filter-tab ${txFilter === 'pending' ? 'active' : ''}`} onClick={() => setTxFilter('pending')}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          Pending
        </div>
      </div>

      <div id="tx-list">
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif', fontSize: '15px' }}>
            No transactions found
          </div>
        ) : (
          <div className="tx-container">
            {Object.entries(groupedHistory).map(([date, txs], groupIndex) => {
              const label = dateLabels[date] || date;
              return (
                <React.Fragment key={date}>
                  <div className="tx-date-group-header">
                    <span className="tx-date-label">{label}</span>
                    <div className="tx-date-line"></div>
                    <span className="tx-date-count">{txs.length} txn{txs.length > 1 ? 's' : ''}</span>
                  </div>
                  {txs.map((tx, txIndex) => {
                    const amtClass = tx.status === "received" ? "positive" : tx.status === "pending" ? "pending-amount" : "negative";
                    const badgeClass = tx.status === "received" ? "badge-success" : tx.status === "pending" ? "badge-warning" : "badge-danger";
                    const delay = (groupIndex * txs.length + txIndex) * 45;
                    return (
                      <div className="tx-card" style={{ animationDelay: `${delay}ms` }} key={tx.id}>
                        <div className="tx-avatar" style={{ background: tx.color }}>{tx.initials}</div>
                        <div className="tx-info">
                          <div className="tx-name text-[var(--text-primary)]">{tx.name}</div>
                          <div className="tx-meta">
                            <span>{tx.time}</span>
                            <span className="tx-meta-dot"></span>
                            <span>{tx.desc}</span>
                          </div>
                        </div>
                        <div className="tx-right">
                          <div className={`tx-amount ${amtClass}`}>{tx.amount}</div>
                          <span className={`badge ${badgeClass}`}>● {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Transactions;
