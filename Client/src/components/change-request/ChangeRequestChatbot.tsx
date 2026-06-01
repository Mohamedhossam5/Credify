import React, { useState, useRef, useEffect, useCallback } from 'react';
import { changeRequestService, type ChangeRequest, type ChangeRequestMessage, type DocumentItem } from '../../services/change-request.service';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import '../../styles/change-request.css';

// ─── Types ───────────────────────────────────────────────────

type ChatStep =
  | 'welcome'
  | 'selection'
  | 'documents'
  | 'uploaded'
  | 'input'
  | 'otp-verification'
  | 'review'
  | 'submitted'
  | 'existing'
  | 'approved'
  | 'rejected';

interface ChatMessage {
  id: string;
  type: 'assistant' | 'user' | 'system' | 'admin';
  content: string;
  timestamp: Date;
  component?: React.ReactNode;
}

interface ChangeTypeConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  docs: string[];
  docsHint: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputType: string;
}

const CHANGE_TYPES: ChangeTypeConfig[] = [
  {
    key: 'FULL_NAME',
    label: 'Full Name',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    color: 'rgba(99, 102, 241, 0.1)',
    docs: ['National ID (Front)', 'National ID (Back)'],
    docsHint: 'Accepted: JPG, PNG, PDF — Max 10MB',
    inputLabel: 'New Full Name',
    inputPlaceholder: 'Enter your new full name',
    inputType: 'text',
  },
  {
    key: 'PHONE_NUMBER',
    label: 'Phone Number',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
    color: 'rgba(16, 185, 129, 0.1)',
    docs: ['Mobile bill or telecom statement', 'National ID (Front)'],
    docsHint: 'Accepted: JPG, PNG, PDF — Max 10MB',
    inputLabel: 'New Phone Number',
    inputPlaceholder: '+20 101 234 5678',
    inputType: 'tel',
  },
  {
    key: 'EMAIL_ADDRESS',
    label: 'Email Address',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    color: 'rgba(59, 130, 246, 0.1)',
    docs: ['National ID (Front)', 'Proof of email ownership (screenshot)'],
    docsHint: 'Accepted: JPG, PNG, PDF — Max 10MB',
    inputLabel: 'New Email Address',
    inputPlaceholder: 'newemail@example.com',
    inputType: 'email',
  },
  {
    key: 'RESIDENTIAL_ADDRESS',
    label: 'Residential Address',
    icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    color: 'rgba(139, 92, 246, 0.1)',
    docs: ['Utility bill or bank statement', 'National ID (Front)'],
    docsHint: 'Accepted: JPG, PNG, PDF — Max 10MB',
    inputLabel: 'New Residential Address',
    inputPlaceholder: 'Enter your new address',
    inputType: 'text',
  },
];

// ─── Helpers ─────────────────────────────────────────────────

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

const msgId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

// ─── Bot Avatar ─────────────────────────────────────────────

const BotAvatar = ({ admin }: { admin?: boolean }) => (
  <div className={`cr-msg-avatar${admin ? ' admin' : ''}`}>
    {admin ? (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ) : (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M6 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2"/><circle cx="12" cy="6" r="4" fill="none"/><path d="M15 11l2 2 4-4"/></svg>
    )}
  </div>
);

// ─── Component ──────────────────────────────────────────────

interface ChangeRequestChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentValues: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
}

const ChangeRequestChatbot: React.FC<ChangeRequestChatbotProps> = ({
  isOpen,
  onClose,
  currentValues,
}) => {
  const { user } = useAuthStore();
  const bodyRef = useRef<HTMLDivElement>(null);

  // ── State ──
  const [step, setStep] = useState<ChatStep>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedType, setSelectedType] = useState<ChangeTypeConfig | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newValue, setNewValue] = useState('');
  const [nameValues, setNameValues] = useState({ first: '', middle: '', last: '' });
  const [otp, setOtp] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ChangeRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [existingMessages, setExistingMessages] = useState<ChangeRequestMessage[]>([]);

  // ── Scroll to bottom ──
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }
    }, 60);
  }, []);

  // ── Add message with typing delay ──
  const addBotMessage = useCallback((content: string, component?: React.ReactNode, delay = 600) => {
    setIsTyping(true);
    scrollToBottom();
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: msgId(),
        type: 'assistant',
        content,
        timestamp: new Date(),
        component,
      }]);
      scrollToBottom();
    }, delay);
  }, [scrollToBottom]);

  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      id: msgId(),
      type: 'user',
      content,
      timestamp: new Date(),
    }]);
    scrollToBottom();
  }, [scrollToBottom]);

  // ── Initialize on open ──
  useEffect(() => {
    if (!isOpen) return;

    setMessages([]);
    setStep('welcome');
    setSelectedType(null);
    setUploadedFiles([]);
    setNewValue('');
    setNameValues({ first: '', middle: '', last: '' });
    setOtp('');
    setCurrentRequest(null);
    setProgressStep(0);
    setExistingMessages([]);

    // Check for existing active requests
    (async () => {
      try {
        const { requests } = await changeRequestService.list();
        const active = requests.find(r =>
          !['APPROVED', 'REJECTED'].includes(r.status)
        );
        if (active) {
          setCurrentRequest(active);
          setStep('existing');
          const { messages: msgs } = await changeRequestService.get(active.id);
          setExistingMessages(msgs);

          // Show existing request conversation
          const typeConfig = CHANGE_TYPES.find(t => t.key === active.change_type);
          setTimeout(() => {
            setMessages([{
              id: msgId(),
              type: 'assistant',
              content: `Welcome back! You have an active request to change your **${typeConfig?.label || active.change_type}**.`,
              timestamp: new Date(),
            }]);

            // Check status
            if (active.status === 'APPROVED') {
              setStep('approved');
            } else if (active.status === 'REJECTED') {
              setStep('rejected');
            }
          }, 300);
          return;
        }
      } catch {
        // Ignore, proceed with fresh flow
      }

      // Fresh flow — welcome message
      setTimeout(() => {
        setMessages([{
          id: msgId(),
          type: 'assistant',
          content: `Hello${user?.firstName ? ` ${user.firstName}` : ''}! I'm Credify Assistant. What would you like to update today?`,
          timestamp: new Date(),
        }]);
      }, 400);
    })();
  }, [isOpen, user?.firstName]);

  // ── Get current value for a change type ──
  const getCurrentValue = (type: string): string => {
    switch (type) {
      case 'FULL_NAME':
        return [currentValues.firstName, currentValues.middleName, currentValues.lastName].filter(Boolean).join(' ');
      case 'PHONE_NUMBER':
        return currentValues.phone;
      case 'EMAIL_ADDRESS':
        return currentValues.email;
      case 'RESIDENTIAL_ADDRESS':
        return currentValues.address;
      default:
        return '';
    }
  };

  // ── Handle type selection ──
  const handleSelectType = (type: ChangeTypeConfig) => {
    setSelectedType(type);
    addUserMessage(type.label);
    setProgressStep(1);

    setTimeout(() => {
      addBotMessage(
        `Great! I'll help you update your ${type.label.toLowerCase()}. To verify ownership, please upload the following documents.`,
        undefined,
        800
      );
      setTimeout(() => {
        setStep('documents');
        scrollToBottom();
      }, 1400);
    }, 300);
  };

  // ── File Upload ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Handle Upload Submit ──
  const handleUploadSubmit = () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document.');
      return;
    }

    addUserMessage(`Uploaded ${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''}`);
    setStep('uploaded');
    setProgressStep(2);

    addBotMessage(
      "I've received your documents successfully. Now, please enter your new information.",
      undefined,
      800
    );

    setTimeout(() => {
      setStep('input');
      setProgressStep(3);
      scrollToBottom();
    }, 1500);
  };

  // ── Handle New Value Submit ──
  const handleNewValueSubmit = async () => {
    if (selectedType?.key === 'FULL_NAME') {
      if (!nameValues.first.trim() || !nameValues.last.trim()) {
        toast.error('First and Last names are required.');
        return;
      }
      const full = [nameValues.first.trim(), nameValues.middle.trim(), nameValues.last.trim()].filter(Boolean).join(' ');
      setNewValue(JSON.stringify({
        firstName: nameValues.first.trim(),
        middleName: nameValues.middle.trim(),
        lastName: nameValues.last.trim()
      }));
      addUserMessage(full);
      
      setStep('review');
      setProgressStep(4);
      addBotMessage('Please review your request before submission.', undefined, 600);
      scrollToBottom();
    } else {
      if (!newValue.trim()) {
        toast.error('Please enter the new value.');
        return;
      }

      if (selectedType?.key === 'PHONE_NUMBER') {
        const phoneRegex = /^\+20\d{10}$/;
        if (!phoneRegex.test(newValue.trim())) {
          toast.error('Phone number must start with +20 and have exactly 10 digits after it.');
          return;
        }
      }

      if (selectedType?.key === 'EMAIL_ADDRESS') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newValue.trim())) {
          toast.error('Please enter a valid email address.');
          return;
        }
      }

      addUserMessage(newValue);

      if (selectedType?.key === 'PHONE_NUMBER' || selectedType?.key === 'EMAIL_ADDRESS') {
        setIsSubmitting(true);
        try {
          await changeRequestService.sendOtp(selectedType.key, newValue);
          setStep('otp-verification');
          addBotMessage(`I've sent a verification code to ${newValue}. Please enter it below.`, undefined, 600);
          scrollToBottom();
        } catch (err: any) {
          toast.error(err?.message || 'Failed to send verification code.');
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setStep('review');
        setProgressStep(4);
        addBotMessage('Please review your request before submission.', undefined, 600);
        scrollToBottom();
      }
    }
  };

  // ── Handle OTP Submit ──
  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      await changeRequestService.verifyOtp(selectedType.key, newValue, otp);
      addUserMessage(otp);
      setStep('review');
      setProgressStep(4);
      addBotMessage('Code verified successfully. Please review your request before submission.', undefined, 600);
      scrollToBottom();
    } catch (err: any) {
      toast.error(err?.message || 'Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Convert files to base64 ──
  const filesToBase64 = async (files: File[]): Promise<DocumentItem[]> => {
    return Promise.all(
      files.map(
        (f) =>
          new Promise<DocumentItem>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                name: f.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
                originalName: f.name,
                size: f.size,
                type: f.type,
                data: reader.result as string,
              });
            };
            reader.readAsDataURL(f);
          })
      )
    );
  };

  // ── Submit Request ──
  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);

    try {
      const docs = await filesToBase64(uploadedFiles);
      const { request } = await changeRequestService.create({
        changeType: selectedType.key,
        currentValue: getCurrentValue(selectedType.key),
        newValue,
        documents: docs,
      });

      setCurrentRequest(request);
      setStep('submitted');
      addUserMessage('Submit Request');
      addBotMessage('Your request has been submitted successfully! 🎉', undefined, 500);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to submit request.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle re-upload for additional info ──
  const handleReUpload = async () => {
    if (!currentRequest || uploadedFiles.length === 0) return;
    setIsSubmitting(true);

    try {
      const docs = await filesToBase64(uploadedFiles);
      await changeRequestService.uploadDocuments(currentRequest.id, docs);

      addUserMessage(`Uploaded ${uploadedFiles.length} document${uploadedFiles.length > 1 ? 's' : ''}`);
      setUploadedFiles([]);
      addBotMessage("Thank you. Your document has been received and is back under review.", undefined, 500);

      // Refresh request
      const { request: updated, messages: msgs } = await changeRequestService.get(currentRequest.id);
      setCurrentRequest(updated);
      setExistingMessages(msgs);
    } catch {
      toast.error('Failed to upload documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Refresh existing request status ──
  const refreshRequest = useCallback(async () => {
    if (!currentRequest) return;
    try {
      const { request: updated, messages: msgs } = await changeRequestService.get(currentRequest.id);
      setCurrentRequest(updated);
      setExistingMessages(msgs);

      if (updated.status === 'APPROVED') setStep('approved');
      else if (updated.status === 'REJECTED') setStep('rejected');
    } catch {
      // ignore
    }
  }, [currentRequest]);

  // ── Auto Refresh ──
  useEffect(() => {
    if (!isOpen || !currentRequest) return;
    if (['APPROVED', 'REJECTED'].includes(currentRequest.status)) return;

    const interval = setInterval(() => {
      refreshRequest();
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen, currentRequest?.status, refreshRequest]);

  // ── Render Progress ──
  const renderProgress = () => {
    if (progressStep === 0) return null;
    const pct = (progressStep / 4) * 100;
    return (
      <div className="cr-progress">
        <div className="cr-progress-inner">
          <span className="cr-progress-label">Step {progressStep} of 4</span>
          <div className="cr-progress-bar">
            <div className="cr-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  };

  // ── Render Timeline ──
  const renderTimeline = (status: string) => {
    const steps = [
      { label: 'Submitted', key: 'SUBMITTED' },
      { label: 'Compliance Review', key: 'UNDER_REVIEW' },
      { label: 'Approved', key: 'APPROVED' },
    ];

    const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'WAITING_FOR_CUSTOMER', 'APPROVED', 'REJECTED'];
    const currentIdx = statusOrder.indexOf(status);

    return (
      <div className="cr-timeline">
        {steps.map((s, i) => {
          let dotClass = 'pending';
          if (status === 'REJECTED' && i === 2) {
            dotClass = 'pending';
          } else if (s.key === status || (status === 'WAITING_FOR_CUSTOMER' && s.key === 'UNDER_REVIEW')) {
            dotClass = 'active';
          } else if (statusOrder.indexOf(s.key) < currentIdx) {
            dotClass = 'done';
          }

          return (
            <div key={s.key} className="cr-timeline-item">
              <div className={`cr-timeline-dot ${dotClass}`}>
                {dotClass === 'done' ? (
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                ) : dotClass === 'active' ? (
                  <span>🟡</span>
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--glass-border)', display: 'block' }} />
                )}
              </div>
              <span className={`cr-timeline-text${dotClass === 'pending' ? ' muted' : ''}`}>
                {status === 'REJECTED' && i === 2 ? 'Rejected' : s.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="cr-overlay" onClick={onClose} />
      <div className="cr-chatbot">
        {/* Header */}
        <div className="cr-header">
          <div className="cr-header-left">
            <div className="cr-avatar">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2"/>
                <path d="M15 11l2 2 4-4"/>
              </svg>
            </div>
            <div className="cr-header-info">
              <span className="cr-header-title">Credify Assistant</span>
              <span className="cr-header-status">
                <span className="cr-status-dot" />
                Online
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {currentRequest && (
              <button className="cr-close-btn" onClick={refreshRequest} aria-label="Refresh status" title="Refresh">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 2v6h6"/></svg>
              </button>
            )}
            <button className="cr-close-btn" onClick={onClose} aria-label="Close chat">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Progress */}
        {step !== 'welcome' && step !== 'existing' && step !== 'submitted' && step !== 'approved' && step !== 'rejected' && renderProgress()}

        {/* Chat Body */}
        <div className="cr-body" ref={bodyRef}>
          {/* Render messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`cr-message${msg.type === 'user' ? ' user-msg' : ''}`}>
              {msg.type !== 'user' && <BotAvatar admin={msg.type === 'admin'} />}
              <div className="cr-msg-content">
                <div className={`cr-msg-bubble${msg.type === 'user' ? ' user' : ''}`}>
                  {msg.content}
                </div>
                <span className="cr-msg-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="cr-typing">
              <BotAvatar />
              <div className="cr-typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* ── Welcome: Action Cards ── */}
          {step === 'welcome' && messages.length > 0 && !isTyping && (
            <div className="cr-action-cards">
              {CHANGE_TYPES.map((t) => (
                <div key={t.key} className="cr-action-card" onClick={() => handleSelectType(t)}>
                  <div className="cr-action-icon" style={{ background: t.color }}>
                    {t.icon}
                  </div>
                  {t.label}
                </div>
              ))}
            </div>
          )}

          {/* ── Documents: Upload Zone ── */}
          {step === 'documents' && !isTyping && selectedType && (
            <div style={{ animation: 'cr-msgIn 0.3s ease' }}>
              <div className="cr-doc-list">
                {selectedType.docs.map((doc, i) => (
                  <div key={i} className="cr-doc-req">
                    <span className="cr-doc-req-num">{i + 1}</span>
                    {doc}
                  </div>
                ))}
              </div>
              <div className="cr-doc-req-hint">{selectedType.docsHint}</div>

              <div
                className={`cr-upload-zone${isDragging ? ' dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('cr-file-input')?.click()}
                style={{ marginTop: 12 }}
              >
                <input
                  id="cr-file-input"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <div className="cr-upload-zone-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="cr-upload-zone-text">Drop files here or click to browse</div>
                <div className="cr-upload-zone-hint">JPG, PNG, PDF up to 10MB</div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="cr-file-list">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="cr-file-item">
                      <div className="cr-file-icon">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div className="cr-file-info">
                        <div className="cr-file-name">{f.name}</div>
                        <div className="cr-file-size">{formatFileSize(f.size)}</div>
                      </div>
                      <button className="cr-file-remove" onClick={(e) => { e.stopPropagation(); removeFile(i); }}>
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="cr-btn cr-btn-primary"
                disabled={uploadedFiles.length === 0}
                onClick={handleUploadSubmit}
                style={{ marginTop: 12 }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Documents
              </button>
            </div>
          )}

          {/* ── Input: New Value ── */}
          {step === 'input' && !isTyping && selectedType && (
            <div className="cr-input-group" style={{ animation: 'cr-msgIn 0.3s ease' }}>
              <label className="cr-input-label">{selectedType.inputLabel}</label>
              {selectedType.key === 'FULL_NAME' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    className="cr-input"
                    type="text"
                    placeholder="First Name"
                    value={nameValues.first}
                    onChange={(e) => setNameValues(prev => ({ ...prev, first: e.target.value }))}
                    autoFocus
                  />
                  <input
                    className="cr-input"
                    type="text"
                    placeholder="Middle Name (Optional)"
                    value={nameValues.middle}
                    onChange={(e) => setNameValues(prev => ({ ...prev, middle: e.target.value }))}
                  />
                  <input
                    className="cr-input"
                    type="text"
                    placeholder="Last Name"
                    value={nameValues.last}
                    onChange={(e) => setNameValues(prev => ({ ...prev, last: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewValueSubmit()}
                  />
                </div>
              ) : (
                <input
                  className="cr-input"
                  type={selectedType.inputType}
                  placeholder={selectedType.inputPlaceholder}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewValueSubmit()}
                  autoFocus
                />
              )}
              <button
                className="cr-btn cr-btn-primary"
                disabled={selectedType.key === 'FULL_NAME' ? (!nameValues.first.trim() || !nameValues.last.trim()) : !newValue.trim()}
                onClick={handleNewValueSubmit}
                style={{ marginTop: '4px' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ── OTP Verification ── */}
          {step === 'otp-verification' && !isTyping && (
            <div className="cr-input-group" style={{ animation: 'cr-msgIn 0.3s ease' }}>
              <label className="cr-input-label">Verification Code</label>
              <input
                className="cr-input"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleOtpSubmit()}
                autoFocus
              />
              <button
                className="cr-btn cr-btn-primary"
                disabled={otp.length !== 6 || isSubmitting}
                onClick={handleOtpSubmit}
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}

          {/* ── Review: Summary Card ── */}
          {step === 'review' && !isTyping && selectedType && (
            <div style={{ animation: 'cr-msgIn 0.3s ease' }}>
              <div className="cr-review-card">
                <div className="cr-review-row">
                  <div>
                    <div className="cr-review-label">Change Type</div>
                    <div className="cr-review-value" style={{ fontFamily: '"Inter", sans-serif' }}>{selectedType.label}</div>
                  </div>
                </div>
                <div className="cr-review-row">
                  <div>
                    <div className="cr-review-label">Current {selectedType.label}</div>
                    <div className="cr-review-value">{getCurrentValue(selectedType.key) || '—'}</div>
                  </div>
                </div>
                <div className="cr-review-row">
                  <div>
                    <div className="cr-review-label">New {selectedType.label}</div>
                    <div className="cr-review-value" style={{ color: 'var(--teal)' }}>
                      {selectedType.key === 'FULL_NAME' 
                        ? [nameValues.first.trim(), nameValues.middle.trim(), nameValues.last.trim()].filter(Boolean).join(' ') 
                        : newValue}
                    </div>
                  </div>
                </div>
                <div className="cr-review-row">
                  <div>
                    <div className="cr-review-label">Documents Uploaded</div>
                    <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {uploadedFiles.map((f, i) => (
                        <span key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>• {f.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="cr-btn cr-btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Submitted: Success ── */}
          {step === 'submitted' && currentRequest && !isTyping && (
            <div style={{ animation: 'cr-msgIn 0.3s ease', textAlign: 'center', padding: '8px 0' }}>
              <div className="cr-success-icon">
                <svg width="36" height="36" fill="none" stroke="var(--success)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="cr-success-title">Request Submitted!</div>
              <div className="cr-success-sub">We'll notify you as soon as there's an update.</div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                <div className="cr-request-id-badge">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 7h10v10"/><path d="M7 17L17 7"/></svg>
                  {currentRequest.request_id}
                </div>
                <div className="cr-status-badge under-review">
                  Under Review
                </div>
              </div>

              {renderTimeline(currentRequest.status)}

              <button className="cr-btn cr-btn-outline" onClick={onClose} style={{ marginTop: 16 }}>
                Close
              </button>
            </div>
          )}

          {/* ── Existing Request ── */}
          {step === 'existing' && currentRequest && !isTyping && (
            <div style={{ animation: 'cr-msgIn 0.3s ease' }}>
              {/* Show conversation thread */}
              {existingMessages.map((msg, i) => (
                <div key={i} className={`cr-message${msg.sender === 'USER' ? ' user-msg' : ''}`} style={{ marginBottom: 8 }}>
                  {msg.sender !== 'USER' && <BotAvatar admin={msg.sender === 'ADMIN'} />}
                  <div className="cr-msg-content">
                    <div className={`cr-msg-bubble${msg.sender === 'USER' ? ' user' : ''}`}>
                      {msg.sender === 'ADMIN' && (
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Compliance Team
                        </div>
                      )}
                      {msg.message}
                    </div>
                    <span className="cr-msg-time">
                      {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Status + Timeline */}
              <div style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="cr-request-id-badge">
                    {currentRequest.request_id}
                  </div>
                  <div className={`cr-status-badge ${
                    currentRequest.status === 'WAITING_FOR_CUSTOMER' ? 'waiting' :
                    currentRequest.status === 'APPROVED' ? 'approved' :
                    currentRequest.status === 'REJECTED' ? 'rejected' : 'under-review'
                  }`}>
                    {currentRequest.status.replace(/_/g, ' ')}
                  </div>
                </div>
                {renderTimeline(currentRequest.status)}
              </div>

              {/* If waiting for customer — show upload */}
              {currentRequest.status === 'WAITING_FOR_CUSTOMER' && (
                <div style={{ marginTop: 8 }}>
                  <div
                    className={`cr-upload-zone${isDragging ? ' dragging' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('cr-file-input-existing')?.click()}
                  >
                    <input
                      id="cr-file-input-existing"
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    <div className="cr-upload-zone-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <div className="cr-upload-zone-text">Upload requested documents</div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <>
                      <div className="cr-file-list">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="cr-file-item">
                            <div className="cr-file-icon">
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>
                            <div className="cr-file-info">
                              <div className="cr-file-name">{f.name}</div>
                              <div className="cr-file-size">{formatFileSize(f.size)}</div>
                            </div>
                            <button className="cr-file-remove" onClick={() => removeFile(i)}>
                              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        className="cr-btn cr-btn-primary"
                        onClick={handleReUpload}
                        disabled={isSubmitting}
                        style={{ marginTop: 8 }}
                      >
                        {isSubmitting ? 'Uploading...' : 'Upload Document'}
                      </button>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="cr-btn cr-btn-outline" onClick={refreshRequest} style={{ flex: 1 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Refresh
                </button>
                <button className="cr-btn cr-btn-outline" onClick={onClose} style={{ flex: 1 }}>
                  Close
                </button>
              </div>
            </div>
          )}

          {/* ── Approved ── */}
          {step === 'approved' && currentRequest && (
            <div style={{ animation: 'cr-msgIn 0.3s ease', textAlign: 'center', padding: '12px 0' }}>
              <div className="cr-success-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', width: 90, height: 90 }}>
                <svg width="42" height="42" fill="none" stroke="var(--success)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div className="cr-success-title" style={{ marginTop: 8 }}>
                Great news! 🎉
              </div>
              <div className="cr-success-title" style={{ fontSize: 16, marginTop: 4 }}>
                Your request has been approved.
              </div>

              <div className="cr-review-card" style={{ marginTop: 16, textAlign: 'left' }}>
                <div className="cr-review-row">
                  <div>
                    <div className="cr-review-label">New {CHANGE_TYPES.find(t => t.key === currentRequest.change_type)?.label}</div>
                    <div className="cr-review-value" style={{ color: 'var(--success)' }}>{formatChangeValue(currentRequest.new_value)}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                {renderTimeline('APPROVED')}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
                Your information has been updated successfully.
              </div>

              <button className="cr-btn cr-btn-outline" onClick={onClose} style={{ marginTop: 12 }}>
                Close
              </button>
            </div>
          )}

          {/* ── Rejected ── */}
          {step === 'rejected' && currentRequest && (
            <div style={{ animation: 'cr-msgIn 0.3s ease', textAlign: 'center', padding: '12px 0' }}>
              <div className="cr-success-icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                <svg width="36" height="36" fill="none" stroke="var(--danger)" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </div>
              <div className="cr-success-title">Request Rejected</div>
              <div className="cr-success-sub">
                {existingMessages.filter(m => m.sender === 'ADMIN').pop()?.message || 'Your request could not be approved at this time.'}
              </div>

              <div style={{ marginTop: 12 }}>
                {renderTimeline('REJECTED')}
              </div>

              <button className="cr-btn cr-btn-outline" onClick={onClose} style={{ marginTop: 16 }}>
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="cr-footer">
          <div className="cr-footer-input">
            <input
              type="text"
              placeholder="Type a message..."
              disabled
            />
            <button className="cr-send-btn" disabled>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeRequestChatbot;
