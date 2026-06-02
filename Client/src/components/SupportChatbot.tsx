import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

const f = '"Inter",sans-serif';
const mono = '"JetBrains Mono", monospace';

const faqs = [
  {
    id: 'faq-1',
    question: "Lost device / freeze card",
    text: "I lost my registered device, how can I securely access my account or temporarily freeze my cards?",
    answer: "If you've lost your device, don't worry! You can instantly freeze all cards via our SMS quick-action portal (text 'FREEZE' to 1603) or by logging in from a secure desktop web session. Our security system will restrict withdrawals until you complete biometric verification on your new device."
  },
  {
    id: 'faq-2',
    question: "Transaction fees info",
    text: "Are there any transaction fees when sending money or transferring funds to external bank accounts?",
    answer: "Internal transfers between Credify users are 100% free! External transfers to local banks incur a flat 0.5% network fee (capped at 50 EGP). For international transfers, we utilize real-time wholesale interbank exchange rates with zero hidden markups."
  },
  {
    id: 'faq-3',
    question: "Generate virtual card",
    text: "Can I instantly generate a virtual debit card for online purchases, and how do spend limits work?",
    answer: "Absolutely! Go to 'Cards & Accounts' and click '+ Add New' -> 'Virtual Card'. You can instantly generate one for online purchases, set custom spending caps, or create a 'burnable' single-use card that automatically destroys itself after a transaction."
  },
  {
    id: 'faq-4',
    question: "Upgrade limits & verification",
    text: "My daily transaction limit is currently capped. How can I upgrade my account verification tier?",
    answer: "To upgrade your transaction limits, you simply need a quick KYC update. Go to your Profile and upload a valid national ID or proof of address. Our compliance team reviews these in under 15 minutes, unlocking tier-2 limits up to 250,000 EGP daily."
  },
  {
    id: 'faq-5',
    question: "Dispute a transaction",
    text: "I noticed an unfamiliar transaction on my account. How do I dispute a charge?",
    answer: "Safety first! If you see a charge you don't recognize, immediately click on that transaction in your History page and press 'Dispute Transaction'. This instantly freezes the funds and opens a secure priority ticket with our 24/7 fraud dispute team."
  },
  {
    id: 'faq-6',
    question: "Customize dashboard views",
    text: "Can I customize my dashboard view to prioritize specific accounts or currency charts?",
    answer: "Yes! At the top of your Dashboard page, click 'Customize Layout'. You can drag-and-drop widgets, hide specific currency trends, or pin your most frequent transfer beneficiaries right to the quick-actions bar for a personalized experience."
  }
];

const SupportChatbot: React.FC = () => {
  const { user } = useAuthStore();
  const isSettingsPage = window.location.pathname.includes('/settings');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLauncherPulse, setIsLauncherPulse] = useState(true);

  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'system'; text: string; timestamp: Date }>>([
    {
      id: 'welcome',
      sender: 'system',
      text: `Hello ${user?.firstName || 'Ahmed'}! 👋 Welcome to Credify Priority Support. Click one of the quick questions below, or type a custom message to chat with our smart support assistant!`,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  // Removed automatic tooltip as per user request ("it sarts only if i click on it")
  
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isChatOpen]);

  const handleFaqClick = (faqText: string, faqAnswer: string) => {
    const userMsgId = `msg-user-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: faqText,
        timestamp: new Date()
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          text: faqAnswer,
          timestamp: new Date()
        }
      ]);
    }, 800);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsgId = `msg-user-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: userText,
        timestamp: new Date()
      }
    ]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const query = userText.toLowerCase();
      let replyText = "";

      if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
        replyText = `Hi ${user?.firstName || 'there'}! 👋 How can I help you with your Credify dashboard today? You can ask me about card freezes, transaction fees, limits, or how to customize your widgets.`;
      } else if (query.includes('fee') || query.includes('charge') || query.includes('cost') || query.includes('price')) {
        replyText = "We keep our pricing fully transparent! Internal Credify transfers are 100% free of charge. External local transfers cost a flat 0.5% (capped at 50 EGP), and FX rates match the wholesale market rates with zero markups.";
      } else if (query.includes('freeze') || query.includes('lost') || query.includes('stolen') || query.includes('card')) {
        replyText = "If your card is lost or stolen, you can lock it immediately from the 'Cards & Accounts' section or by texting 'FREEZE' to 1603 from your registered phone number. This instantly stops all withdrawals.";
      } else if (query.includes('password') || query.includes('security') || query.includes('reset') || query.includes('2fa')) {
        replyText = "You can update your security settings, change your login password, or enable biometric login and Two-Factor Authentication right in the 'Security' section located directly above this support chat!";
      } else if (query.includes('limit') || query.includes('kyc') || query.includes('tier') || query.includes('verify')) {
        replyText = "To increase your daily transfer limits, navigate to your profile KYC section to upload an updated National ID or proof of address. Verification is processed by our compliance team in under 15 minutes!";
      } else if (query.includes('contact') || query.includes('human') || query.includes('agent') || query.includes('support') || query.includes('phone') || query.includes('call')) {
        replyText = "Need human assistance? Our 24/7 priority support team is always active! You can contact us instantly at admin@credify.com or place a priority direct call to our support hotline at 02 27570574.";
      } else {
        replyText = "That is a great question! While I'm simulating our conversational AI Assistant, you can instantly resolve this or get custom guidance from our official support team at admin@credify.com or via hot-line at 02 27570574. Would you like me to help you with card freezes, limits, or fees instead?";
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-sys-${Date.now()}`,
          sender: 'system',
          text: replyText,
          timestamp: new Date()
        }
      ]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => {
      const nextState = !prev;
      if (nextState) {
        setMessages([
          {
            id: 'welcome',
            sender: 'system',
            text: `Hello ${user?.firstName || 'Ahmed'}! 👋 Welcome to Credify Priority Support. Click one of the quick questions below, or type a custom message to chat with our smart support assistant!`,
            timestamp: new Date()
          }
        ]);
      }
      return nextState;
    });
    setShowTooltip(false);
    setIsLauncherPulse(false);
  };

  return (
    <>
      {/* Welcome Tooltip & Launcher (Floating fixed at the bottom-right of the screen) */}
      {!isChatOpen && (
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: (isHovered && !isSettingsPage) ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {showTooltip && (
            <div
              className="chat-welcome-tooltip-inline"
              onClick={toggleChat}
              style={{
                background: 'linear-gradient(135deg, var(--teal), var(--blue))',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.25)',
                cursor: 'pointer',
                position: 'relative',
                animation: 'tooltip-pulse 2s infinite ease-in-out',
                whiteSpace: 'nowrap'
              }}
            >
              Need help? Ask me anything.
              <div style={{
                content: "''",
                position: 'absolute',
                top: '50%',
                right: '-4px',
                transform: 'translateY(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                background: 'var(--blue)'
              }} />
            </div>
          )}

          <button
            className={`chat-launcher-inline ${isLauncherPulse ? 'pulse-active' : ''}`}
            onClick={toggleChat}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              outline: 'none',
              zIndex: 10000
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleChat();
              }
            }}
            aria-label="Toggle support chat"
            aria-expanded={isChatOpen}
            tabIndex={0}
          >
            <img
              src="/logos/icons8-chatbot.gif"
              alt="Support Assistant"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                borderRadius: '50%'
              }}
            />
          </button>
        </div>
      )}

      {/* Expanded Floating Chat Panel */}
      {isChatOpen && (
        <div
          className="glass-card global-support-chatbot"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '380px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadein 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
            padding: '24px',
            zIndex: 10000,
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(14, 203, 203, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src="/logos/icons8-chatbot.gif" alt="Support Chatbot" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: f, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Help & Support
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                Online • 24/7 Virtual Assistant
              </div>
            </div>
            {/* Close Button in header */}
            <button
              onClick={toggleChat}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              aria-label="Close chat"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Message History */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              marginBottom: '16px'
            }}
            className="chat-messages-container"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadein 0.25s cubic-bezier(0.16, 1, 0.3, 1) both'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '11px 15px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--teal), var(--blue))' : 'var(--navy-mid)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  fontSize: '13px',
                  lineHeight: '1.45',
                  boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(99, 102, 241, 0.15)' : 'none',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)'
                }}>
                  {msg.text}
                  <div style={{
                    fontSize: '9px',
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                    textAlign: 'right',
                    marginTop: '4px',
                    fontFamily: mono
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {/* Animated Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadein 0.2s ease both' }}>
                <div style={{
                  background: 'var(--navy-mid)',
                  padding: '10px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                  <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                  <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQs Pill Buttons */}
          <div style={{
            padding: '0 0 12px 0',
            background: 'transparent'
          }}>
            <div style={{ fontSize: '10.5px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.8px', marginBottom: '8px', fontFamily: f }}>
              Quick Questions
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto' }} className="chat-messages-container">
              {faqs.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleFaqClick(faq.text, faq.answer)}
                  className="faq-pill-btn"
                  style={{
                    background: 'var(--navy-mid)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    padding: '7px 12px',
                    fontSize: '11.5px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: f,
                    fontWeight: 500
                  }}
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              paddingTop: '12px',
              borderTop: '1px solid var(--glass-border)',
              background: 'transparent',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Type a custom message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--navy-mid)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                fontFamily: f,
                transition: 'border-color 0.2s'
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: chatInput.trim() ? 'linear-gradient(135deg, var(--teal), var(--blue))' : 'var(--navy-mid)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s ease',
                color: chatInput.trim() ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
      <style>{`
        @media (max-width: 767px) {
          .global-support-chatbot {
            bottom: auto !important;
            right: auto !important;
            top: 54% !important;
            left: 50% !important;
            transform: translate(-50%, -46%) !important;
            width: 92% !important;
            max-width: 380px !important;
            height: 82% !important;
            max-height: 565px !important;
            border-radius: 20px !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </>
  );
};

export default SupportChatbot;
