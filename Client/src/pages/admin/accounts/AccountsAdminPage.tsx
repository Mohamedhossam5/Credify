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
  failed_login_attempts: number;
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
  const [frozenAccounts, setFrozenAccounts] = useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<AdminUser | null>(null);

  const getDisplayStatus = (a: AdminUser) => {
    if (a.is_locked) return "locked";
    if (frozenAccounts.has(a.id)) return "frozen";
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

  const toggleFreeze = () => {
    if (!selectedAcc) return;
    const newSet = new Set(frozenAccounts);
    if (newSet.has(selectedAcc.id)) {
      newSet.delete(selectedAcc.id);
    } else {
      newSet.add(selectedAcc.id);
    }
    setFrozenAccounts(newSet);
    setDrawerOpen(false);
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
              <div key={a.id} className="account-wide-card" onClick={() => { setSelectedAcc(a); setDrawerOpen(true); }}>
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
                  <button className="btn-details" onClick={() => { setSelectedAcc(a); setDrawerOpen(true); }}>
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
              <div className="account-mobile-card" key={a.id} onClick={() => { setSelectedAcc(a); setDrawerOpen(true); }}>
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
                      onClick={() => { setSelectedAcc(a); setDrawerOpen(true); }}
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
                ["KYC App Status", selectedAcc.kyc_app_status?.replace(/_/g, ' ') || 'N/A']
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>ACCOUNT ACTIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {selectedAcc.is_locked ? (
                <button className="admin-btn btn-success" onClick={() => handleUnlockAccount(selectedAcc.id)} style={{ justifyContent: 'center' }}>
                  ✓ Unlock Account
                </button>
              ) : selectedAcc.kyc_status === "APPROVED" ? (
                <button className={`admin-btn ${frozenAccounts.has(selectedAcc.id) ? "btn-success" : "btn-danger"}`} onClick={toggleFreeze} style={{ justifyContent: 'center' }}>
                  {frozenAccounts.has(selectedAcc.id) ? "✓ Unfreeze" : "❄ Freeze Account"}
                </button>
              ) : (
                <button className="admin-btn btn-ghost" disabled style={{ justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>❄ Freeze (KYC not approved)</button>
              )}
              <button className="admin-btn btn-warn" onClick={() => { }} style={{ justifyContent: 'center' }}>⚠ Require KYC</button>
              <button className="admin-btn btn-ghost" onClick={() => { }} style={{ justifyContent: 'center' }}>View Transactions</button>
              <button className="admin-btn btn-ghost" onClick={() => { }} style={{ justifyContent: 'center' }}>✉ Contact</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsAdminPage;
