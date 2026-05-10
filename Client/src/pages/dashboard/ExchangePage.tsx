import React, { useState, useEffect, useRef } from 'react';

const fxCurrencies = [
  { iso: "us", code: "USD", name: "US Dollar", rate: 50.75, change: +0.35 },
  { iso: "eu", code: "EUR", name: "Euro", rate: 54.2, change: -0.15 },
  { iso: "sa", code: "SAR", name: "Saudi Riyal", rate: 13.53, change: +0.02 },
  { iso: "gb", code: "GBP", name: "British Pound", rate: 63.9, change: +0.8 },
  { iso: "ae", code: "AED", name: "UAE Dirham", rate: 13.82, change: +0.05 },
  { iso: "cn", code: "CNY", name: "Chinese Yuan", rate: 6.98, change: -0.03 },
  { iso: "jp", code: "JPY", name: "Japanese Yen", rate: 0.34, change: -0.01 },
  { iso: "ch", code: "CHF", name: "Swiss Franc", rate: 57.2, change: +0.22 },
  { iso: "ca", code: "CAD", name: "Canadian Dollar", rate: 37.2, change: +0.11 },
  { iso: "au", code: "AUD", name: "Australian Dollar", rate: 32.5, change: -0.08 },
  { iso: "no", code: "NOK", name: "Norwegian Krone", rate: 4.8, change: +0.03 },
  { iso: "se", code: "SEK", name: "Swedish Krona", rate: 4.9, change: +0.02 },
  { iso: "dk", code: "DKK", name: "Danish Krone", rate: 7.25, change: +0.04 },
  { iso: "sg", code: "SGD", name: "Singapore Dollar", rate: 37.8, change: +0.14 },
  { iso: "hk", code: "HKD", name: "Hong Kong Dollar", rate: 6.5, change: +0.02 },
  { iso: "kw", code: "KWD", name: "Kuwaiti Dinar", rate: 165.0, change: +1.2 },
  { iso: "bh", code: "BHD", name: "Bahraini Dinar", rate: 134.0, change: +0.5 },
  { iso: "om", code: "OMR", name: "Omani Rial", rate: 131.8, change: +0.3 },
  { iso: "qa", code: "QAR", name: "Qatari Riyal", rate: 13.93, change: +0.05 },
  { iso: "jo", code: "JOD", name: "Jordanian Dinar", rate: 71.5, change: +0.1 },
  { iso: "ma", code: "MAD", name: "Moroccan Dirham", rate: 5.05, change: -0.02 },
  { iso: "tn", code: "TND", name: "Tunisian Dinar", rate: 16.3, change: -0.05 },
  { iso: "tr", code: "TRY", name: "Turkish Lira", rate: 1.55, change: -0.03 },
  { iso: "in", code: "INR", name: "Indian Rupee", rate: 0.61, change: +0.01 },
  { iso: "pk", code: "PKR", name: "Pakistani Rupee", rate: 0.18, change: -0.01 },
  { iso: "br", code: "BRL", name: "Brazilian Real", rate: 9.9, change: -0.12 },
  { iso: "mx", code: "MXN", name: "Mexican Peso", rate: 2.7, change: -0.04 },
  { iso: "za", code: "ZAR", name: "South African Rand", rate: 2.75, change: +0.06 },
  { iso: "ng", code: "NGN", name: "Nigerian Naira", rate: 0.032, change: -0.001 },
  { iso: "ke", code: "KES", name: "Kenyan Shilling", rate: 0.39, change: +0.01 },
  { iso: "il", code: "ILS", name: "Israeli Shekel", rate: 13.8, change: +0.15 },
  { iso: "nz", code: "NZD", name: "New Zealand Dollar", rate: 30.2, change: -0.05 },
  { iso: "kr", code: "KRW", name: "South Korean Won", rate: 0.037, change: 0 },
  { iso: "th", code: "THB", name: "Thai Baht", rate: 1.48, change: +0.02 },
  { iso: "my", code: "MYR", name: "Malaysian Ringgit", rate: 11.4, change: +0.08 },
  { iso: "ru", code: "RUB", name: "Russian Ruble", rate: 0.56, change: -0.02 },
  { iso: "pl", code: "PLN", name: "Polish Zloty", rate: 12.6, change: +0.08 },
  { iso: "ar", code: "ARS", name: "Argentine Peso", rate: 0.055, change: -0.005 },
];

const colors = [
  "rgba(0,122,255,0.2):#7ab8ff",
  "rgba(0,50,200,0.2):#9bb5ff",
  "rgba(0,160,90,0.2):#7defa8",
  "rgba(255,200,0,0.15):#ffe080",
  "rgba(14,203,203,0.15):var(--teal)",
  "rgba(255,100,50,0.15):#ffa07a",
];

const bgColors = [
  "rgba(0,122,255,0.08)",
  "rgba(0,50,200,0.08)",
  "rgba(0,160,90,0.06)",
  "rgba(255,200,0,0.05)",
  "rgba(14,203,203,0.05)",
  "rgba(255,100,50,0.05)",
];

const ExchangePage: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [selectedFxCode, setSelectedFxCode] = useState<string>('USD');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedFx = fxCurrencies.find(c => c.code === selectedFxCode) || fxCurrencies[0];

  const filteredCurrencies = fxCurrencies.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isDropdownOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    triggerUpdateAnimation();
  };

  const handleSelectFx = (code: string) => {
    setSelectedFxCode(code);
    setIsDropdownOpen(false);
    setSearchQuery('');
    triggerUpdateAnimation();
  };

  const triggerUpdateAnimation = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 150);
  };

  const calculateResult = () => {
    const amt = parseFloat(amount) || 0;
    if (amt > 0) {
      return (amt * selectedFx.rate).toLocaleString("en-EG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "—";
  };

  const topCards = fxCurrencies.slice(0, 6);

  return (
    <section id="exchange" className="page active" style={{ display: 'block' }}>
      <div className="section-header" style={{ marginBottom: '8px' }}>
        <div className="section-title text-[var(--text-primary)]">Exchange Rates</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--teal)', fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Live — Updated just now
        </div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px', fontFamily: '"Inter", sans-serif' }}>
        All rates shown against Egyptian Pound (EGP)
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }} id="fx-cards-grid">
        {topCards.map((c, i) => {
          const [borderColor, rateColor] = colors[i].split(":");
          const bgColor = bgColors[i];
          const isPositive = c.change >= 0;
          const changeColor = isPositive ? "var(--success)" : "var(--danger)";
          const changePrefix = isPositive ? "+" : "";

          return (
            <div key={c.code} className="fx-card" style={{ borderColor }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: bgColor }}></div>
              <div className="fx-card-header">
                <div className="fx-flag-img-lg" style={{ borderColor }}>
                  <img src={`https://flagcdn.com/w80/${c.iso}.png`} alt={c.code} loading="lazy" />
                </div>
                <div>
                  <div className="text-[var(--text-primary)]" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px' }}>{c.code}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif' }}>{c.name}</div>
                </div>
              </div>
              <div className="fx-card-label">1 {c.code} =</div>
              <div className="fx-card-rate" style={{ color: rateColor }}>
                {c.rate.toFixed(2)}<span> EGP</span>
              </div>
              <div className="fx-card-change" style={{ color: changeColor }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  {isPositive ? (
                    <path d="M18 15l-6-6-6 6" />
                  ) : (
                    <path d="M6 9l6 6 6-6" />
                  )}
                </svg>
                {changePrefix}{Math.abs(c.change).toFixed(2)} today
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: '28px', maxWidth: '560px' }}>
        <div className="section-title text-[var(--text-primary)]" style={{ marginBottom: '20px', fontSize: '16px' }}>Quick Converter</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-slate-500 dark:text-slate-400 mb-[8px] font-['Inter',sans-serif]">Amount</label>
            <input
              type="number"
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-[16px] py-[13px] text-[var(--text-primary)] text-[14px] outline-none transition-all duration-[250ms] focus:border-[var(--teal)] focus:shadow-[0_0_0_3px_rgba(14,203,203,0.12),0_0_16px_rgba(14,203,203,0.06)] focus:bg-[rgba(14,203,203,0.04)]"
              id="conv-amount"
              placeholder="100"
              value={amount}
              onChange={handleAmountChange}
              style={{ fontFamily: '"DM Mono", monospace', fontVariantNumeric: 'tabular-nums' }}
            />
          </div>
          <div style={{ paddingBottom: '1px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(14, 203, 203, 0.1)', border: '1px solid rgba(14, 203, 203, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.8px] text-slate-500 dark:text-slate-400 mb-[8px] font-['Inter',sans-serif]">Currency</label>
            <div className="fx-select-wrapper" ref={dropdownRef}>
              <div
                className={`fx-select-trigger ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="fx-flag-trigger">
                  <img src={`https://flagcdn.com/w40/${selectedFx.iso}.png`} alt={selectedFx.code} />
                </div>
                <span>{selectedFx.code} → EGP</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="fx-dropdown">
                  <div className="fx-search-wrap" style={{ position: 'relative' }}>
                    <svg className="fx-search-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      className="fx-search"
                      placeholder="Search currency..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="fx-options-list">
                    {filteredCurrencies.map(c => (
                      <div
                        key={c.code}
                        className={`fx-option ${c.code === selectedFxCode ? 'selected' : ''}`}
                        onClick={() => handleSelectFx(c.code)}
                      >
                        <div className="fx-flag-img">
                          <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.code} loading="lazy" />
                        </div>
                        <span className="fx-code">{c.code}</span>
                        <span className="fx-name">{c.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: '"DM Mono", monospace', fontVariantNumeric: 'tabular-nums' }}>
                          {c.rate.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(14, 203, 203, 0.06)', borderRadius: '14px', border: '1px solid rgba(14, 203, 203, 0.12)', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', fontFamily: '"Inter", sans-serif' }}>Result</div>
          <div
            className={`conv-result-num ${isUpdating ? 'updating' : ''}`}
            style={{ fontFamily: '"Inter", sans-serif', fontSize: '32px', fontWeight: 900, color: 'var(--teal)', letterSpacing: '-1px' }}
          >
            {parseFloat(amount) > 0 ? calculateResult() : '—'} EGP
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExchangePage;
