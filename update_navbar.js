const fs = require('fs');
const file = 'd:/Credify-2/Client/src/components/layout/DashboardNavbar.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Imports
code = code.replace(
  "import { useAuthStore } from '../../store/authStore';",
  "import { createPortal } from 'react-dom';\nimport { useAuthStore } from '../../store/authStore';\nimport { api } from '../../lib/api';"
);

// 2. State
code = code.replace(
  "const [isBellHovered, setIsBellHovered] = useState(false);",
  "const [isBellHovered, setIsBellHovered] = useState(false);\n  const [kycUploadOpen, setKycUploadOpen] = useState(false);\n  const [activeKycNotif, setActiveKycNotif] = useState<any>(null);\n  const [kycUploadFile, setKycUploadFile] = useState<File | null>(null);\n  const [isUploadingKyc, setIsUploadingKyc] = useState(false);"
);

// 3. Event listener
code = code.replace(
  "// ── Keyboard shortcut G -> N to toggle notifications ──",
  "// ── Listen for global open kyc upload event ──\n  useEffect(() => {\n    const handleOpenKyc = (e: any) => {\n      setActiveKycNotif({ metadata: { requestId: e.detail.id }, message: e.detail.message });\n      setKycUploadOpen(true);\n    };\n    window.addEventListener('open-kyc-upload', handleOpenKyc);\n    return () => window.removeEventListener('open-kyc-upload', handleOpenKyc);\n  }, []);\n\n  // ── Keyboard shortcut G -> N to toggle notifications ──"
);

// 4. Click handler
code = code.replace(
  "onClick={() => !notif.read && markAsRead(notif.id)}",
  "onClick={() => {\n                        if (!notif.read) markAsRead(notif.id);\n                        if (notif.type === 'kyc_request') {\n                          setActiveKycNotif(notif);\n                          setKycUploadOpen(true);\n                          setIsNotifOpen(false);\n                        }\n                      }}"
);

// 5. Modal render
const modalCode = `
      {/* KYC Upload Modal */}
      {kycUploadOpen && activeKycNotif && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setKycUploadOpen(false)}>
          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '20px', width: '90%', maxWidth: '420px', border: '1px solid var(--border)', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 185, 0, 0.1)', color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {activeKycNotif.message}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                Please upload the required document below to proceed.
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>Select Document Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setKycUploadFile(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px dashed var(--border)', borderRadius: '10px', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setKycUploadOpen(false)} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!kycUploadFile || !activeKycNotif.metadata?.requestId) return;
                  setIsUploadingKyc(true);
                  try {
                    const fd = new FormData();
                    fd.append('document', kycUploadFile);
                    await api.post(\`/kyc/requests/\${activeKycNotif.metadata.requestId}/upload\`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    alert("Document uploaded successfully.");
                    setKycUploadOpen(false);
                    setKycUploadFile(null);
                  } catch (err) {
                    console.error("KYC Upload Error", err);
                    alert("Failed to upload document.");
                  } finally {
                    setIsUploadingKyc(false);
                  }
                }}
                disabled={!kycUploadFile || isUploadingKyc}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: 700, cursor: (!kycUploadFile || isUploadingKyc) ? 'not-allowed' : 'pointer', opacity: (!kycUploadFile || isUploadingKyc) ? 0.6 : 1 }}
              >
                {isUploadingKyc ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};`;

code = code.replace(
  "    </div>\n  );\n};",
  modalCode
);

fs.writeFileSync(file, code);
console.log("Updated DashboardNavbar.tsx successfully.");
