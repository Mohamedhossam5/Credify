import React, { useState } from 'react';

type AccountType = 'current' | 'savings' | 'standard';

interface AccountDetail {
  iban: string;
  status: string;
  opened: string;
  type: string;
  balance: string;
  extra: { label: string; value: string } | null;
}

const accountDetails: Record<AccountType, AccountDetail> = {
  current: {
    iban: "EG80 0025 0000 0000 0001 2300 1",
    status: "Active",
    opened: "January 2022",
    type: "Current Account (Platinum)",
    balance: "47,500 EGP",
    extra: null,
  },
  savings: {
    iban: "EG80 0025 0000 0000 0005 7800 2",
    status: "Active",
    opened: "March 2020",
    type: "Savings Account (Gold)",
    balance: "128,000 EGP",
    extra: { label: "Interest Rate", value: "17.5% p.a." },
  },
  standard: {
    iban: "EG80 0025 0000 0000 0009 5520 3",
    status: "Active",
    opened: "June 2023",
    type: "Standard Account",
    balance: "23,750 EGP",
    extra: { label: "Card Limit", value: "15,000 EGP" },
  },
};

const AccountsPage: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);

  const selectAccount = (type: AccountType) => {
    if (selectedAccount === type) {
      setSelectedAccount(null);
    } else {
      setSelectedAccount(type);
    }
    setCopiedIban(null);
  };

  const copyIban = (iban: string, type: string) => {
    navigator.clipboard.writeText(iban.replace(/\s/g, "")).then(() => {
      setCopiedIban(type);
      setTimeout(() => {
        setCopiedIban(null);
      }, 2000);
    });
  };

  const d = selectedAccount ? accountDetails[selectedAccount] : null;

  return (
    <section id="accounts" className="page active" style={{ display: 'block' }}>
      <div className="section-title text-[var(--text-primary)]" style={{ marginBottom: '8px' }}>My Accounts</div>
      <div
        style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}
      >
        Click a card to view account details
      </div>
      <div
        style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}
        className="cards-row"
      >
        {/* Current Account Card */}
        <div
          className={`credit-card card-1 ${selectedAccount === 'current' ? 'acc-card-selected' : ''}`}
          id="acc-card-current"
          onClick={() => selectAccount('current')}
          style={{
            minWidth: '280px',
            height: '175px',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, outline 0.2s ease',
          }}
        >
          <div className="acc-active-dot"></div>
          <div
            className="card-deco"
            style={{ width: '220px', height: '220px', top: '-80px', right: '-60px', background: 'radial-gradient(circle, rgba(200, 210, 240, 0.1), transparent)' }}
          ></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="card-chip"><div className="card-chip-inner"></div></div>
            <div
              className="card-brand"
              style={{
                background: 'linear-gradient(90deg, #c0c0c0, #e8e8e8, #a0a0a0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CREDIFY
            </div>
          </div>
          <div
            style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: '10px 0 2px', fontFamily: '"Inter", sans-serif' }}
          >
            Current Account
          </div>
          <div className="card-number" style={{ margin: '0 0 12px' }}>
            **** **** **** 4587
          </div>
          <div className="card-footer">
            <div>
              <div className="card-expiry-label">Expires</div>
              <div className="card-expiry">09/28</div>
            </div>
          </div>
        </div>

        {/* Savings Account Card */}
        <div
          className={`credit-card card-2 ${selectedAccount === 'savings' ? 'acc-card-selected' : ''}`}
          id="acc-card-savings"
          onClick={() => selectAccount('savings')}
          style={{
            minWidth: '280px',
            height: '175px',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, outline 0.2s ease',
          }}
        >
          <div className="acc-active-dot"></div>
          <div
            className="card-deco"
            style={{ width: '220px', height: '220px', bottom: '-80px', right: '-60px', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2), transparent)' }}
          ></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              className="card-chip"
              style={{ background: 'linear-gradient(135deg, #5c3d00, #c8960c, #f0c040, #c8960c, #5c3d00)' }}
            >
              <div className="card-chip-inner" style={{ borderColor: 'rgba(0, 0, 0, 0.2)' }}></div>
            </div>
            <div
              className="card-brand"
              style={{
                background: 'linear-gradient(90deg, #f0c040, #d4af37, #f0c040)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CREDIFY
            </div>
          </div>
          <div
            style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: '10px 0 2px', fontFamily: '"Inter", sans-serif' }}
          >
            Savings Account
          </div>
          <div className="card-number" style={{ margin: '0 0 12px' }}>
            **** **** **** 3367
          </div>
          <div className="card-footer">
            <div>
              <div className="card-expiry-label">Expires</div>
              <div className="card-expiry">03/27</div>
            </div>
          </div>
        </div>

        {/* Standard Account Card */}
        <div
          className={`credit-card card-3 ${selectedAccount === 'standard' ? 'acc-card-selected' : ''}`}
          id="acc-card-standard"
          onClick={() => selectAccount('standard')}
          style={{
            minWidth: '280px',
            height: '175px',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, outline 0.2s ease',
          }}
        >
          <div className="acc-active-dot"></div>
          <div
            className="card-deco"
            style={{ width: '200px', height: '200px', top: '-60px', right: '-50px', background: 'radial-gradient(circle, rgba(160, 0, 255, 0.25), transparent)' }}
          ></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              className="card-chip"
              style={{ background: 'linear-gradient(135deg, #6a6a6a, #c0c0c0, #6a6a6a)' }}
            >
              <div className="card-chip-inner"></div>
            </div>
            <div
              className="card-brand"
              style={{
                background: 'linear-gradient(90deg, #d080ff, #a020f0, #e060ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CREDIFY
            </div>
          </div>
          <div
            style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px', margin: '10px 0 2px', fontFamily: '"Inter", sans-serif' }}
          >
            Standard Account
          </div>
          <div className="card-number" style={{ margin: '0 0 12px' }}>
            **** **** **** 5520
          </div>
          <div className="card-footer">
            <div>
              <div className="card-expiry-label">Expires</div>
              <div className="card-expiry">11/26</div>
            </div>
          </div>
        </div>
      </div>

      <div id="account-details-panel" className={`glass-card ${selectedAccount ? 'open' : ''}`}>
        <div className="details-inner" id="account-details-inner">
          {d && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>{d.type}</div>
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>{d.balance}</div>
                </div>
                <span className="badge badge-active" style={{ fontSize: '13px', padding: '6px 14px' }}>● {d.status}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>IBAN</div>
                <div className="iban-row">
                  <span className="iban-text text-[var(--text-primary)]">{d.iban}</span>
                  <button
                    className={`copy-btn ${copiedIban === selectedAccount ? 'copied' : ''}`}
                    id={`copy-btn-${selectedAccount}`}
                    onClick={() => copyIban(d.iban, selectedAccount)}
                  >
                    {copiedIban === selectedAccount ? (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> Copied!
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontFamily: '"Inter", sans-serif' }}>Opened</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', fontFamily: '"Inter", sans-serif', color: 'var(--text-primary)' }}>{d.opened}</div>
                </div>
                {d.extra && (
                  <div style={{ background: 'rgba(14,203,203,.06)', border: '1px solid rgba(14,203,203,.15)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontFamily: '"Inter", sans-serif' }}>{d.extra.label}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--teal)', fontFamily: '"Inter", sans-serif', fontVariantNumeric: 'tabular-nums' }}>{d.extra.value}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AccountsPage;
