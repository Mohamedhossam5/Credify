# Credify — Design System

> Comprehensive design tokens and visual identity for Credify, a **Fintech / KYC Identity Verification** platform.  
> Generated from [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) reasoning engine (Fintech #14 + Banking #42 + Financial Dashboard #6).

---

## 1. Design Philosophy

**"Security through clarity."**

Credify is a KYC verification platform. Every design choice must communicate **trust, professionalism, and security**. The interface should feel like a premium banking app — not a social media tool.

### Core Principles

| Principle            | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| **Trust-First**      | Navy/blue tones, clean layouts, visible security indicators                |
| **Data Clarity**     | Numbers and statuses must be instantly scannable                           |
| **Progressive Disclosure** | Show only what's needed at each step (critical for KYC onboarding)  |
| **Accessible**       | WCAG AA minimum — form-heavy KYC flows demand high readability            |
| **Professional**     | No playful colors, no gamification — financial credibility                 |

### Design DNA

- **Style**: Minimalism + Glassmorphism (dark mode) + Accessible & Ethical
- **Mood**: Precise, secure, institutional but modern
- **Influence**: Linear app, Stripe Dashboard, Plaid, Wise

---

## 2. Color System

### Light Theme (`:root`)

| Token                | Value                      | Usage                                |
|----------------------|----------------------------|--------------------------------------|
| `--bg-base`          | `#f0f4f9`                  | Page background                      |
| `--bg-surface`       | `#ffffff`                  | Sidebar, topbar, elevated surfaces   |
| `--bg-card`          | `#ffffff`                  | Card backgrounds                     |
| `--bg-card-hover`    | `#f8fafd`                  | Card hover state                     |
| `--bg-input`         | `rgba(0, 0, 0, 0.04)`     | Input field backgrounds              |
| `--border`           | `#e4eaf3`                  | Default borders                      |
| `--border-accent`    | `rgba(37, 99, 235, 0.22)`  | Accent borders (focus, active)       |
| `--border-input`     | `#d8e2ef`                  | Input borders                        |
| `--text-primary`     | `#0d1829`                  | Primary text                         |
| `--text-secondary`   | `#4a5e7a`                  | Secondary text, descriptions         |
| `--text-muted`       | `#9aabb8`                  | Tertiary text, placeholders          |
| `--accent`           | `#2563eb`                  | Primary actions, links, active states |
| `--accent-2`         | `#7c3aed`                  | Secondary accent (purple)            |
| `--accent-3`         | `#059669`                  | Success, verified, approved          |
| `--accent-danger`    | `#dc2626`                  | Errors, rejected, destructive        |
| `--accent-warn`      | `#d97706`                  | Warnings, pending review             |
| `--accent-gold`      | `#b45309`                  | Premium, certificates                |

### Dark Theme (`[data-theme="dark"]`)

| Token                | Value                      | Usage                                |
|----------------------|----------------------------|--------------------------------------|
| `--bg-base`          | `#0a1128`                  | Page background (deep navy)          |
| `--bg-surface`       | `#0f1a3a`                  | Elevated surfaces                    |
| `--bg-card`          | `rgba(255, 255, 255, 0.04)`| Card backgrounds (translucent)       |
| `--bg-card-hover`    | `rgba(255, 255, 255, 0.07)`| Card hover state                     |
| `--text-primary`     | `#eaf1ff`                  | Primary text                         |
| `--text-secondary`   | `#7b8fad`                  | Secondary text                       |
| `--text-muted`       | `#3e5068`                  | Muted text                           |
| `--accent`           | `#5bc8f5`                  | Primary accent (lighter blue)        |
| `--accent-2`         | `#9d7ef5`                  | Secondary accent (lighter purple)    |
| `--accent-3`         | `#2fd4a0`                  | Success states                       |
| `--accent-danger`    | `#f77070`                  | Error states                         |
| `--accent-warn`      | `#f9be3f`                  | Warning states                       |

### Semantic Color Mappings

```
KYC Status Colors:
  APPROVED        → --accent-3    (#059669 / #2fd4a0)
  REJECTED        → --accent-danger (#dc2626 / #f77070)
  PENDING_REVIEW  → --accent-warn  (#d97706 / #f9be3f)
  PENDING         → --text-muted   (#9aabb8 / #3e5068)

Face Match:
  PASS (score ≥ threshold) → --accent-3
  FAIL (score < threshold) → --accent-danger

Risk Levels:
  Low    → --accent-3
  Medium → --accent-warn
  High   → --accent-danger
  Critical → --accent-danger (with pulsing animation)
```

### Badge Color Variants

| Variant  | Light BG        | Light Text | Dark BG                          | Dark Text  |
|----------|-----------------|------------|----------------------------------|------------|
| Green    | `#d1fae5`       | `#065f46`  | `rgba(5, 150, 105, 0.15)`       | `#34d399`  |
| Red      | `#fee2e2`       | `#991b1b`  | `rgba(220, 38, 38, 0.15)`       | `#f87171`  |
| Yellow   | `#fef3c7`       | `#92400e`  | `rgba(217, 119, 6, 0.15)`       | `#fbbf24`  |
| Blue     | `#dbeafe`       | `#1e40af`  | `rgba(37, 99, 235, 0.15)`       | `#93c5fd`  |
| Purple   | `#ede9fe`       | `#5b21b6`  | `rgba(124, 58, 237, 0.15)`      | `#c4b5fd`  |
| Gray     | `#f1f5f9`       | `#64748b`  | `rgba(100, 116, 139, 0.15)`     | `#94a3b8`  |

---

## 3. Typography System

### Font Stack

| Role       | Family                           | Usage                        |
|------------|----------------------------------|------------------------------|
| **UI**     | `"Plus Jakarta Sans", sans-serif`| All interface text           |
| **Mono**   | `"JetBrains Mono", monospace`    | Data, IDs, scores, timestamps|
| **Logo**   | `"Inter", sans-serif` (800)      | Brand wordmark only          |

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type Scale

| Level          | Size   | Weight | Tracking     | Usage                              |
|----------------|--------|--------|--------------|------------------------------------|
| **Page Title** | 22px   | 800    | -0.4px       | Page headings (e.g., "KYC Verification") |
| **Section**    | 12px   | 700    | 0.5px (UPPER)| Section headers ("PREVIOUSLY REVIEWED")  |
| **Card Title** | 14px   | 700    | normal       | Card headings, names               |
| **Body**       | 14px   | 500    | normal       | Default interface text             |
| **Subtitle**   | 12.5px | 500    | normal       | Page subtitles, descriptions       |
| **Label**      | 11px   | 700    | 0.8–1.4px (UPPER) | Field labels, meta labels     |
| **Badge**      | 10–11px| 600–700| normal       | Status badges, tags                |
| **Micro**      | 9.5px  | 700    | normal       | Nav badges, notification counts    |
| **Mono Data**  | 12–13px| 400–500| normal       | Emails, IDs, timestamps, scores    |

### Responsive Title Scale

```
Desktop (>640px):  22px
Tablet  (≤640px):  18px
Mobile  (≤400px):  16px
```

---

## 4. Spacing & Layout

### Spacing Scale (4px base unit)

| Token  | Value  | Usage                            |
|--------|--------|----------------------------------|
| `xs`   | 2px    | Badge padding, tight gaps        |
| `sm`   | 4px    | Icon gaps                        |
| `md`   | 8px    | Between related elements         |
| `lg`   | 12px   | Between sections in a card       |
| `xl`   | 16px   | Between cards, section breaks    |
| `2xl`  | 20px   | Page padding (tablet)            |
| `3xl`  | 24px   | Page header margin-bottom        |
| `4xl`  | 28px   | Page padding (desktop)           |
| `5xl`  | 32px   | Major section breaks             |
| `6xl`  | 48px   | Hero-level spacing               |

### Layout Dimensions

| Token                | Value   | Usage                  |
|----------------------|---------|------------------------|
| `--sidebar-w`        | `220px` | Sidebar width          |
| `--sidebar-collapsed-w` | `64px` | Collapsed sidebar   |
| `--topbar-h`         | `64px`  | Top bar height         |

### Responsive Content Padding

```
≤480px:  12px
≤767px:  16px
≤1024px: 20px
>1024px: 28px
```

### Responsive Grid System

```css
/* KPI Cards — 5 columns desktop, collapses gracefully */
.grid-5 {
  >1200px:  5 columns
  ≤1200px:  3 columns
  ≤900px:   2 columns
  ≤480px:   1 column
}

/* Two-panel layouts */
.grid-2 {
  >900px:   2 columns (1fr 1fr)
  ≤900px:   1 column
}
```

---

## 5. Border Radius Scale

| Token         | Value  | Usage                               |
|---------------|--------|-------------------------------------|
| `--radius-sm` | 8px    | Buttons, inputs, nav items          |
| `--radius-md` | 12px   | Alert rows, small cards             |
| `--radius-lg` | 18px   | Cards, dropdowns, modals            |
| `--radius-xl` | 22px   | Large feature cards                 |
| `pill`        | 999px  | Badges, search input, tags          |
| `circle`      | 50%    | Avatars, status dots                |

---

## 6. Shadows & Elevation

| Token                | Value                                              | Usage               |
|----------------------|----------------------------------------------------|---------------------|
| `--shadow-card`      | `0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)` | Default cards |
| `--shadow-card-hover`| `0 4px 20px rgba(37,99,235,0.1)`                   | Card hover state    |
| `--shadow-sidebar`   | `2px 0 12px rgba(0,0,0,0.04)`                      | Sidebar             |
| Modal shadow         | `0 8px 40px rgba(0,0,0,0.12)`                      | Dropdowns, modals   |

### Dark Mode Shadows

```css
[data-theme="dark"] {
  --shadow-card:    0 2px 16px rgba(0, 0, 0, 0.28);
  --shadow-sidebar: 2px 0 16px rgba(0, 0, 0, 0.3);
}
```

---

## 7. Motion & Transitions

### Timing Tokens

| Token              | Value                                 | Usage                    |
|--------------------|---------------------------------------|--------------------------|
| `--transition-fast`| `160ms cubic-bezier(0.4, 0, 0.2, 1)` | Hover, focus, toggles    |
| `--transition-med` | `240ms cubic-bezier(0.4, 0, 0.2, 1)` | Card transitions, shadows|

### Animation Guidelines

| Animation            | Duration | Easing                          | Usage                    |
|----------------------|----------|---------------------------------|--------------------------|
| Hover color change   | 160ms    | `cubic-bezier(0.4, 0, 0.2, 1)` | Nav items, buttons       |
| Card lift            | 240ms    | `cubic-bezier(0.4, 0, 0.2, 1)` | KPI cards `translateY(-2px)` |
| Dropdown open        | 180ms    | `ease`                          | Notification dropdown    |
| Fade up entrance     | 240ms    | `ease`                          | Page content, lists      |
| Pulse (live dot)     | 1800ms   | linear, infinite                | Status indicators        |
| Spin (loading)       | 1000ms   | linear, infinite                | Loader icons             |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Iconography

| Property     | Value                                        |
|--------------|----------------------------------------------|
| **Library**  | `lucide-react`                               |
| **Default Size** | 14–18px                                 |
| **Stroke Width** | 2px (default)                            |
| **Color**    | Inherits from parent `color` property        |
| **Touch Padding** | Min 8px around icon-only buttons        |

### Icon Usage Rules

- ✅ Use SVG icons from Lucide for all functional icons
- ✅ Add `aria-label` to all icon-only buttons
- ❌ Never use emojis as functional icons
- ❌ Never rely on icon alone to convey meaning — pair with text or tooltip

---

## 9. Fintech Anti-Patterns (Never Do)

Based on UI reasoning rule #14 (Fintech/Crypto) and #42 (Banking):

| Anti-Pattern                          | Why it's wrong                                       |
|---------------------------------------|------------------------------------------------------|
| Playful/casual design                 | Destroys credibility for financial products          |
| AI purple/pink gradients              | Looks like consumer social, not financial security   |
| Unclear fees or status                | Regulatory and trust issue                           |
| Dark mode as default without toggle   | Users expect light mode for financial data review    |
| No loading states on transactions     | Users panic without feedback on money operations     |
| Color-only status indicators          | Accessibility failure — always pair with text/icon   |
| Tiny touch targets in forms           | KYC forms are long — every input must be comfortable |
| Silent failures                       | Users must always know if an action succeeded/failed |
