import React, { useState } from 'react';

// ── KYC DATA ──
type KYCUser = {
  id: string;
  accId: string;
  name: string;
  email: string;
  submittedAt: string;
  docType: string;
  selfieUrl: string;
};

const initialKycPending: KYCUser[] = [
  {
    id: "KYC-001", accId: "ACC011", name: "Badawy", email: "badawy12@gmail.com",
    submittedAt: "Today, 09:14 AM", docType: "National ID",
    selfieUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Lucas&backgroundColor=b6e3f4",
  },
  {
    id: "KYC-002", accId: "ACC012", name: "Hoss", email: "hoss20@gmail.com",
    submittedAt: "Today, 08:42 AM", docType: "National ID",
    selfieUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Amara&backgroundColor=c0aede",
  },
  {
    id: "KYC-003", accId: "ACC013", name: "Makram", email: "makram11@gmail.net",
    submittedAt: "Yesterday, 11:58 PM", docType: "National ID",
    selfieUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Dmitri&backgroundColor=d1d4f9",
  },
  {
    id: "KYC-004", accId: "ACC014", name: "Nady", email: "nady13@gmail.com",
    submittedAt: "Yesterday, 04:22 PM", docType: "National ID",
    selfieUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Fatima&backgroundColor=ffd5dc",
  },
  {
    id: "KYC-005", accId: "ACC015", name: "Zed", email: "zed233@gmail.co",
    submittedAt: "Yesterday, 02:10 PM", docType: "National ID",
    selfieUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Kenji&backgroundColor=b6e3f4",
  },
];

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const getKycGradient = (id: string) => {
  const gradients = [
    "135deg,#7c3aed,#2563eb",
    "135deg,#059669,#0891b2",
    "135deg,#d97706,#dc2626",
    "135deg,#7c3aed,#ec4899",
    "135deg,#2563eb,#06b6d4",
  ];
  return gradients[id.charCodeAt(id.length - 1) % gradients.length];
};

const KYCPage: React.FC = () => {
  const [kycPending, setKycPending] = useState<KYCUser[]>(initialKycPending);
  const [openRejectId, setOpenRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string, label: string } | null>(null);

  const count = kycPending.length;

  const handleApprove = (id: string, name: string) => {
    setKycPending(prev => prev.filter(u => u.id !== id));
    // showToast(`✓ KYC approved: ${name} — status set to Verified`, "success");
  };

  const handleReject = (id: string, name: string) => {
    if (!rejectReason.trim()) {
      // showToast("Please enter a rejection reason", "warn");
      return;
    }
    setKycPending(prev => prev.filter(u => u.id !== id));
    // showToast(`✗ KYC rejected: ${name} — "${rejectReason}"`, "warn");
    setOpenRejectId(null);
    setRejectReason("");
  };

  const toggleRejectArea = (id: string) => {
    if (openRejectId === id) {
      setOpenRejectId(null);
      setRejectReason("");
    } else {
      setOpenRejectId(id);
      setRejectReason("");
    }
  };

  return (
    <>
      <div className="fade-up">
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 className="page-title">KYC Verification</h1>
              <p className="page-subtitle">Identity Review · Document Approval · {count} pending submission{count !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>REVIEW CAREFULLY</span>
              <span className="badge badge-yellow">{count} PENDING</span>
            </div>
          </div>
        </div>

        {count === 0 ? (
          <div className="card">
            <div className="kyc-empty">
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--bg-base)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><polyline points="16 11 17.5 12.5 21 9" /></svg>
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>All caught up</div>
              <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>No pending KYC submissions at this time.</div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop layout */}
            <div className="desktop-table" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
              <div className="kyc-desktop-header">
                <div></div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" }}>Applicant</div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" }}>Selfie</div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" }}>ID Doc</div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" }}>Submission</div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase" }}>Status</div>
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", textTransform: "uppercase", textAlign: "right" }}>Actions</div>
              </div>
              <div id="kyc-list">
                {kycPending.map(u => {
                  const init = initials(u.name);
                  const grad = getKycGradient(u.id);
                  const isRejectOpen = openRejectId === u.id;
                  
                  return (
                    <div key={u.id} id={`kyc-card-${u.id}`}>
                      <div className="kyc-row kyc-desktop-row">
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(${grad})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{init}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
                        </div>
                        <div>
                          <div className="kyc-thumb" onClick={() => setPreviewImage({ url: u.selfieUrl, label: `Selfie Photo — ${u.name}` })} title="Preview selfie">
                            <img src={u.selfieUrl} alt="Selfie" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                            <div className="kyc-thumb-placeholder" style={{ display: "none" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" /></svg>
                            </div>
                            <span className="kyc-thumb-label">Selfie</span>
                          </div>
                        </div>
                        <div>
                          <div className="kyc-thumb" style={{ cursor: "pointer" }}>
                            <div className="kyc-thumb-placeholder">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M12 9h5M12 13h3" /></svg>
                            </div>
                            <span className="kyc-thumb-label">ID</span>
                          </div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.id}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.submittedAt}</div>
                        </div>
                        <div>
                          <span className="badge badge-yellow" style={{ fontSize: "10.5px" }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            PENDING
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                          <button className="kyc-action-btn kyc-btn-approve" onClick={() => handleApprove(u.id, u.name)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Approve
                          </button>
                          <button className="kyc-action-btn kyc-btn-reject" onClick={() => toggleRejectArea(u.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>Reject
                          </button>
                        </div>
                      </div>
                      <div className={`kyc-reject-inline ${isRejectOpen ? 'open' : ''}`} id={`reject-area-${u.id}`}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} id={`reject-reason-${u.id}`} placeholder="Enter rejection reason (e.g. Image blurry, ID expired, Selfie mismatch…)" />
                        <button className="kyc-action-btn kyc-btn-reject" onClick={() => handleReject(u.id, u.name)} style={{ whiteSpace: "nowrap" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>Confirm
                        </button>
                        <button className="kyc-action-btn" onClick={() => toggleRejectArea(u.id)} style={{ background: "var(--bg-base)", color: "var(--text-secondary)", border: "1px solid var(--border)", whiteSpace: "nowrap" }}>Cancel</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile layout */}
            <div className="mobile-card-list" id="kyc-card-list">
              {kycPending.map(u => {
                const grad = getKycGradient(u.id);
                const isRejectOpen = openRejectId === u.id;
                
                return (
                  <div key={u.id} className="mobile-card-item" id={`kyc-mob-${u.id}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(${grad})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{initials(u.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{u.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                      </div>
                      <span className="badge badge-yellow">PENDING</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <div className="kyc-thumb" onClick={() => setPreviewImage({ url: u.selfieUrl, label: `Selfie — ${u.name}` })}>
                        <img src={u.selfieUrl} alt="Selfie" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <span className="kyc-thumb-label">Selfie</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{u.id}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{u.submittedAt}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <button className="kyc-action-btn kyc-btn-approve" onClick={() => handleApprove(u.id, u.name)} style={{ justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Approve
                      </button>
                      <button className="kyc-action-btn kyc-btn-reject" onClick={() => toggleRejectArea(u.id)} style={{ justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>Reject
                      </button>
                    </div>
                    <div className={`kyc-reject-inline ${isRejectOpen ? 'open' : ''}`} id={`mob-reject-area-${u.id}`} style={{ marginTop: "8px", borderRadius: "var(--radius-sm)" }}>
                      <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} id={`mob-reject-reason-${u.id}`} placeholder="Rejection reason…" style={{ minWidth: "100%" }} />
                      <button className="kyc-action-btn kyc-btn-reject" onClick={() => handleReject(u.id, u.name)}>Confirm</button>
                      <button className="kyc-action-btn" onClick={() => toggleRejectArea(u.id)} style={{ background: "var(--bg-base)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Cancel</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div id="modal-overlay" className="open" onClick={() => setPreviewImage(null)}>
          <div id="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ maxWidth: "480px", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase" }}>
                {previewImage.label}
              </div>
              <img src={previewImage.url} alt={previewImage.label} style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--border)", display: "block", marginBottom: 0 }} onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
              <div id="img-fallback" style={{ display: "none", alignItems: "center", justifyContent: "center", height: "180px", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--text-muted)", flexDirection: "column", gap: "8px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M12 9h5M12 13h3" /></svg>
                <span style={{ fontSize: "12px" }}>No preview available</span>
              </div>
            </div>
            <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default KYCPage;
