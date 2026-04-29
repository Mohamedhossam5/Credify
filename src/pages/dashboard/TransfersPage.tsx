import React, { useState, useEffect } from 'react';

const formatCurrency = (n: number) => new Intl.NumberFormat("en-EG").format(n);

const initialCards = [
  { id: "c1", type: "PLATINUM", last4: "4587", balance: 47500, color: "#0F172A" },
  { id: "c2", type: "GOLD", last4: "3367", balance: 128000, color: "#92400E" },
  { id: "c3", type: "STANDARD", last4: "5520", balance: 21750, color: "#3730A3" },
];

const TransfersPage: React.FC = () => {
  const [cards, setCards] = useState(initialCards);
  const [selectedCardId, setSelectedCardId] = useState("c1");
  const [amount, setAmount] = useState<number>(0);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [note, setNote] = useState("");
  const [amountStr, setAmountStr] = useState("");

  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalProcessing, setIsModalProcessing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastBalance, setToastBalance] = useState("");

  const selectedCard = cards.find(c => c.id === selectedCardId)!;

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setAccount(formatted.substring(0, 19));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    const parsed = parseInt(val, 10) || 0;
    setAmount(parsed);
    setAmountStr(parsed > 0 ? formatCurrency(parsed) : "");

    // Animate display text using inline styles directly via ref or just let react render
    const el = document.getElementById("transfers-amount-display");
    if (el) {
      el.style.transition = "transform 0.2s, color 0.2s";
      el.style.transform = "scale(1.04)";
      setTimeout(() => (el.style.transform = "scale(1)"), 200);
    }
  };

  const isAmtValid = amount > 0 && amount <= selectedCard.balance;
  const isFormValid = name.length > 2 && account.replace(/\s/g, "").length === 16 && isAmtValid;

  const openTransferModal = () => {
    if (!isFormValid) return;
    setIsModalOpen(true);
    setStep(2);
  };

  const closeTransferModal = () => {
    setIsModalOpen(false);
    setIsModalProcessing(false);
    setStep(1);
  };

  const processTransferPayment = () => {
    setIsModalProcessing(true);
    setTimeout(() => {
      setIsModalProcessing(false);
      setIsModalOpen(false);
      setIsProcessing(true); // Full screen loading overlay

      setTimeout(() => {
        setIsProcessing(false);
        const newCards = cards.map(c =>
          c.id === selectedCardId ? { ...c, balance: c.balance - amount } : c
        );
        setCards(newCards);

        const newBalance = newCards.find(c => c.id === selectedCardId)!.balance;
        setToastBalance(`New Balance: ${formatCurrency(newBalance)} EGP`);
        setShowToast(true);
        setStep(4);

        setTimeout(() => {
          setShowToast(false);
          resetTransferApp();
        }, 3000);
      }, 2000);
    }, 700);
  };

  const resetTransferApp = () => {
    setName("");
    setAccount("");
    setNote("");
    setAmountStr("");
    setAmount(0);
    setStep(1);
  };

  const renderStepIcon = (id: number, label: string) => {
    let active = step === id;
    let done = id < step || step > 3;

    if (id === 3 && step > 3) {
      active = false;
      done = true;
    }

    let cStyle: React.CSSProperties = {
      width: '26px', height: '26px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700, fontFamily: '"Inter", sans-serif'
    };
    let lColor = "#94a3b8";

    if (done) {
      cStyle = { ...cStyle, background: '#10b981', color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' };
      lColor = "#10b981";
    } else if (active) {
      cStyle = { ...cStyle, background: '#1a6fff', color: 'white', boxShadow: '0 4px 12px rgba(26,111,255,0.35)' };
      lColor = "#1a6fff";
    } else {
      cStyle = { ...cStyle, background: '#e2e8f0', color: '#94a3b8' };
    }

    const content = done || (id === 1 && active)
      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
      : id.toString();

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={cStyle}>{content}</div>
        <span style={{ fontSize: '10px', fontWeight: 700, color: lColor, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: '"Inter", sans-serif' }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <section id="transfers" className="page active" style={{ display: 'flex' }}>
      {/* Success Toast */}
      {showToast && (
        <div id="success-toast-transfers" style={{ display: 'block' }}>
          <div style={{ background: '#fff', borderLeft: '4px solid #10b981', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px', animation: 'slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" fill="none" stroke="#059669" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <h4 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, color: '#0d1535', fontSize: '15px' }}>Transfer Successful</h4>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{toastBalance}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div id="loading-overlay-transfers">
          <div className="ring-spinner-wrap">
            <div className="ring-spinner">
              <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="26" cy="26" r="22" stroke="rgba(14,203,203,0.12)" strokeWidth="4" />
                <path d="M26 4 A22 22 0 0 1 48 26" stroke="url(#spinnerGrad)" strokeWidth="4" strokeLinecap="round" />
                <defs>
                  <linearGradient id="spinnerGrad" x1="26" y1="4" x2="48" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0ecbcb" />
                    <stop offset="100%" stopColor="#1a6fff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="ring-spinner-label">Processing Transfer...</span>
          </div>
        </div>
      )}

      {/* Transfer Review Modal */}
      {isModalOpen && (
        <div id="transfer-modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-inner" style={{ padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)' }}>

            {/* Processing overlay inside modal */}
            {isModalProcessing && (
              <div className="modal-processing-overlay active">
                <div className="ring-spinner" style={{ width: '44px', height: '44px' }}>
                  <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '44px', height: '44px' }}>
                    <circle cx="26" cy="26" r="22" stroke="rgba(14,203,203,0.15)" strokeWidth="4" />
                    <path d="M26 4 A22 22 0 0 1 48 26" stroke="url(#spinnerGrad2)" strokeWidth="4" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="spinnerGrad2" x1="26" y1="4" x2="48" y2="26" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0ecbcb" />
                        <stop offset="100%" stopColor="#1a6fff" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', fontWeight: 600, color: 'rgba(240, 244, 255, 0.75)', letterSpacing: '0.3px' }}>
                  Processing Transfer...
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
                Review Transfer
              </h3>
              <button onClick={closeTransferModal} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'rgba(0, 0, 0, 0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ background: 'var(--input-bg)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--glass-border)' }}>
              <div className="modal-summary-row"><span className="modal-summary-label">Recipient</span><span className="modal-summary-value">{name}</span></div>
              <div className="modal-summary-row"><span className="modal-summary-label">Account</span><span className="modal-summary-mono">{account}</span></div>
              <div className="modal-summary-row"><span className="modal-summary-label">From Card</span><span className="modal-summary-value">•••• {selectedCard.last4} — {selectedCard.type}</span></div>
              {note && <div className="modal-summary-row"><span className="modal-summary-label">Note</span><span className="modal-summary-value" style={{ fontStyle: 'italic', fontWeight: 500 }}>"{note}"</span></div>}
              <div className="modal-summary-row" style={{ paddingTop: '14px', borderTop: '1px solid var(--glass-border)', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Inter", sans-serif' }}>Total Sending</span>
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '22px', fontWeight: 900, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
                  {formatCurrency(amount)} <small style={{ fontSize: '11px', fontWeight: 600 }}>EGP</small>
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={processTransferPayment} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, var(--teal), var(--blue))', border: 'none', borderRadius: '14px', color: '#fff', fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(14, 203, 203, 0.3)' }}>
                Confirm &amp; Send
              </button>
              <button onClick={closeTransferModal} style={{ padding: '14px 20px', border: '1.5px solid var(--glass-border)', borderRadius: '14px', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: '"Inter", sans-serif' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Panel */}
      <div id="transfer-panel" className={isProcessing ? "processing-state" : ""} style={{ background: '#fff', borderRadius: '28px', padding: '28px', border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.05)' }}>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {renderStepIcon(1, "Details")}
            <div style={{ width: '48px', height: '2px', background: step > 1 ? '#1a6fff' : '#e2e8f0', margin: '0 4px' }}></div>
            {renderStepIcon(2, "Review")}
            <div style={{ width: '48px', height: '2px', background: step > 2 ? '#1a6fff' : '#e2e8f0', margin: '0 4px' }}></div>
            {renderStepIcon(3, "Done")}
          </div>
        </div>

        {/* Amount Display */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '6px', fontFamily: '"Inter", sans-serif' }}>
            Amount to Send
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <span id="transfers-amount-display" style={{ fontFamily: '"Inter", sans-serif', fontSize: '52px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums' }}>
              {amount > 0 ? formatCurrency(amount) : '0'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a6fff', marginLeft: '6px', marginTop: '8px', fontFamily: '"Inter", sans-serif' }}>EGP</span>
          </div>
        </div>

        {/* Card Carousel */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', textAlign: 'center', marginBottom: '14px', fontFamily: '"Inter", sans-serif' }}>
            Pay From
          </label>
          <div id="transfer-carousel-track" style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', padding: '6px 0' }}>
            {cards.map(card => {
              const isSelected = card.id === selectedCardId;
              let bgGradient = "";
              let glowColor = "";

              if (card.type === "PLATINUM") {
                bgGradient = "linear-gradient(120deg,#23272b 60%,#444 100%)";
                glowColor = "rgba(209,213,219,0.5)";
              } else if (card.type === "GOLD") {
                bgGradient = "linear-gradient(120deg,#bfa046 60%,#f5d67b 100%)";
                glowColor = "rgba(191,160,70,0.5)";
              } else {
                bgGradient = "linear-gradient(120deg,#6d28d9 60%,#a21caf 100%)";
                glowColor = "rgba(224,170,255,0.5)";
              }

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  style={{
                    width: '180px', height: '100px', borderRadius: '14px', padding: '12px 14px 10px', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: bgGradient, transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0,
                    ...(isSelected ? { transform: 'scale(1.06)', zIndex: 10, boxShadow: `0 0 28px ${glowColor},0 8px 28px rgba(0,0,0,0.3)` } : { opacity: 0.52, transform: 'scale(0.9)' })
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: '20px', height: '13px', borderRadius: '3px', background: 'linear-gradient(135deg,#f5d67b 0%,#d4af37 100%)', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}></div>
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', fontWeight: 800, letterSpacing: '1.5px', color: 'rgba(255,255,255,.9)' }}>CREDIFY</span>
                  </div>
                  <div>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '7px', letterSpacing: '.15em', color: 'rgba(255,255,255,.8)', fontVariantNumeric: 'tabular-nums' }}>
                      **** **** **** {card.last4}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: '"Inter", sans-serif' }}>Balance</div>
                      <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '9px', fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(card.balance)} EGP
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: '"Inter", sans-serif' }}>Type</div>
                      <div style={{ fontSize: '7px', fontWeight: 800, fontFamily: '"Inter", sans-serif', color: card.type === "GOLD" ? "#f5d67b" : card.type === "PLATINUM" ? "#d1d5db" : "#e0aaff" }}>
                        {card.type}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px', fontFamily: '"Inter", sans-serif' }}>Recipient Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="premium-input text-[var(--text-primary)]"
              style={{ width: '100%', borderRadius: '14px', padding: '13px 16px', fontSize: '14px', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}
              placeholder="e.g. Ahmed Nady"
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px', fontFamily: '"Inter", sans-serif' }}>Account Number</label>
            <input
              type="text"
              value={account}
              onChange={handleAccountChange}
              className="premium-input text-[var(--text-primary)]"
              style={{ width: '100%', borderRadius: '14px', padding: '13px 16px', fontSize: '14px', fontWeight: 600, fontFamily: '"DM Mono", monospace', fontVariantNumeric: 'tabular-nums' }}
              placeholder="1111 1111 1111 1111"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px', fontFamily: '"Inter", sans-serif' }}>Amount (EGP)</label>
            <input
              type="text"
              value={amountStr}
              onChange={handleAmountChange}
              className="premium-input text-[var(--text-primary)]"
              style={{ width: '100%', borderRadius: '14px', padding: '13px 16px', fontSize: '14px', fontWeight: 700, fontFamily: '"DM Mono", monospace', fontVariantNumeric: 'tabular-nums' }}
              placeholder="0.00"
            />
            {amount > selectedCard.balance && amount > 0 && (
              <p style={{ position: 'absolute', bottom: '-18px', left: '4px', fontSize: '10px', color: '#ef4444', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                Insufficient balance
              </p>
            )}
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px', fontFamily: '"Inter", sans-serif' }}>
              Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              id="tr-note"
              className="premium-input text-[var(--text-primary)]"
              style={{ width: '100%', borderRadius: '14px', padding: '13px 16px', fontSize: '14px', fontWeight: 500, fontFamily: '"Inter", sans-serif' }}
              placeholder="e.g. Rent payment"
            />
          </div>
        </div>

        <button
          onClick={openTransferModal}
          disabled={!isFormValid}
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, var(--teal), var(--blue))', border: 'none', borderRadius: '14px', color: '#fff', fontFamily: '"Inter", sans-serif', fontWeight: 700, fontSize: '14px', transition: 'all 0.25s', boxShadow: isFormValid ? '0 4px 20px rgba(14, 203, 203, 0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: isFormValid ? 1 : 0.45, cursor: isFormValid ? 'pointer' : 'not-allowed', letterSpacing: '-0.2px' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send Money
        </button>
      </div>
    </section>
  );
};

export default TransfersPage;
