# Credify — UI Rules

> Distilled from [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (161 reasoning rules, 99 UX guidelines, 67 UI styles) and tailored for Credify's **Fintech / KYC Identity Verification** domain.

---

## 1. Industry Context & Style Match

| Dimension         | Value                                                            |
|-------------------|------------------------------------------------------------------|
| **Product Type**  | Fintech — KYC / Identity Verification SaaS                      |
| **Recommended Pattern** | Trust & Authority + Feature-Rich Dashboard                |
| **Style Priority**| Minimalism + Accessible & Ethical + Glassmorphism (dark mode)    |
| **Color Mood**    | Navy + Trust Blue + Gold accents — professional, security-first  |
| **Typography Mood**| Professional + Trustworthy + Clear hierarchy                   |
| **Key Effects**   | Smooth state transitions + Number animations + Subtle hover      |
| **Anti-Patterns** | ❌ Playful design · ❌ AI purple/pink gradients · ❌ Unclear security UX |

---

## 2. Navigation Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 1  | **Smooth Scroll**             | `scroll-behavior: smooth` on `<html>`          | Jump directly without transition          |
| 2  | **Sticky Navigation**         | Add padding-top equal to nav height             | Let nav overlap first section content     |
| 3  | **Active State**              | Highlight active nav item with color + border   | No visual feedback on current location    |
| 4  | **Back Button**               | Preserve navigation history properly            | Break browser back button behavior        |
| 5  | **Deep Linking**              | Update URL on state/view changes                | Static URLs for dynamic content           |
| 6  | **Breadcrumbs**               | Use for sites with 3+ levels of depth           | Use for flat single-level sites           |

---

## 3. Animation Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 7  | **Excessive Motion**          | Animate 1–2 key elements per view maximum       | Animate everything that moves             |
| 8  | **Duration Timing**           | Use **150–300ms** for micro-interactions        | Use animations longer than 500ms for UI   |
| 9  | **Reduced Motion** ⚠️         | Check `prefers-reduced-motion` media query      | Ignore accessibility motion settings      |
| 10 | **Loading States**            | Use skeleton screens or spinners                | Leave UI frozen with no feedback          |
| 11 | **Hover vs Tap**              | Use `click/tap` for primary interactions        | Rely only on `hover` for important actions|
| 12 | **Continuous Animation**      | Use for loading indicators only                 | Use for decorative elements               |
| 13 | **Transform Performance**     | Use `transform` and `opacity` for animations    | Animate `width/height/top/left`           |
| 14 | **Easing Functions**          | Use `ease-out` for entering, `ease-in` for exit | Use `linear` for UI transitions           |

### Credify-Specific Animation Tokens

```css
--transition-fast: 160ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-med:  240ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 4. Layout Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 15 | **Z-Index Management**        | Define z-index scale: `10, 20, 30, 50`          | Use arbitrary `z-[9999]`                 |
| 16 | **Overflow Hidden**           | Test all content fits within containers          | Blindly apply `overflow-hidden`          |
| 17 | **Fixed Positioning**         | Account for safe areas and other fixed elements  | Stack multiple fixed elements carelessly |
| 18 | **Content Jumping**           | Reserve space for async content                  | Let images/content push layout around    |
| 19 | **Viewport Units**            | Use `dvh` or account for mobile browser chrome   | Use `100vh` for full-screen mobile       |
| 20 | **Container Width**           | Limit max-width for text content (65–75ch)       | Let text span full viewport width        |

### Credify Z-Index Scale

```
z-0   — Background
z-10  — Cards, default content
z-20  — Dropdowns, tooltips
z-30  — Sticky header, sidebar
z-50  — Modals, overlays
z-200 — Mobile sidebar overlay
z-9999 — Image preview modal (use sparingly)
```

---

## 5. Touch & Mobile Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 22 | **Touch Target Size**         | Minimum **44×44px** touch targets               | Tiny clickable areas (`w-6 h-6`)         |
| 23 | **Touch Spacing**             | Minimum **8px** gap between touch targets        | Tightly packed clickable elements        |
| 25 | **Tap Delay**                 | Use `touch-action: manipulation`                 | Default mobile tap handling              |

---

## 6. Interaction Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 28 | **Focus States** ⚠️           | Visible focus rings on interactive elements      | Remove `outline` without replacement     |
| 29 | **Hover States**              | Change cursor + add subtle visual change         | No hover feedback on clickable elements  |
| 30 | **Active States**             | Add pressed/active state visual change           | No feedback during interaction           |
| 31 | **Disabled States**           | Reduce opacity + change cursor                   | Same style as enabled                    |
| 32 | **Loading Buttons** ⚠️        | Disable button + show loading state              | Allow multiple clicks during processing  |
| 33 | **Error Feedback** ⚠️         | Clear error messages near the problem            | Silent failures with no feedback         |
| 34 | **Success Feedback**          | Show success message or visual change            | Action completes silently                |
| 35 | **Confirmation Dialogs** ⚠️   | Confirm before delete/irreversible actions       | Delete without confirmation              |

---

## 7. Accessibility Rules (WCAG AA Minimum)

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 36 | **Color Contrast** ⚠️         | Minimum **4.5:1** ratio for normal text          | Low contrast text (#999 on white = 2.8:1)|
| 37 | **Color Only** ⚠️             | Use icons/text **in addition** to color          | Red/green only for error/success         |
| 38 | **Alt Text**                  | Descriptive alt text for meaningful images       | Empty or missing alt attributes          |
| 39 | **Heading Hierarchy**         | Use sequential heading levels `h1–h6`            | Skip heading levels or misuse for styling|
| 40 | **ARIA Labels** ⚠️            | `aria-label` for icon-only buttons               | `<button><Icon/></button>` without label |
| 41 | **Keyboard Navigation** ⚠️    | Tab order matches visual order                   | Keyboard traps or illogical tab order    |
| 42 | **Screen Reader**             | Use semantic HTML (`<nav>`, `<main>`, `<article>`)| `<div>` for everything                  |
| 43 | **Form Labels** ⚠️            | Use `<label>` with `for` attribute               | Placeholder-only inputs                 |
| 44 | **Error Messages** ⚠️         | Use `aria-live` or `role="alert"` for errors     | Visual-only error indication             |
| 45 | **Skip Links**                | Provide "skip to main content" link              | 100 tabs to reach content                |

---

## 8. Performance Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 46 | **Image Optimization**        | Use appropriate size and format (WebP)           | Unoptimized full-size images             |
| 47 | **Lazy Loading**              | `loading="lazy"` for below-fold images           | Load everything upfront                  |
| 50 | **Font Loading**              | Use `font-display: swap`                         | Invisible text during font load (FOIT)   |

---

## 9. Forms Rules (Critical for KYC)

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 54 | **Input Labels** ⚠️           | Always show label above or beside input          | Placeholder as only label                |
| 55 | **Error Placement**           | Show error below related input                   | Single error message at top of form      |
| 56 | **Inline Validation**         | Validate on blur for most fields                 | Validate only on submit                  |
| 57 | **Input Types**               | Use `email`, `tel`, `number`, `url`              | `text` input for everything              |
| 59 | **Required Indicators**       | Use asterisk `*` or "(required)" text            | No indication of required fields         |
| 60 | **Password Visibility**       | Toggle to show/hide password                     | Password always hidden                   |
| 61 | **Submit Feedback** ⚠️        | Show loading → success/error state               | No feedback after submit                 |

---

## 10. Responsive Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 64 | **Mobile First**              | Start with mobile styles, then add breakpoints   | Desktop-first causing mobile issues      |
| 65 | **Breakpoint Testing**        | Test at **320, 375, 414, 768, 1024, 1440**       | Only test on your device                 |
| 67 | **Readable Font Size** ⚠️     | Minimum **16px** body text on mobile             | Tiny text on mobile (< 14px)             |
| 68 | **Viewport Meta** ⚠️          | `width=device-width, initial-scale=1`            | Missing viewport meta tag                |
| 69 | **Horizontal Scroll** ⚠️      | Ensure content fits viewport width               | Content wider than viewport              |

### Credify Breakpoints

```
Mobile:    ≤480px   (padding: 12px)
Tablet SM: ≤640px   (padding: 16px)
Tablet:    ≤767px   (sidebar becomes overlay)
Desktop:   ≤1024px  (padding: 20px)
Wide:      >1024px  (padding: 28px)
```

---

## 11. Typography Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 72 | **Line Height**               | Use **1.5–1.75** for body text                   | Cramped or excessive line height         |
| 73 | **Line Length**                | Limit to **65–75 characters** per line           | Full-width text on large screens         |
| 74 | **Font Size Scale**           | Use consistent modular scale                     | Random font sizes                        |
| 76 | **Contrast Readability** ⚠️   | Use darker text on light backgrounds             | Gray text on gray background             |
| 77 | **Heading Clarity**           | Clear size/weight difference from body           | Headings similar to body text            |

---

## 12. Feedback Rules

| #  | Rule                          | Do                                             | Don't                                     |
|----|-------------------------------|------------------------------------------------|-------------------------------------------|
| 78 | **Loading Indicators** ⚠️     | Show spinner/skeleton for operations > 300ms     | Frozen UI                                |
| 79 | **Empty States**              | Show helpful message and action                  | Blank empty screens                      |
| 80 | **Error Recovery**            | Provide clear next steps                         | Error without recovery path              |
| 81 | **Progress Indicators** ⚠️    | Step indicators or progress bar                  | No indication of progress                |
| 82 | **Toast Notifications**       | Auto-dismiss after **3–5 seconds**               | Toasts that never disappear              |

---

## 13. Pre-Delivery Checklist

Before every PR/deployment, verify:

- [ ] No emojis used as functional icons — use SVG icons (Lucide)
- [ ] `cursor: pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Light mode: text contrast **4.5:1** minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive tested at: **375px, 768px, 1024px, 1440px**
- [ ] All buttons have loading states during async operations
- [ ] Destructive actions require confirmation
- [ ] All form inputs have visible labels
- [ ] Error messages appear next to the relevant field
- [ ] Toast notifications auto-dismiss
- [ ] No horizontal scrollbar on any viewport
