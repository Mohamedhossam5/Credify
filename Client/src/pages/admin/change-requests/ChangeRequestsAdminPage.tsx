import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2, XCircle, MessageSquare, RefreshCw, FileText, Eye, Send, AlertTriangle } from 'lucide-react';
import { changeRequestAdminService, type ChangeRequestWithUser, type ChangeRequestMessage } from '../../../services/change-request.service';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

// ── Helpers ──
const CHANGE_TYPE_LABELS: Record<string, string> = {
  FULL_NAME: 'Full Name',
  PHONE_NUMBER: 'Phone Number',
  EMAIL_ADDRESS: 'Email Address',
  RESIDENTIAL_ADDRESS: 'Residential Address',
};

const STATUS_CONFIG: Record<string, { label: string; class: string; color: string }> = {
  SUBMITTED: { label: 'SUBMITTED', class: 'badge-yellow', color: '#f59e0b' },
  UNDER_REVIEW: { label: 'UNDER REVIEW', class: 'badge-yellow', color: '#f59e0b' },
  WAITING_FOR_CUSTOMER: { label: 'WAITING FOR CUSTOMER', class: 'badge-blue', color: '#3b82f6' },
  APPROVED: { label: 'APPROVED', class: 'badge-green', color: 'var(--success, #00e88f)' },
  REJECTED: { label: 'REJECTED', class: 'badge-red', color: 'var(--danger, #ff4d6a)' },
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const initials = (first: string, last: string) => (first[0] + last[0]).toUpperCase();

const formatChangeValue = (val: string | undefined | null) => {
  if (!val) return '—';
  try {
    const parsed = JSON.parse(val);
    if (parsed.firstName !== undefined) {
      return [parsed.firstName, parsed.middleName, parsed.lastName].filter(Boolean).join(' ');
    }
  } catch {
    // not JSON
  }
  return val;
};

const ChangeRequestsAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, ChangeRequestMessage[]>>({});
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoId, setInfoId] = useState<number | null>(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['admin-change-requests'],
    queryFn: async () => {
      const { requests } = await changeRequestAdminService.list();
      return requests;
    },
  });

  const requests = requestsData ?? [];
  const pendingRequests = requests.filter(r => ['SUBMITTED', 'UNDER_REVIEW', 'WAITING_FOR_CUSTOMER'].includes(r.status));
  const reviewedRequests = requests.filter(r => ['APPROVED', 'REJECTED'].includes(r.status));

  // Load messages for expanded request
  const loadMessages = async (requestId: number) => {
    try {
      const { messages: msgs } = await changeRequestAdminService.get(requestId);
      setMessages(prev => ({ ...prev, [requestId]: msgs }));
    } catch {
      // ignore
    }
  };

  const handleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!messages[id]) {
        loadMessages(id);
      }
    }
  };

  const handleApprove = async (id: number, name: string) => {
    setActionLoading(id);
    try {
      await changeRequestAdminService.approve(id);
      toast.success(`✓ Change request approved: ${name}`);
      queryClient.invalidateQueries({ queryKey: ['admin-change-requests'] });
      setExpandedId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setActionLoading(id);
    try {
      await changeRequestAdminService.reject(id, rejectReason);
      toast.success(`✗ Change request rejected: ${name}`);
      queryClient.invalidateQueries({ queryKey: ['admin-change-requests'] });
      setRejectId(null);
      setRejectReason('');
      setExpandedId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestInfo = async (id: number) => {
    if (!infoMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setActionLoading(id);
    try {
      await changeRequestAdminService.requestInfo(id, infoMessage);
      toast.success('Info request sent to customer');
      queryClient.invalidateQueries({ queryKey: ['admin-change-requests'] });
      setInfoId(null);
      setInfoMessage('');
      loadMessages(id);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to request info');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
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
              <h1 className="page-title">Change Requests</h1>
              <p className="page-subtitle">Information Update Requests · Compliance Review · {pendingRequests.length} pending</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-change-requests'] })}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border, var(--glass-border))', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
              {pendingRequests.length > 0 && <span className="badge badge-yellow">{pendingRequests.length} PENDING</span>}
            </div>
          </div>
        </div>

        {/* ── Pending Requests ── */}
        {pendingRequests.length === 0 ? (
          <div className="card" style={{ background: 'var(--bg-card, var(--glass))', border: '1px solid var(--border, var(--glass-border))', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--success, #00e88f)', marginBottom: '12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>All caught up</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted, var(--text-secondary))' }}>No pending change requests at this time.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingRequests.map(r => {
              const isExpanded = expandedId === r.id;
              const isLoading = actionLoading === r.id;
              const isRejectOpen = rejectId === r.id;
              const isInfoOpen = infoId === r.id;
              const statusConfig = STATUS_CONFIG[r.status] || STATUS_CONFIG.SUBMITTED;
              const typeLabel = CHANGE_TYPE_LABELS[r.change_type] || r.change_type;
              const reqMessages = messages[r.id] || [];
              const name = `${r.first_name} ${r.last_name}`;

              return (
                <div key={r.id} className="admin-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border, var(--glass-border))' }}>
                  {/* Header Row */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}
                    onClick={() => handleExpand(r.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal, #6366f1), var(--blue, #3b82f6))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {r.profile_picture ? (
                          <img src={r.profile_picture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : initials(r.first_name, r.last_name)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted, var(--text-secondary))', fontFamily: '"DM Mono", monospace' }}>{r.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px',
                        background: 'rgba(99, 102, 241, 0.1)', color: 'var(--teal)', border: '1px solid rgba(99, 102, 241, 0.2)',
                      }}>
                        {typeLabel}
                      </span>
                      <span className={`badge ${statusConfig.class}`} style={{ fontSize: '10px' }}>
                        {statusConfig.label}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border, var(--glass-border))' }}>
                      {/* Request Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', padding: '16px 0', marginBottom: '8px', borderBottom: '1px solid var(--border, var(--glass-border))' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Request ID</span>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', fontFamily: '"DM Mono", monospace', marginTop: '2px' }}>{r.request_id}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Submitted</span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>{formatDate(r.created_at)}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Phone</span>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace', marginTop: '2px' }}>{r.phone_number}</div>
                        </div>
                      </div>

                      {/* Change Summary */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '10px' }}>Change Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--danger, #ff4d6a)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Current Value</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace', wordBreak: 'break-all' }}>{formatChangeValue(r.current_value)}</div>
                          </div>
                          <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--success, #00e88f)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>New Value</div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: '"DM Mono", monospace', wordBreak: 'break-all' }}>{formatChangeValue(r.new_value)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Documents */}
                      {r.documents && r.documents.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '10px' }}>Uploaded Documents</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {r.documents.map((doc: any, i: number) => (
                              <div
                                key={i}
                                onClick={() => doc.data && setPreviewImage({ url: doc.data, label: doc.originalName || doc.name })}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px',
                                  border: '1px solid var(--border, var(--glass-border))', cursor: doc.data ? 'pointer' : 'default',
                                  background: 'var(--bg-base, rgba(255,255,255,0.02))', transition: 'all 0.2s',
                                }}
                              >
                                <FileText size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                    {doc.originalName || doc.name}
                                  </div>
                                  {doc.size && <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{(doc.size / 1024).toFixed(1)} KB</div>}
                                </div>
                                {doc.data && <Eye size={12} style={{ color: 'var(--text-muted)' }} />}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conversation Thread */}
                      {reqMessages.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MessageSquare size={12} /> Conversation Thread
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border, var(--glass-border))', maxHeight: '200px', overflowY: 'auto' }}>
                            {reqMessages.map((msg, i) => (
                              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800,
                                  background: msg.sender === 'ADMIN' ? 'rgba(245,158,11,0.15)' : msg.sender === 'USER' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                                  color: msg.sender === 'ADMIN' ? '#f59e0b' : msg.sender === 'USER' ? 'var(--teal)' : 'var(--text-muted)',
                                }}>
                                  {msg.sender === 'ADMIN' ? 'A' : msg.sender === 'USER' ? 'U' : 'S'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 700, color: msg.sender === 'ADMIN' ? '#f59e0b' : msg.sender === 'USER' ? 'var(--teal)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      {msg.sender === 'ADMIN' ? 'Compliance' : msg.sender === 'USER' ? 'Customer' : 'System'}
                                    </span>
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{formatTime(msg.created_at)}</span>
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{msg.message}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleApprove(r.id, name)}
                          disabled={isLoading}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--success, #00e88f), #059669)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                        >
                          {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
                          Approve
                        </button>
                        <button
                          onClick={() => { setRejectId(isRejectOpen ? null : r.id); setRejectReason(''); setInfoId(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(255,77,106,0.3)', background: 'rgba(255,77,106,0.1)', color: 'var(--danger, #ff4d6a)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                        <button
                          onClick={() => { setInfoId(isInfoOpen ? null : r.id); setInfoMessage(''); setRejectId(null); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          <MessageSquare size={14} /> Request Info
                        </button>
                      </div>

                      {/* Reject Reason Input */}
                      {isRejectOpen && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason…"
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border, var(--glass-border))', background: 'var(--bg-base, var(--input-bg))', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                          />
                          <button
                            onClick={() => handleReject(r.id, name)}
                            disabled={isLoading}
                            style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'var(--danger, #ff4d6a)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Confirm Reject'}
                          </button>
                          <button onClick={() => { setRejectId(null); setRejectReason(''); }} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border, var(--glass-border))', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Cancel</button>
                        </div>
                      )}

                      {/* Request Info Input */}
                      {isInfoOpen && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            value={infoMessage}
                            onChange={e => setInfoMessage(e.target.value)}
                            placeholder="Message to customer (e.g., We need a clearer image of…)"
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border, var(--glass-border))', background: 'var(--bg-base, var(--input-bg))', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
                          />
                          <button
                            onClick={() => handleRequestInfo(r.id)}
                            disabled={isLoading}
                            style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {isLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Send size={12} /> Send</>}
                          </button>
                          <button onClick={() => { setInfoId(null); setInfoMessage(''); }} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border, var(--glass-border))', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Cancel</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Previously Reviewed ── */}
        {reviewedRequests.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted, var(--text-secondary))', marginBottom: '12px' }}>Previously Reviewed</div>
            <div className="admin-card" style={{ overflow: 'hidden' }}>
              {reviewedRequests.map(r => {
                const isApproved = r.status === 'APPROVED';
                const typeLabel = CHANGE_TYPE_LABELS[r.change_type] || r.change_type;
                return (
                  <div key={r.id} className="kyc-reviewed-row">
                    <div className="kyc-reviewed-left">
                      <div className="kyc-status-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', background: isApproved ? 'rgba(0,232,143,0.12)' : 'rgba(255,77,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isApproved ? <CheckCircle2 size={14} style={{ color: 'var(--success, #00e88f)' }} /> : <XCircle size={14} style={{ color: 'var(--danger, #ff4d6a)' }} />}
                      </div>
                      <div className="kyc-reviewed-info">
                        <div className="kyc-reviewed-name">{r.first_name} {r.last_name}</div>
                        <div className="kyc-reviewed-email">{typeLabel} · {r.request_id}</div>
                      </div>
                    </div>
                    <div className="kyc-reviewed-right">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '8px' }}>{formatDate(r.updated_at)}</span>
                      <span className={`kyc-status-pill ${isApproved ? 'approved' : 'rejected'}`}>
                        {isApproved ? 'APPROVED' : 'REJECTED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '600px', width: '90%', background: 'var(--bg-card, #1a1f2e)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border, var(--glass-border))' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', textAlign: 'center' }}>{previewImage.label}</div>
            <img src={previewImage.url} alt={previewImage.label} style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border, var(--glass-border))', display: 'block' }} />
            <button onClick={() => setPreviewImage(null)} style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChangeRequestsAdminPage;
