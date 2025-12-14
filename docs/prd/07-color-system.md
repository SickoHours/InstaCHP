# 07 - InstaTCR Color System

> **Version:** 3.0.0 (Light/Dark Theme)
> **Last Updated:** 2025-12-13
> **Related:** [05-component-library.md](05-component-library.md), [06-implementation-guide.md](06-implementation-guide.md)

---

## Overview

InstaTCR uses a dual light/dark theme system with brand colors defined as CSS custom properties. The system supports:

- **Automatic theme detection** from system preferences
- **Manual theme toggle** in header and profile dropdown
- **localStorage persistence** across sessions
- **No flash** of wrong theme on page load

---

## Brand Colors

### Primary Palette

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Brand Navy** | `#1a3c5b` | `brand-navy` | Headers, dark backgrounds, borders |
| **Brand Navy Dark** | `#11283c` | N/A | Dark mode text (on light bg) |
| **Brand Navy Darker** | `#122c45` | N/A | Strong borders |
| **Brand Navy Medium** | `#152f45` | N/A | Active nav background |

### Accent Colors

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Amber 400** | `#fbbf24` | `amber-400` | Primary buttons, accents, active states |
| **Amber 500** | `#f59e0b` | `amber-500` | Hover states, gradients |
| **Amber 300** | `#fcd34d` | `amber-300` | Light accents |

### Decorative Accents

Used for background orbs and visual interest:

| Category | Colors |
|----------|--------|
| **Yellows** | `yellow-300`, `yellow-400`, `yellow-500` |
| **Blues** | `blue-200`, `blue-300`, `blue-400` |
| **Greens** | `green-300`, `green-400` |
| **Purples** | `purple-200`, `purple-400` |

---

## Theme Architecture

### CSS Variables

All colors are defined as CSS custom properties in `globals.css`:

```css
:root {
  /* Brand colors - theme independent */
  --brand-navy: #1a3c5b;
  --accent-primary: #fbbf24;
}

[data-theme="light"] {
  --background: #ffffff;
  --text-primary: #11283c;
  /* ... */
}

[data-theme="dark"] {
  --background: #0a0f1a;
  --text-primary: #f8fafc;
  /* ... */
}
```

### Theme Context

```typescript
import { useTheme } from '@/context/ThemeContext';

function Component() {
  const { theme, toggleTheme, preference } = useTheme();
  // theme: 'light' | 'dark' (resolved)
  // preference: 'light' | 'dark' | 'system'
}
```

### No-Flash Script

An inline script in `layout.tsx` sets the theme before React hydration:

```javascript
(function() {
  var stored = localStorage.getItem('instaTCR_theme');
  var theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
```

---

## Light Mode Specifications

### Backgrounds

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#ffffff` | Main page background |
| `--background-secondary` | `#f0f4f8` | Secondary surfaces, cards |
| `--background-elevated` | `#ffffff` | Modals, dropdowns |

### Text

| Variable | Value | Usage |
|----------|-------|-------|
| `--text-primary` | `#11283c` | Headings, body text |
| `--text-secondary` | `#4b5563` | Secondary text |
| `--text-tertiary` | `#6b7280` | Hints, placeholders |

### Borders

| Variable | Value | Usage |
|----------|-------|-------|
| `--border-default` | `#e5e7eb` | Standard borders |
| `--border-strong` | `#122c45` | Emphasized borders |
| `--border-subtle` | `#f3f4f6` | Subtle dividers |

### Interactive States

| Variable | Value | Usage |
|----------|-------|-------|
| `--hover-bg` | `rgba(251, 191, 36, 0.1)` | Hover backgrounds |
| `--active-bg` | `#f0f4f8` | Active/selected |
| `--focus-ring` | `rgba(251, 191, 36, 0.5)` | Focus indicators |

### Glass Effects (Light Mode)

Light mode uses **solid backgrounds** for main surfaces, glass only for elevated elements:

```css
.glass-surface {
  background: var(--background); /* Solid white */
  backdrop-filter: none;
  border: 1px solid var(--border-default);
  box-shadow: var(--elevation-2);
}

.glass-elevated {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(160%);
}
```

---

## Dark Mode Specifications

### Backgrounds

| Variable | Value | Usage |
|----------|-------|-------|
| `--background` | `#0f172a` | Main page background |
| `--background-secondary` | `#1e293b` | Secondary surfaces |
| `--background-body` | `#0a0f1a` | Body element (darker) |

### Text

| Variable | Value | Usage |
|----------|-------|-------|
| `--text-primary` | `#f8fafc` | Headings, body text |
| `--text-secondary` | `#cbd5e1` | Secondary text |
| `--text-tertiary` | `#94a3b8` | Hints, placeholders |

### Borders

| Variable | Value | Usage |
|----------|-------|-------|
| `--border-default` | `rgba(148, 163, 184, 0.2)` | Standard borders |
| `--border-strong` | `rgba(148, 163, 184, 0.3)` | Emphasized borders |
| `--border-subtle` | `rgba(148, 163, 184, 0.1)` | Subtle dividers |

### Glass Effects (Dark Mode)

Dark mode uses **full glass morphism** with backdrop blur:

```css
.glass-surface {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.glass-elevated {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(24px) saturate(200%);
}
```

### Background Orbs

Dark mode includes animated decorative orbs:

```css
.orb-dark {
  /* Amber orb - top left */
  background: amber-500/20;

  /* Blue orb - right */
  background: blue-600/15;

  /* Slate orb - bottom */
  background: slate-700/25;
}
```

Light mode: **No orbs** (clean white background per user preference).

---

## Status Badge Colors

### Light Mode

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Blue (In Progress) | `#dbeafe` | `#1e40af` | `#93c5fd` |
| Amber (Needs Info) | `#fef3c7` | `#92400e` | `#fcd34d` |
| Green (Completed) | `#d1fae5` | `#065f46` | `#6ee7b7` |
| Red (Cancelled) | `#fee2e2` | `#991b1b` | `#fca5a5` |
| Yellow (Waiting) | `#fef9c3` | `#854d0e` | `#fde047` |

### Dark Mode (Translucent)

| Status | Background | Text | Border |
|--------|------------|------|--------|
| Blue | `rgba(59, 130, 246, 0.2)` | `#93c5fd` | `rgba(59, 130, 246, 0.3)` |
| Amber | `rgba(245, 158, 11, 0.2)` | `#fcd34d` | `rgba(245, 158, 11, 0.3)` |
| Green | `rgba(16, 185, 129, 0.2)` | `#6ee7b7` | `rgba(16, 185, 129, 0.3)` |
| Red | `rgba(239, 68, 68, 0.2)` | `#fca5a5` | `rgba(239, 68, 68, 0.3)` |
| Yellow | `rgba(234, 179, 8, 0.2)` | `#fde047` | `rgba(234, 179, 8, 0.3)` |

---

## Component Color Mapping

### Buttons

| Variant | Light Mode | Dark Mode |
|---------|------------|-----------|
| Primary | `from-amber-400 to-amber-500` | Same |
| Secondary | `border-[var(--border-default)]` | Same |
| Tertiary | `text-amber-500` | Same |
| Focus Ring | `ring-amber-400/50` | Same |

### Inputs

| State | Light Mode | Dark Mode |
|-------|------------|-----------|
| Default | `border-slate-200` | `border-slate-700/50` |
| Focus | `border-amber-500` | `border-amber-500/70` |
| Valid | `border-emerald-500` | `border-emerald-500/70` |
| Error | `border-red-500` | `border-red-500/70` |

### Profile Avatar (User Types)

| User Type | Gradient |
|-----------|----------|
| Law Firm | `from-amber-400 to-amber-600` |
| Staff | `from-violet-500 to-violet-700` |

---

## Elevation System

### Light Mode Shadows

```css
--elevation-1: 0 2px 8px rgba(18, 44, 69, 0.08);
--elevation-2: 0 4px 16px rgba(18, 44, 69, 0.12);
--elevation-3: 0 8px 32px rgba(18, 44, 69, 0.15);
--elevation-4: 0 16px 48px rgba(18, 44, 69, 0.18);
```

### Dark Mode Shadows

```css
--elevation-1: 0 2px 8px rgba(0, 0, 0, 0.15);
--elevation-2: 0 4px 16px rgba(0, 0, 0, 0.2);
--elevation-3: 0 8px 32px rgba(0, 0, 0, 0.25);
--elevation-4: 0 16px 48px rgba(0, 0, 0, 0.3);
```

---

## Accessibility

### Contrast Requirements

All text colors meet **WCAG AAA** (7:1 contrast ratio):

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Body text | `#11283c` on `#ffffff` | `#f8fafc` on `#0a0f1a` |
| Secondary text | `#4b5563` on `#ffffff` | `#cbd5e1` on `#0f172a` |
| Status badges | Solid backgrounds with 800-level text | Translucent with 200-level text |

### Focus Indicators

All interactive elements have visible focus rings:

```css
focus-visible:ring-2 focus-visible:ring-amber-400/50
```

---

## Usage Guidelines

### DO

- Use CSS variables for all theme-aware colors
- Use `var(--text-primary)` instead of hardcoded `#ffffff` or `#000000`
- Test components in both themes
- Use amber-400 for primary accents (buttons, active states)

### DON'T

- Hardcode theme-specific colors
- Use teal (old accent) - use amber instead
- Forget to test both light and dark modes
- Use glass effects on main surfaces in light mode

---

## Migration Notes (V2 → V3)

### Color Changes

| Old (V2) | New (V3) |
|----------|----------|
| `teal-500` | `amber-400` |
| `teal-600` | `amber-500` |
| `teal-700` | `amber-600` |
| `--accent-teal` | `--accent-primary` |
| `--primary-navy: #0f2c59` | `--brand-navy: #1a3c5b` |

### New Files

- `src/context/ThemeContext.tsx` - Theme state management
- `src/components/ui/ThemeToggle.tsx` - Toggle component

### Updated Files

- `src/app/globals.css` - Complete CSS variable refactor
- `src/app/layout.tsx` - Added no-flash script
- `src/app/providers.tsx` - Added ThemeProvider
- All components with teal references

---

## Quick Reference

### ThemeContext Hook

```typescript
const { theme, preference, toggleTheme, setTheme, isSystemPreference } = useTheme();
```

### CSS Variable Usage

```css
/* In Tailwind classes */
className="bg-[var(--background)] text-[var(--text-primary)]"

/* In CSS */
.my-class {
  background: var(--background);
  color: var(--text-primary);
}
```

### Theme Toggle Placement

1. **Header** - `AppShellHeader.tsx` (next to NotificationBell)
2. **Profile Dropdown** - `SidebarProfileCard.tsx` (first menu item)

---

*Last Updated: 2025-12-13*
