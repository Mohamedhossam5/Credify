import React, { useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import type { Payment } from '../../hooks/useTransactions';

const Transactions: React.FC = () => {
  const { 
    history, 
    isLoadingHistory, 
    txFilter, 
    setTxFilter,
    txCategory,
    setTxCategory, 
    txSearchQuery, 
    setTxSearchQuery 
  } = useTransactions();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTxSearchQuery(e.target.value);
  };

  // Group transactions by date
  const groupedHistory = useMemo(() => {
    const groups: Record<string, Payment[]> = {};
    history.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [history]);

  // Determine date labels (Today, Yesterday, or the actual date)
  const getDateLabel = (dateStr: string): string => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const yesterdayStr = yesterday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return dateStr;
  };

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className={`filter-tab ${txFilter === 'all' ? 'active' : ''}`} onClick={() => setTxFilter('all')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            All Status
          </div>
          <div className={`filter-tab ${txFilter === 'sent' ? 'active' : ''}`} onClick={() => setTxFilter('sent')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7-7 7 7" /></svg>
            Sent
          </div>
          <div className={`filter-tab ${txFilter === 'received' ? 'active' : ''}`} onClick={() => setTxFilter('received')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7 7 7-7" /></svg>
            Received
          </div>
        </div>

        {/* Category Dropdown */}
        <div style={{ position: 'relative' }}>
          <select 
            value={txCategory}
            onChange={(e) => setTxCategory(e.target.value as any)}
            style={{
              appearance: 'none',
              backgroundColor: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              padding: '10px 40px 10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            <option value="all" style={{ backgroundColor: 'var(--fx-dropdown-bg)', color: 'var(--text-primary)' }}>All Types</option>
            <option value="transfers" style={{ backgroundColor: 'var(--fx-dropdown-bg)', color: 'var(--text-primary)' }}>Transfers</option>
            <option value="bills" style={{ backgroundColor: 'var(--fx-dropdown-bg)', color: 'var(--text-primary)' }}>Bills</option>
            <option value="donations" style={{ backgroundColor: 'var(--fx-dropdown-bg)', color: 'var(--text-primary)' }}>Donations</option>
          </select>
          <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div id="tx-list">
        {isLoadingHistory ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={28} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif', fontSize: '14px' }}>Loading transactions...</span>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif', fontSize: '15px' }}>
            No transactions found
          </div>
        ) : (
          <div className="tx-container">
            {Object.entries(groupedHistory).map(([date, txs], groupIndex) => {
              const label = getDateLabel(date);
              return (
                <React.Fragment key={date}>
                  <div className="tx-date-group-header">
                    <span className="tx-date-label">{label}</span>
                    <div className="tx-date-line"></div>
                    <span className="tx-date-count">{txs.length} txn{txs.length > 1 ? 's' : ''}</span>
                  </div>
                  {txs.map((tx, txIndex) => {
                    const amtClass = tx.status === 'received' ? 'positive' : 'negative';
                    const badgeClass = tx.status === 'received' ? 'badge-success' : 'badge-danger';
                    const delay = (groupIndex * txs.length + txIndex) * 45;
                    return (
                      <div className="tx-card" style={{ animationDelay: `${delay}ms` }} key={tx.id}>
                        <div
                          className="tx-avatar"
                          style={{
                            background: tx.status === 'received'
                              ? 'linear-gradient(135deg, rgba(0,232,143,0.8), rgba(14,203,203,0.8))'
                              : 'linear-gradient(135deg, rgba(255,77,106,0.8), rgba(255,140,0,0.8))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          {tx.status === 'received'
                            ? <ArrowDownLeft size={16} style={{ color: '#fff' }} />
                            : <ArrowUpRight size={16} style={{ color: '#fff' }} />
                          }
                        </div>
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
