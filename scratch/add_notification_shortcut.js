const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'Client', 'src', 'components', 'layout', 'DashboardNavbar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Declare state for hover/focus of the bell
const targetStateDecl = `const [isNotifOpen, setIsNotifOpen] = useState(false);`;
const replacementStateDecl = `const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBellHovered, setIsBellHovered] = useState(false);`;

if (content.includes(targetStateDecl)) {
  content = content.replace(targetStateDecl, replacementStateDecl);
}

// 2. Inject global G -> N keyboard shortcut handler
const targetCloseDropdownHook = `  // ── Close notification dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);`;

const replacementCloseDropdownHook = `  // ── Close notification dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  // ── Keyboard shortcut G -> N to toggle notifications ──
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      const key = e.key.toLowerCase();
      const now = Date.now();

      if (lastKey === 'g' && key === 'n' && (now - lastKeyTime < 1000)) {
        setIsNotifOpen((prev) => !prev);
        lastKey = '';
      } else if (key === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
      } else {
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);`;

if (content.includes(targetCloseDropdownHook)) {
  content = content.replace(targetCloseDropdownHook, replacementCloseDropdownHook);
}

// 3. Update the notification bell element to add focus handlers and render the premium hotkey tooltip
const targetBellElement = `        {/* ── Notification Bell with Dropdown ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div
            className="icon-btn"
            style={{ position: 'relative', color: 'var(--text-primary)', cursor: 'pointer' }}
            onClick={handleNotifToggle}
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>
            )}
          </div>`;

const replacementBellElement = `        {/* ── Notification Bell with Dropdown ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div
            className="icon-btn"
            style={{ position: 'relative', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}
            onClick={handleNotifToggle}
            onMouseEnter={() => setIsBellHovered(true)}
            onMouseLeave={() => setIsBellHovered(false)}
            onFocus={() => setIsBellHovered(true)}
            onBlur={() => setIsBellHovered(false)}
            tabIndex={0}
            aria-label="Notifications"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            {unreadCount > 0 && (
              <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>
            )}
          </div>

          {/* ── Premium Hotkey Shortcut Tooltip ── */}
          {isBellHovered && !isNotifOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: '0',
              background: 'rgba(23, 28, 41, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              animation: 'tooltipSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff', fontFamily: 'var(--font-primary)' }}>
                {unreadCount > 0 ? \`You have \${unreadCount} unread notification\${unreadCount > 1 ? 's' : ''}\` : 'You have no unread notifications'}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <kbd style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}>G</kbd>
                <kbd style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}>N</kbd>
              </div>
              <style>{\`
                @keyframes tooltipSlideIn {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              \`}</style>
            </div>
          )}`;

if (content.includes(targetBellElement)) {
  content = content.replace(targetBellElement, replacementBellElement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('[Notification Shortcut Injection] Finished running successfully!');
