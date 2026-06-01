import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Loader2, Mail, Eye, Edit2, Snowflake, ChevronRight } from 'lucide-react';

// ── Types ──
interface AdminUser {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  role: string;
  kyc_status: string;
  kyc_app_status: string;
  face_match_score: number | null;
  face_match_passed: boolean | null;
  created_at: string;
  account_id?: string;
  balance?: string;
  is_locked: boolean;
  is_frozen: boolean;
  failed_login_attempts: number;
  id_number: string;
  birthdate: string;
  address: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  rejection_reason: string | null;
  national_id_front_file: string | null;
  national_id_back_file: string | null;
  face_selfie_file: string | null;
  proof_of_address_file: string | null;
  digital_signature_file: string | null;
}

const initials = (name: string) => name.split(" ").map(n => n[0]).join("");

const AccountsAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: loading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return (data.users || []) as AdminUser[];
    },
  });

  const users = (usersData ?? []).filter((u: AdminUser) => u.role !== 'ADMIN');

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<AdminUser | null>(null);
  
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  
  const [requireKycOpen, setRequireKycOpen] = useState(false);
  const [requireKycMsg, setRequireKycMsg] = useState("");
  const [isSubmittingKycReq, setIsSubmittingKycReq] = useState(false);
  const [kycRequests, setKycRequests] = useState<any[]>([]);

  const fetchKycRequests = async (userId: number) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}/kyc-requests`);
      setKycRequests(data.requests || []);
    } catch(err) {
      console.error("Failed to fetch KYC requests", err);
    }
  };

  const openDrawer = (a: AdminUser) => {
    setSelectedAcc(a);
    setDrawerOpen(true);
    fetchKycRequests(a.id);
  };

  const fetchTransactions = async (userId: number) => {
    setLoadingTx(true);
    setTransactionsOpen(true);
    try {
      const { data } = await api.get(`/admin/users/${userId}/transactions`);
      setTransactions(data.transactions || []);
    } catch(err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoadingTx(false);
    }
  };

  const getDisplayStatus = (a: AdminUser) => {
    if (a.is_locked) return "locked";
    if (a.is_frozen) return "frozen";
    if (a.kyc_status === "APPROVED") return "active";
    if (a.kyc_status === "REJECTED") return "blocked";
    return "pending";
  };

  const filteredAccounts = users.filter(a => {
    const ds = getDisplayStatus(a);
    if (statusFilter !== "all" && ds !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const fullName = `${a.first_name} ${a.last_name}`.toLowerCase();
      if (!fullName.includes(s) && !a.email.toLowerCase().includes(s) && !(a.account_id && a.account_id.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  const toggleFreeze = async () => {
    if (!selectedAcc) return;
    try {
      if (selectedAcc.is_frozen) {
        await api.put(`/admin/users/${selectedAcc.id}/unfreeze`);
      } else {
        await api.put(`/admin/users/${selectedAcc.id}/freeze`);
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedAcc({ ...selectedAcc, is_frozen: !selectedAcc.is_frozen });
    } catch (err) {
      console.error("Failed to toggle freeze status", err);
    }
  };

  const handleUnlockAccount = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/unlock`);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDrawerOpen(false);
    } catch (err) {
      console.error("Failed to unlock account", err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDrawerOpen(false);
      setSelectedAcc(null);
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleRequireKycSubmit = async () => {
    if (!selectedAcc || !requireKycMsg.trim()) return;
    setIsSubmittingKycReq(true);
    try {
      await api.post(`/admin/users/${selectedAcc.id}/require-kyc`, { message: requireKycMsg });
      alert("KYC Request sent successfully.");
      setRequireKycOpen(false);
      setRequireKycMsg("");
      fetchKycRequests(selectedAcc.id);
    } catch(err) {
      console.error("Failed to require KYC", err);
      alert("Failed to send request.");
    } finally {
      setIsSubmittingKycReq(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "badge-green", frozen: "badge-blue", pending: "badge-yellow", blocked: "badge-red", locked: "badge-red"
    };
    return <span className={`admin-badge ${map[status] || "badge-gray"}`}>{status.toUpperCase()}</span>;
  };

  const kycBadge = (status: string) => {
    const map: Record<string, string> = { APPROVED: "badge-green", PENDING: "badge-yellow", REJECTED: "badge-red" };
    return <span className={`admin-badge ${map[status] || "badge-gray"}`}>{status.replace(/_/g, ' ').toUpperCase()}</span>;
  };

  if (loading) {
    return (
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ color: 'var(--teal)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 className="page-title">Accounts</h1>
            <p className="page-subtitle">User account management · KYC · {users.length} total accounts</p>
          </div>
        </div>
      </div>

      <div className="modern-filter-header">
        <div className="modern-search-wrap">
          <svg className="modern-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
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
            <button className={`filter-chip ${statusFilter === 'locked' ? 'active' : ''}`} onClick={() => setStatusFilter('locked')}><span className="chip-dot" style={{ background: '#dc2626' }}></span>Locked</button>
          </div>
        </div>
      </div>

      <div className="accounts-container">
        {/* Desktop & Tablet List */}
        <div className="desktop-accounts-list">
          {filteredAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              No accounts match the current filters
            </div>
          ) : filteredAccounts.map(a => {
            const ds = getDisplayStatus(a);
            const fullName = `${a.first_name} ${a.last_name}`;
            return (
              <div key={a.id} className="account-wide-card" onClick={() => openDrawer(a)}>
                {/* 1. User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {initials(fullName)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{a.middle_name || 'N/A'}</div>
                  </div>
                </div>

                {/* 2. Email Block */}
                <div>
                  <div className="col-label">Email</div>
                  <div className="col-value-mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                </div>

                {/* 3. Balance Block */}
                <div>
                  <div className="col-label">Balance</div>
                  <div className="col-value" style={{ fontWeight: 800 }}>
                    {a.balance ? `$${parseFloat(a.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : '-'}
                  </div>
                </div>

                {/* 4. Phone Block */}
                <div className="col-phone">
                  <div className="col-label">Phone</div>
                  <div className="col-value-mono">{a.phone_number}</div>
                </div>

                {/* 5. KYC Block */}
                <div>
                  <div className="col-label">KYC</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginTop: '4px' }}>
                    {kycBadge(a.kyc_status)}
                  </div>
                </div>

                {/* 6. Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                  <button className="btn-details" onClick={() => openDrawer(a)}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Cards List */}
        <div className="mobile-accounts-list">
          {filteredAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              No accounts match filters
            </div>
          ) : filteredAccounts.map(a => {
            const ds = getDisplayStatus(a);
            const fullName = `${a.first_name} ${a.last_name}`;
            return (
              <div className="account-mobile-card" key={a.id} onClick={() => openDrawer(a)}>
                <div className="card-top">
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {initials(fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{fullName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.middle_name || 'N/A'}</div>
                  </div>
                  {statusBadge(ds)}
                </div>

                <div className="card-mid">
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Phone: </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{a.phone_number}</span>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Email: </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{a.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>KYC: </span>
                    {kycBadge(a.kyc_status)}
                  </div>
                </div>

                <div className="card-divider"></div>

                <div className="card-bottom">
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '2px' }}>BALANCE</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-3)' }}>
                      {a.balance ? `$${parseFloat(a.balance).toLocaleString("en-US", { minimumFractionDigits: 0 })}` : '-'}
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-details"
                      style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                      onClick={() => openDrawer(a)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-2), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 700, color: '#fff' }}>{initials(`${selectedAcc.first_name} ${selectedAcc.last_name}`)}</div>
              <div><div style={{ fontSize: '19px', fontWeight: 800 }}>{selectedAcc.first_name} {selectedAcc.last_name}</div><div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{selectedAcc.email}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>BALANCE</div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-3)' }}>{selectedAcc.balance ? `$${parseFloat(selectedAcc.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : '-'}</div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>PHONE</div>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{selectedAcc.phone_number}</div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>STATUS</div>
                <div style={{ marginTop: '4px' }}>{statusBadge(getDisplayStatus(selectedAcc))}</div>
              </div>
              <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>KYC</div>
                <div style={{ marginTop: '4px' }}>{kycBadge(selectedAcc.kyc_status)}</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>ACCOUNT DETAILS</div>
              {[
                ["Account ID", selectedAcc.account_id || 'N/A'],
                ["Gender", selectedAcc.gender],
                ["Member Since", new Date(selectedAcc.created_at).toLocaleDateString()],
                ["National ID", selectedAcc.id_number || 'N/A'],
                ["Birthdate", selectedAcc.birthdate || 'N/A'],
                ["Address", selectedAcc.address || 'N/A'],
                ["Phone Verified", selectedAcc.phone_verified ? "Yes" : "No"],
                ["Email Verified", selectedAcc.email_verified ? "Yes" : "No"],
                ["KYC App Status", selectedAcc.kyc_app_status?.replace(/_/g, ' ') || 'N/A']
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>KYC DOCUMENTS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {selectedAcc.national_id_front_file && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>National ID (Front)</div>
                    <img src={`${api.defaults.baseURL}/admin/kyc/images/${selectedAcc.national_id_front_file}`} alt="Front ID" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                )}
                {selectedAcc.national_id_back_file && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>National ID (Back)</div>
                    <img src={`${api.defaults.baseURL}/admin/kyc/images/${selectedAcc.national_id_back_file}`} alt="Back ID" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                )}
                {selectedAcc.face_selfie_file && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Face Selfie</div>
                    <img src={`${api.defaults.baseURL}/admin/kyc/images/${selectedAcc.face_selfie_file}`} alt="Selfie" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                )}
                {selectedAcc.proof_of_address_file && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Proof of Address</div>
                    <img src={`${api.defaults.baseURL}/admin/kyc/images/${selectedAcc.proof_of_address_file}`} alt="Address" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                )}
                {selectedAcc.digital_signature_file && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Digital Signature</div>
                    <img src={`${api.defaults.baseURL}/admin/kyc/images/${selectedAcc.digital_signature_file}`} alt="Signature" style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                )}
                
                {kycRequests.filter(req => req.status === 'UPLOADED').map((req, idx) => (
                  <div key={req.id} style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Additional Doc: {req.message}</div>
                    <img src={`${api.defaults.baseURL}/admin/kyc/images/${req.document_file}`} alt={`Additional ${idx}`} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                ))}
                {!selectedAcc.national_id_front_file && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No KYC documents uploaded yet.</div>}
              </div>
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>ACCOUNT ACTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {selectedAcc.is_locked ? (
                <button className="admin-btn btn-success" onClick={() => handleUnlockAccount(selectedAcc.id)} style={{ justifyContent: 'center' }}>
                  ✓ Unlock Account
                </button>
              ) : selectedAcc.kyc_status === "APPROVED" ? (
                <button className={`admin-btn ${selectedAcc.is_frozen ? "btn-success" : "btn-danger"}`} onClick={toggleFreeze} style={{ justifyContent: 'center' }}>
                  {selectedAcc.is_frozen ? "✓ Unfreeze" : "❄ Freeze Account"}
                </button>
              ) : (
                <button className="admin-btn btn-ghost" disabled style={{ justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>❄ Freeze (KYC not approved)</button>
              )}
              <button className="admin-btn btn-warn" onClick={() => setRequireKycOpen(true)} style={{ justifyContent: 'center' }}>⚠ Require KYC</button>
              <button className="admin-btn btn-ghost" onClick={() => fetchTransactions(selectedAcc.id)} style={{ justifyContent: 'center' }}>View Transactions</button>
              <button className="admin-btn btn-ghost" onClick={() => setContactOpen(true)} style={{ justifyContent: 'center' }}>✉ Contact</button>
              <button className="admin-btn btn-danger" onClick={() => handleDeleteUser(selectedAcc.id)} style={{ gridColumn: '1 / -1', justifyContent: 'center', marginTop: '8px' }}>🗑 Delete User</button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Modal */}
      {transactionsOpen && (
        <div className="drawer-overlay open" onClick={() => setTransactionsOpen(false)} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Transactions for {selectedAcc?.first_name} {selectedAcc?.last_name}</h3>
              <button onClick={() => setTransactionsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            
            {loadingTx ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} /></div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found for this user.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {transactions.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>{tx.type.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleString()}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {tx.sender_id === selectedAcc?.id 
                          ? `To: ${tx.recipient_name || tx.recipient_account || 'N/A'}` 
                          : `From: ${tx.sender_id} (Internal)`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: tx.sender_id === selectedAcc?.id ? 'var(--danger)' : 'var(--success)' }}>
                        {tx.sender_id === selectedAcc?.id ? '-' : '+'}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase' }}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactOpen && selectedAcc && (
        <div className="drawer-overlay open" onClick={() => setContactOpen(false)} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Contact {selectedAcc.first_name}</h3>
            
            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Email Address</div>
                <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  <a href={`mailto:${selectedAcc.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{selectedAcc.email}</a>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: 'var(--blue, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Phone Number</div>
                <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  <a href={`tel:${selectedAcc.phone_number}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{selectedAcc.phone_number}</a>
                </div>
              </div>
            </div>

            <button onClick={() => setContactOpen(false)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', marginTop: '20px' }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Require KYC Modal */}
      {requireKycOpen && selectedAcc && (
        <div className="drawer-overlay open" onClick={() => setRequireKycOpen(false)} style={{ zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Require Additional KYC</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Send a request to {selectedAcc.first_name} for additional documents.
            </p>
            <textarea 
              value={requireKycMsg}
              onChange={e => setRequireKycMsg(e.target.value)}
              placeholder="e.g., Please upload a clearer image of your ID back"
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', marginBottom: '20px', fontSize: '14px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setRequireKycOpen(false)} 
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleRequireKycSubmit} 
                disabled={!requireKycMsg.trim() || isSubmittingKycReq}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: 700, cursor: (!requireKycMsg.trim() || isSubmittingKycReq) ? 'not-allowed' : 'pointer', opacity: (!requireKycMsg.trim() || isSubmittingKycReq) ? 0.6 : 1 }}
              >
                {isSubmittingKycReq ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /> : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsAdminPage;
