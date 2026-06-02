import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Eye, ShieldCheck, ShieldAlert, RefreshCw, FileText } from 'lucide-react';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';
import { realtime, RealtimeEvent } from '../../../lib/realtime';

// ── Types ──
interface KycUser {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  role: string;
  phone_number: string;
  gender: string;
  kyc_status: string;
  kyc_app_status: string;
  face_match_score: number | null;
  face_match_passed: boolean | null;
  rejection_reason: string | null;
  national_id_front_file: string | null;
  national_id_back_file: string | null;
  face_selfie_file: string | null;
  proof_of_address_file: string | null;
  digital_signature_file: string | null;
  created_at: string;
}

const KYCPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [openRejectId, setOpenRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  const { data: usersData, isLoading: loading, refetch: fetchData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return (data.users || []) as KycUser[];
    },
  });

  const users = usersData ?? [];

  const pendingUsers = users.filter(u => u.kyc_app_status === 'PENDING_ADMIN_REVIEW');
  const allKycUsers = users.filter(u => u.role !== 'ADMIN' && u.kyc_app_status && u.kyc_app_status !== 'PENDING');

  const handleApprove = async (userId: number, name: string) => {
    setActionLoading(userId);
    try {
      await api.post(`/admin/kyc/${userId}/approve`);
      toast.success(`✓ KYC approved: ${name}`);
      await fetchData();
      realtime.publish(RealtimeEvent.ADMIN_USERS_UPDATED);
      realtime.publish(RealtimeEvent.ADMIN_KYC_UPDATED);
      realtime.publish(RealtimeEvent.KYC_STATUS_UPDATED);
      realtime.pushNotification({
        title: 'KYC Approved',
        message: `KYC verification for ${name} has been approved.`
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number, name: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(userId);
    try {
      await api.post(`/admin/kyc/${userId}/reject`, { reason: rejectReason });
      toast.success(`✗ KYC rejected: ${name}`);
      setOpenRejectId(null);
      setRejectReason('');
      await fetchData();
      realtime.publish(RealtimeEvent.ADMIN_USERS_UPDATED);
      realtime.publish(RealtimeEvent.ADMIN_KYC_UPDATED);
      realtime.publish(RealtimeEvent.KYC_STATUS_UPDATED);
      realtime.pushNotification({
        title: 'KYC Rejected',
        message: `KYC verification for ${name} was rejected: ${rejectReason}`
      });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const getImageUrl = (filename: string | null) => {
    if (!filename) return null;
    return `${API_BASE}/admin/kyc/images/${filename}`;
  };

  const initials = (first: string, last: string) => (first[0] + last[0]).toUpperCase();

  const renderUserCard = (u: KycUser, isReviewed: boolean = false) => {
    const isExpanded = expandedUser === u.id;
    const isLoading = actionLoading === u.id;
    const isRejectOpen = openRejectId === u.id;
    const rawScore = u.face_match_score != null ? parseFloat(String(u.face_match_score)) : null;
    const faceScore = rawScore != null ? (rawScore * 100).toFixed(1) : null;
    const facePassed = u.face_match_passed;

    return (
      <div key={u.id} className="admin-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border, var(--glass-border))' }}>
        {/* Header Row */}
        <div className="kyc-card-header" onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
          <div className="kyc-header-user" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal, #0ecbcb), var(--blue, #1a6fff))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {initials(u.first_name, u.last_name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.first_name} {u.middle_name ? u.middle_name + ' ' : ''}{u.last_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, var(--text-secondary))', fontFamily: '"DM Mono", monospace' }}>{u.email}</div>
            </div>
          </div>
          <div className="kyc-header-badges" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* AI Face Verification Badge */}
            {faceScore !== null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: facePassed ? 'rgba(0,232,143,0.1)' : 'rgba(255,77,106,0.1)', border: `1px solid ${facePassed ? 'rgba(0,232,143,0.2)' : 'rgba(255,77,106,0.2)'}` }}>
                {facePassed ? <ShieldCheck size={13} style={{ color: 'var(--success, #00e88f)' }} /> : <ShieldAlert size={13} style={{ color: 'var(--danger, #ff4d6a)' }} />}
                <span style={{ fontSize: '11px', fontWeight: 700, color: facePassed ? 'var(--success, #00e88f)' : 'var(--danger, #ff4d6a)' }}>
                  AI: {facePassed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,185,0,0.1)', border: '1px solid rgba(255,185,0,0.2)' }}>
                <AlertTriangle size={13} style={{ color: '#ffb900' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffb900' }}>
                  AI: ERROR
                </span>
              </div>
            )}
            <span className={`badge ${isReviewed ? (u.kyc_status === 'APPROVED' ? 'badge-green' : 'badge-red') : 'badge-yellow'}`} style={{ fontSize: '10px' }}>
              {isReviewed ? u.kyc_status : 'PENDING REVIEW'}
            </span>
            <svg className="kyc-chevron-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border, var(--glass-border))' }}>
            {/* User Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '16px 0', marginBottom: '16px', borderBottom: '1px solid var(--border, var(--glass-border))' }}>
              <div><span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Phone</span><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace', marginTop: '2px' }}>{u.phone_number}</div></div>
              <div><span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Gender</span><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{u.gender}</div></div>
              <div><span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted, var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Registered</span><div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{new Date(u.created_at).toLocaleDateString()}</div></div>
            </div>

            {/* AI Face Verification Report */}
            {faceScore !== null ? (
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: facePassed ? 'rgba(0,232,143,0.06)' : 'rgba(255,77,106,0.06)', border: `1px solid ${facePassed ? 'rgba(0,232,143,0.15)' : 'rgba(255,77,106,0.15)'}`, marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: facePassed ? 'var(--success, #00e88f)' : 'var(--danger, #ff4d6a)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {facePassed ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  AI Face Verification Report
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted, var(--text-secondary))', fontWeight: 600 }}>Result</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: facePassed ? 'var(--success, #00e88f)' : 'var(--danger, #ff4d6a)' }}>{facePassed ? 'MATCH' : 'NO MATCH'}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted, var(--text-secondary))', fontWeight: 600 }}>Similarity Score</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace' }}>{rawScore?.toFixed(4)}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted, var(--text-secondary))', fontWeight: 600 }}>Confidence</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: facePassed ? 'var(--success, #00e88f)' : 'var(--danger, #ff4d6a)' }}>
                      {facePassed ? 'High' : 'Low'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,185,0,0.06)', border: '1px solid rgba(255,185,0,0.15)', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#ffb900', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} />
                  AI Face Verification Report
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted, var(--text-secondary))', fontWeight: 600 }}>Result</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffb900' }}>ERROR</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted, var(--text-secondary))', fontWeight: 600 }}>Details</span>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Verification score unavailable due to a service error (e.g., no face detected). Please review manually.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Previews */}
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, var(--text-secondary))', marginBottom: '10px' }}>Uploaded Documents</div>
            <div className="kyc-docs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { file: u.national_id_front_file, label: 'ID Front' },
                { file: u.national_id_back_file, label: 'ID Back' },
                { file: u.face_selfie_file, label: 'Face Selfie' },
                { file: u.proof_of_address_file, label: 'Proof of Address' },
              ].map((doc, i) => {
                const url = getImageUrl(doc.file);
                const hasDoc = !!url;
                return (
                  <div 
                    key={i} 
                    className={`kyc-doc-card ${hasDoc ? 'has-doc' : 'no-doc'}`}
                    onClick={() => url && setPreviewImage({ url, label: `${doc.label} — ${u.first_name} ${u.last_name}` })}
                  >
                    <div className="kyc-doc-info">
                      <div className="kyc-doc-icon-container">
                        <FileText size={14} />
                      </div>
                      <div className="kyc-doc-meta">
                        <div className="kyc-doc-label">{doc.label}</div>
                        <div className={`kyc-doc-status ${hasDoc ? 'status-uploaded' : 'status-missing'}`}>
                          {hasDoc ? '✓ UPLOADED' : '✗ NOT UPLOADED'}
                        </div>
                      </div>
                    </div>
                    {hasDoc && (
                      <button className="kyc-eye-btn" aria-label="View Document">
                        <Eye size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Digital Signature */}
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted, var(--text-secondary))', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Digital Signature
            </div>
            {(() => {
              const sigUrl = getImageUrl(u.digital_signature_file);
              const hasSig = !!sigUrl;
              return (
                <div 
                  className={`kyc-doc-card ${hasSig ? 'has-doc' : 'no-doc'}`}
                  onClick={() => sigUrl && setPreviewImage({ url: sigUrl, label: `Digital Signature — ${u.first_name} ${u.last_name}` })}
                  style={{ maxWidth: '320px', marginBottom: '20px' }}
                >
                  <div className="kyc-doc-info">
                    <div className="kyc-doc-icon-container">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </div>
                    <div className="kyc-doc-meta">
                      <div className="kyc-doc-label">Signature</div>
                      <div className={`kyc-doc-status ${hasSig ? 'status-uploaded' : 'status-missing'}`}>
                        {hasSig ? '✓ UPLOADED' : '✗ NOT PROVIDED'}
                      </div>
                    </div>
                  </div>
                  {hasSig && (
                    <button className="kyc-eye-btn" aria-label="View Signature">
                      <Eye size={12} />
                    </button>
                  )}
                </div>
              );
            })()}

            {isReviewed && u.rejection_reason && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.2)' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--danger, #ff4d6a)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Rejection Reason</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{u.rejection_reason}</div>
              </div>
            )}

            {/* Actions */}
            {!isReviewed && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => handleApprove(u.id, `${u.first_name} ${u.last_name}`)} disabled={isLoading} className="kyc-action-btn kyc-btn-approve" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--success, #00e88f), #059669)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                  Approve
                </button>
                <button onClick={() => { setOpenRejectId(isRejectOpen ? null : u.id); setRejectReason(''); }} className="kyc-action-btn kyc-btn-reject" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,77,106,0.3)', background: 'rgba(255,77,106,0.1)', color: 'var(--danger, #ff4d6a)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}

            {/* Reject reason input */}
            {!isReviewed && isRejectOpen && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason (e.g. Image blurry, ID expired, Selfie mismatch...)"
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border, var(--glass-border))', background: 'var(--bg-base, var(--input-bg))', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                />
                <button onClick={() => handleReject(u.id, `${u.first_name} ${u.last_name}`)} disabled={isLoading} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'var(--danger, #ff4d6a)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                  {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm Reject'}
                </button>
                <button onClick={() => { setOpenRejectId(null); setRejectReason(''); }} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border, var(--glass-border))', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title">KYC Verification</h1>
              <p className="page-subtitle">Identity Review · Document Approval · {pendingUsers.length} pending</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border, var(--glass-border))', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={13} /> Refresh
              </button>
              {pendingUsers.length > 0 && <span className="badge badge-yellow">{pendingUsers.length} PENDING</span>}
            </div>
          </div>
        </div>

        {/* ── Pending KYC Applications ── */}
        {pendingUsers.length === 0 ? (
          <div className="card" style={{ background: 'var(--bg-card, var(--glass))', border: '1px solid var(--border, var(--glass-border))', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <ShieldCheck size={40} style={{ color: 'var(--success, #00e88f)', marginBottom: '12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>All caught up</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted, var(--text-secondary))' }}>No pending KYC submissions at this time.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingUsers.map(u => renderUserCard(u, false))}
          </div>
        )}

        {/* ── Previously Reviewed ── */}
        {allKycUsers.filter(u => u.kyc_app_status !== 'PENDING_ADMIN_REVIEW').length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted, var(--text-secondary))', marginBottom: '12px' }}>Previously Reviewed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {allKycUsers.filter(u => u.kyc_app_status !== 'PENDING_ADMIN_REVIEW').map(u => renderUserCard(u, true))}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '600px', width: '90%', background: 'var(--bg-card, #1a1f2e)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border, var(--glass-border))' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted, var(--text-secondary))', marginBottom: '12px', textTransform: 'uppercase', textAlign: 'center' }}>{previewImage.label}</div>
            <img src={previewImage.url} alt={previewImage.label} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border, var(--glass-border))', display: 'block' }} />
            <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom styles for KYC Page document pills and responsiveness */
        .kyc-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          user-select: none;
          position: relative;
        }

        .kyc-chevron-arrow {
          color: var(--text-muted, var(--text-secondary));
          transition: transform 0.25s ease;
          flex-shrink: 0;
        }

        /* Document Card */
        .kyc-doc-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--bg-card, rgba(255, 255, 255, 0.02));
          border: 1px solid var(--border, var(--glass-border));
          border-radius: 12px;
          cursor: default;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .kyc-doc-card.has-doc {
          cursor: pointer;
        }

        .kyc-doc-card.has-doc:hover {
          background: rgba(14, 203, 203, 0.04) !important;
          border-color: rgba(14, 203, 203, 0.35) !important;
          box-shadow: 0 4px 12px rgba(14, 203, 203, 0.04);
          transform: translateY(-1px);
        }

        .kyc-doc-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .kyc-doc-icon-container {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border, var(--glass-border));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: all 0.25s ease;
        }

        .kyc-doc-card.has-doc:hover .kyc-doc-icon-container {
          background: rgba(14, 203, 203, 0.1) !important;
          border-color: rgba(14, 203, 203, 0.2) !important;
          color: var(--teal) !important;
        }

        .kyc-doc-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .kyc-doc-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .kyc-doc-status {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.3px;
          margin-top: 2px;
        }

        .kyc-doc-status.status-uploaded {
          color: var(--success, #00e88f);
        }

        .kyc-doc-status.status-missing {
          color: var(--danger, #ff4d6a);
        }

        /* Circular Eye Button */
        .kyc-eye-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(14, 203, 203, 0.08);
          border: 1px solid rgba(14, 203, 203, 0.18);
          color: var(--teal, #0ecbcb);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          outline: none;
        }

        .kyc-doc-card.has-doc:hover .kyc-eye-btn,
        .kyc-eye-btn:hover {
          background: var(--teal, #0ecbcb) !important;
          border-color: var(--teal, #0ecbcb) !important;
          color: #fff !important;
          transform: scale(1.05);
          box-shadow: 0 0 10px rgba(14, 203, 203, 0.3);
        }

        @media (max-width: 767px) {
          .kyc-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding: 16px 40px 16px 16px !important;
          }
          
          .kyc-chevron-arrow {
            position: absolute !important;
            right: 16px !important;
            top: 24px !important;
          }

          .kyc-header-user {
            width: 100% !important;
          }

          .kyc-header-badges {
            width: 100% !important;
            justify-content: flex-start !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 600px) {
          .kyc-docs-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </>
  );
};

export default KYCPage;
