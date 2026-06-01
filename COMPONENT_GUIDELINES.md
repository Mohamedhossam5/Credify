# Credify — Component Guidelines

> Component-level implementation patterns derived from [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) adapted for Credify's React + Vite + Vanilla CSS + Lucide stack.

---

## 1. Component Architecture

### File Organization

```
src/
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication & registration
│   ├── register/       # Multi-step KYC onboarding
│   └── shared/         # Reusable shared components
├── pages/
│   ├── admin/          # Admin page views
│   └── auth/           # Auth page views
├── styles/
│   ├── admin.css       # Admin design tokens + components
│   ├── dashboard.css   # Dashboard-specific styles
│   ├── phase2.css      # KYC phase 2 styles
│   └── phase3.css      # KYC phase 3 styles
└── index.css           # Global base styles
```

### Component Rules

1. **One component per file** — each component is a single `.tsx` file
2. **Inline styles sparingly** — prefer CSS classes from `admin.css` / `dashboard.css`
3. **No Tailwind in admin** — admin uses CSS custom properties exclusively
4. **Tailwind in auth/register** — auth pages use Tailwind utility classes
5. **Icons** — always import from `lucide-react`, never use emoji or image icons

---

## 2. Buttons

### Variants

#### Primary Action Button
```css
/* The signature CTA button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-sm); /* 8px */
  border: none;
  background: linear-gradient(135deg, var(--accent), #1d4ed8);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-primary:hover {
  opacity: 0.92;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

#### Destructive / Danger Button
```css
.btn-danger {
  background: rgba(255, 77, 106, 0.1);
  border: 1px solid rgba(255, 77, 106, 0.3);
  color: var(--accent-danger);
  /* same sizing as primary */
}
```

#### Ghost / Outline Button
```css
.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  /* same sizing as primary */
}
.btn-ghost:hover {
  border-color: var(--border-accent);
  color: var(--text-primary);
}
```

### Button States (Mandatory)

| State      | Visual                                              |
|------------|-----------------------------------------------------|
| Default    | Normal appearance                                   |
| Hover      | Slight shadow lift or opacity change                |
| Active     | `transform: scale(0.98)` for tactile feedback       |
| Focused    | `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12)`   |
| Loading    | Disable + replace text with `<Loader2>` spinner     |
| Disabled   | `opacity: 0.6; cursor: not-allowed`                |

### Loading Button Pattern

```tsx
<button
  onClick={handleAction}
  disabled={isLoading}
  style={{
    opacity: isLoading ? 0.6 : 1,
    cursor: isLoading ? 'not-allowed' : 'pointer'
  }}
>
  {isLoading ? (
    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
  ) : (
    <CheckCircle2 size={14} />
  )}
  {isLoading ? 'Processing…' : 'Approve'}
</button>
```

> ⚠️ **Always** disable buttons during async operations. Double-submission in KYC workflows is a critical bug.

---

## 3. Cards

### Base Card

```css
.admin-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg); /* 18px */
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-med), border-color var(--transition-med);
}
.admin-card:hover {
  box-shadow: var(--shadow-card-hover);
}
```

### KPI Stat Card

```css
.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-med),
              transform var(--transition-med),
              border-color var(--transition-med);
  cursor: default;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--border-accent);
}
```

### Card Content Structure

```
┌─ Card ──────────────────────────────┐
│ [Icon]  Title        [Status Badge] │
│         Subtitle / Description      │
│                                     │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                     │
│ Content / Data / Actions            │
└─────────────────────────────────────┘
```

---

## 4. Badges & Status Indicators

### Status Badge

```css
.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
```

### KYC Status → Badge Mapping

| Status                | Badge Class     | Icon          |
|-----------------------|-----------------|---------------|
| `APPROVED`            | `.badge-green`  | `CheckCircle2`|
| `REJECTED`            | `.badge-red`    | `XCircle`     |
| `PENDING_ADMIN_REVIEW`| `.badge-yellow` | `AlertTriangle`|
| `PENDING`             | `.badge-gray`   | `Clock`       |
| `VERIFIED`            | `.badge-blue`   | `ShieldCheck` |

### Face Match Indicator

```tsx
// AI Face Verification Badge
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '8px',
  background: facePassed
    ? 'rgba(0, 232, 143, 0.1)'
    : 'rgba(255, 77, 106, 0.1)',
  border: `1px solid ${facePassed
    ? 'rgba(0, 232, 143, 0.2)'
    : 'rgba(255, 77, 106, 0.2)'}`
}}>
  {facePassed
    ? <ShieldCheck size={13} style={{ color: 'var(--success)' }} />
    : <ShieldAlert size={13} style={{ color: 'var(--danger)' }} />
  }
  <span style={{
    fontSize: '11px',
    fontWeight: 700,
    color: facePassed ? 'var(--success)' : 'var(--danger)'
  }}>
    AI: {facePassed ? 'PASS' : 'FAIL'}
  </span>
</div>
```

> ⚠️ **Never use color alone** to convey pass/fail. Always include text label + icon.

---

## 5. Forms & Inputs

### Input Field

```css
.admin-input {
  height: 38px;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-sm);
  padding: 0 14px;
  font-size: 13px;
  color: var(--text-primary);
  font-family: var(--font-ui);
  outline: none;
  transition: border var(--transition-fast), box-shadow var(--transition-fast);
}
.admin-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
.admin-input::placeholder {
  color: var(--text-muted);
}
```

### Form Field Pattern

```tsx
{/* ✅ Correct: Label + Input + Error */}
<div>
  <label
    htmlFor="rejection-reason"
    style={{
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.8px',
      color: 'var(--text-muted)',
      marginBottom: '4px',
      display: 'block'
    }}
  >
    Rejection Reason *
  </label>
  <input
    id="rejection-reason"
    type="text"
    value={reason}
    onChange={e => setReason(e.target.value)}
    placeholder="e.g., Image blurry, ID expired"
    className="admin-input"
    aria-required="true"
    aria-describedby="reason-error"
  />
  {error && (
    <span
      id="reason-error"
      role="alert"
      style={{ fontSize: '11px', color: 'var(--accent-danger)', marginTop: '4px' }}
    >
      {error}
    </span>
  )}
</div>
```

### KYC File Upload

- Show preview thumbnail after upload
- Display file name, size, and upload timestamp
- Provide clear "Remove" action
- Show progress bar during upload
- Accept specific MIME types (`image/jpeg, image/png, application/pdf`)

---

## 6. Navigation

### Sidebar Nav Item

```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  border: 1px solid transparent;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.nav-item:hover {
  background: var(--bg-base);
  color: var(--text-primary);
}
.nav-item.active {
  background: #eff6ff;
  color: var(--accent);
  border-color: #dbeafe;
  font-weight: 600;
}
```

### Active State Indicator

Every active nav item must have a **left accent bar**:

```css
.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 55%;
  background: var(--accent);
  border-radius: 0 3px 3px 0;
}
```

### Mobile Sidebar

- **Breakpoint**: `≤767px`
- **Behavior**: Full-height overlay from left, `translateX` transition
- **Overlay**: `rgba(0, 0, 0, 0.45)` backdrop
- **Z-index**: Sidebar = 200, Overlay = 199

---

## 7. Modals & Overlays

### Image Preview Modal

```tsx
{/* Full-screen backdrop with blur */}
<div style={{
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
}} onClick={onClose}>
  <div style={{
    maxWidth: '600px',
    width: '90%',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border)'
  }} onClick={e => e.stopPropagation()}>
    {/* Content */}
  </div>
</div>
```

### Modal Rules

- Always include a **close button** (✕) in top-right
- Use `backdrop-filter: blur(8px)` for depth
- Trap focus within modal when open (keyboard accessibility)
- Close on Escape key press
- Close on backdrop click
- Prevent body scroll when modal is open

---

## 8. Data Display

### Table Pattern

```css
/* Responsive table wrapper */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Row-based list (preferred for admin) */
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition-fast);
}
.data-row:hover {
  background: var(--bg-base);
}
.data-row:last-child {
  border-bottom: none;
}
```

### Monospace Data

Use `var(--font-mono)` ("JetBrains Mono") for:

- Email addresses
- Phone numbers
- User IDs
- Face match scores
- Timestamps
- Transaction amounts
- File names

```tsx
<span style={{
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '12px'
}}>
  {user.email}
</span>
```

---

## 9. Expandable / Accordion Pattern

Used in KYC review cards for progressive disclosure:

```
┌─ Header Row (always visible) ─────────────────────┐
│ [Avatar] Name · Email     [AI Badge] [Status] [▼]  │
├─ Expanded Content (toggle) ────────────────────────┤
│ Phone | Gender | Registered                        │
│ ── AI Face Verification Report ──                  │
│ [ID Front] [ID Back] [Selfie] [Proof of Address]   │
│ [✓ Approve]  [✗ Reject]                            │
│   └─ Rejection reason input (conditional)          │
└────────────────────────────────────────────────────┘
```

### Implementation Rules

- Chevron rotates 180° on expand (`transform: rotate(180deg)`)
- Transition: `transform 0.2s ease`
- Expanded section has `border-top: 1px solid var(--border)`
- Only one card expanded at a time (optional — current behavior)

---

## 10. Toast Notifications

Using `react-hot-toast`:

| Type    | Pattern                              | Duration |
|---------|--------------------------------------|----------|
| Success | `toast.success('✓ KYC approved')`    | 3–5s     |
| Error   | `toast.error('Failed to approve')`   | 5s       |
| Info    | `toast('Processing...')`             | Auto     |

### Rules

- Auto-dismiss after 3–5 seconds
- Show on important user actions (approve, reject, submit)
- Never show toasts for routine data loading
- Position: top-center (default)

---

## 11. Responsive Patterns

### Breakpoint Behavior Summary

| Breakpoint | Sidebar          | Content Padding | Grid Columns    | Typography      |
|------------|------------------|-----------------|-----------------|-----------------|
| `>1200px`  | 220px expanded   | 28px            | Full grid       | 22px titles     |
| `≤1200px`  | 220px expanded   | 28px            | 3-col KPIs      | 22px titles     |
| `≤1024px`  | 220px expanded   | 20px            | 3-col KPIs      | 22px titles     |
| `≤900px`   | 220px expanded   | 20px            | 2-col KPIs      | 22px titles     |
| `≤767px`   | Overlay (hidden) | 16px            | 2-col KPIs      | 18px titles     |
| `≤640px`   | Overlay (hidden) | 16px            | 2-col KPIs      | 18px titles     |
| `≤480px`   | Overlay (hidden) | 12px            | 1-col KPIs      | 16px titles     |
| `≤360px`   | Overlay (hidden) | 12px            | 1-col           | 16px titles     |

### Mobile-Specific Rules

- Hamburger menu button visible at `≤767px`
- Search bar max-width reduces at `≤640px` (180px) and `≤400px` (130px)
- Live pill indicator hidden at `≤520px`
- Topbar gap reduces at `≤480px`

---

## 12. Accessibility Checklist (Per Component)

Every component must satisfy:

- [ ] All interactive elements have `cursor: pointer`
- [ ] All buttons have visible focus states (`:focus-visible`)
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages use `role="alert"` or `aria-live="polite"`
- [ ] Color is never the sole indicator of state
- [ ] Touch targets are ≥ 44×44px on mobile
- [ ] Text contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Keyboard tab order matches visual order

---

## 13. Component Naming Conventions

| Type             | CSS Class Prefix  | Example                      |
|------------------|-------------------|------------------------------|
| Layout           | `admin-`          | `admin-card`, `admin-body`   |
| Navigation       | `nav-`            | `nav-item`, `nav-badge`      |
| Data Display     | `kpi-`, `feed-`   | `kpi-card`, `feed-item`      |
| Status           | `badge-`, `trend-`| `badge-green`, `trend-up`    |
| Alerts           | `alert-`          | `alert-row`                  |
| Timeline         | `timeline-`       | `timeline-item`, `timeline-dot` |
| Actions          | `btn-`, `kyc-`    | `btn-auth`, `kyc-action-btn` |
| Notification     | `notif-`          | `notif-dropdown`, `notif-item` |
