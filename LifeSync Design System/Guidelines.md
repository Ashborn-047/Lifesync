# LifeSync AI Design System Guidelines

**Version:** 2.0.0 (Ashborn Edition)  
**Designer:** Ashborn — Ui/Ux Designer  
**Last Updated:** November 28, 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Iconography](#iconography)
8. [Motion & Animation](#motion--animation)
9. [Accessibility](#accessibility)
10. [Theme Implementation](#theme-implementation)
11. [Code Standards](#code-standards)
12. [File Organization](#file-organization)
13. [Contribution Guidelines](#contribution-guidelines)

---

## Introduction

The LifeSync AI Design System is a comprehensive, multi-platform design system built for a productivity and self-improvement platform. It serves four core modules:

- **MindMesh** - Mind mapping and brainstorming
- **BudgetBuddy** - Personal finance tracking
- **CareerCompass** - Skill development and career growth
- **AutoPersona** - Personality insights and analytics

### Purpose

This design system ensures:
- **Consistency** across all LifeSync AI products
- **Efficiency** in design and development workflows
- **Scalability** for future features and platforms
- **Accessibility** for all users regardless of ability

### Audience

These guidelines are for:
- Product designers creating new features
- Developers implementing designs
- Product managers defining requirements
- QA teams ensuring quality standards

---

## Design Principles

### 1. Clarity Over Cleverness

**Prioritize user understanding above all else.**

- Use clear, descriptive labels
- Avoid unnecessary animations or decorative elements
- Present information in digestible chunks
- Maintain visual hierarchy

✅ **Do:** Use "Save Changes" as a button label  
❌ **Don't:** Use "Commit" or obscure terminology

### 2. Consistency Breeds Familiarity

**Patterns should be predictable and reusable.**

- Use the same components for similar actions
- Maintain consistent spacing throughout the app
- Apply colors semantically, not arbitrarily
- Keep navigation patterns uniform

✅ **Do:** Use the primary button variant for main actions across all modules  
❌ **Don't:** Create custom button styles for each feature

### 3. Accessibility is Non-Negotiable

**Design for everyone from the start.**

- Ensure 4.5:1 color contrast for all text
- Support keyboard navigation
- Provide alternative text for images
- Test with screen readers

✅ **Do:** Test every component in both light and dark modes  
❌ **Don't:** Assume all users can see low-contrast text

### 4. Performance Matters

**Fast experiences feel better.**

- Minimize animation duration
- Use lightweight icons (Lucide React)
- Leverage CSS variables over runtime styles
- Optimize images and assets

✅ **Do:** Use 200ms transitions for standard interactions  
❌ **Don't:** Create 1-second animations for every hover state

### 5. Mobile-First, Platform-Agnostic

**Design for the smallest screen first, then scale up.**

- Touch targets minimum 44x44px
- Responsive layouts using breakpoints
- Progressive enhancement
- Platform-specific patterns when needed

✅ **Do:** Design mobile layouts first, then adapt for desktop  
❌ **Don't:** Create desktop-only features without mobile consideration

---

## Color System

### Token Architecture

The LifeSync color system uses three layers:

#### 1. Palette Tokens (Foundation)
Raw color values that never change between themes.

```json
{
  "primary": {
    "50": "#EFF6FF",
    "500": "#3B82F6",
    "900": "#1E3A8A"
  }
}
```

#### 2. Semantic Tokens (Purpose)
Meaningful references to palette tokens.

```json
{
  "text": {
    "primary": "neutral.900",
    "link": "primary.600"
  }
}
```

#### 3. Mode Tokens (Theme-Aware)
Values that change in light vs. dark mode.

```css
:root {
  --text-primary: #0F172A;
}

[data-theme="dark"] {
  --text-primary: #F8FAFC;
}
```

### Color Usage Rules

#### Text Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--text-primary` | #0F172A | #F8FAFC | Main headings, body text |
| `--text-secondary` | #475569 | #CBD5E1 | Supporting text, labels |
| `--text-tertiary` | #94A3B8 | #64748B | Captions, placeholders |
| `--text-inverse` | #F8FAFC | #0F172A | Text on colored backgrounds |

#### Background Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | #F8FAFC | #0D0F14 | Main app background |
| `--surface` | #FFFFFF | #151821 | Cards, panels, modals |
| `--surface-elevated` | #FFFFFF | #1E293B | Dropdowns, tooltips |

#### Border Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--border` | #E2E8F0 | #334155 | Default borders |
| `--border-subtle` | #F1F5F9 | #1E293B | Dividers, separators |

### Module Colors

Each module has a signature color:

| Module | Icon | Primary Color | Gradient |
|--------|------|---------------|----------|
| **MindMesh** | Brain | `#3B82F6` (Blue) | Blue → Indigo |
| **BudgetBuddy** | Wallet | `#22C55E` (Green) | Green → Emerald |
| **CareerCompass** | Compass | `#8B5CF6` (Purple) | Purple → Pink |
| **AutoPersona** | Target | `#F97316` (Orange) | Orange → Amber |

**Usage:** Apply module colors to:
- Module headers and navigation
- Status indicators related to that module
- Charts and data visualizations
- Feature highlights

❌ **Don't:** Mix module colors arbitrarily or use them for unrelated features

### Color Contrast Requirements

All color combinations must meet WCAG 2.1 Level AA standards:

- **Normal text (under 18pt):** 4.5:1 minimum
- **Large text (18pt+ or 14pt+ bold):** 3:1 minimum
- **UI components:** 3:1 minimum

**Testing:** Use tools like:
- WebAIM Contrast Checker
- Figma plugins (Stark, Contrast)
- Browser DevTools (Chrome Lighthouse)

---

## Typography

### Font Families

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, monospace;
```

**Why system fonts?**
- Instant loading (no web font downloads)
- Optimal readability for each platform
- Reduced bandwidth and better performance

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `xs` | 0.75rem (12px) | 1rem | Captions, labels |
| `sm` | 0.875rem (14px) | 1.25rem | Secondary text |
| `base` | 1rem (16px) | 1.5rem | Body text (default) |
| `lg` | 1.125rem (18px) | 1.75rem | Subheadings |
| `xl` | 1.25rem (20px) | 1.75rem | Section titles |
| `2xl` | 1.5rem (24px) | 2rem | Page titles |
| `3xl` | 1.875rem (30px) | 2.25rem | Hero headings |
| `4xl` | 2.25rem (36px) | 2.5rem | Marketing headlines |

### Font Weights

- **400 (Normal):** Body text, paragraphs
- **500 (Medium):** Emphasized text, labels
- **600 (Semibold):** Subheadings, buttons
- **700 (Bold):** Headings, important UI elements
- **800 (Extrabold):** Display headings (use sparingly)

### Typography Guidelines

#### Headings

```tsx
// Page Title (H1)
<h1 style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 }}>
  Dashboard Overview
</h1>

// Section Title (H2)
<h2 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }}>
  Recent Activity
</h2>

// Subsection (H3)
<h3 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 }}>
  Mind Maps
</h3>
```

#### Body Text

```tsx
// Standard paragraph
<p style={{ fontSize: '1rem', lineHeight: 1.5 }}>
  Lorem ipsum dolor sit amet...
</p>

// Supporting text
<p style={{ fontSize: '0.875rem', lineHeight: 1.25, color: 'var(--text-secondary)' }}>
  Additional context or description
</p>
```

#### Code & Monospace

```tsx
// Inline code
<code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
  npm install
</code>

// Code blocks
<pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
  <code>const example = true;</code>
</pre>
```

### Best Practices

✅ **Do:**
- Use a maximum of 3 font weights per page
- Maintain consistent line length (50-75 characters)
- Set line-height to 1.5 for body text
- Use sentence case for most UI text

❌ **Don't:**
- Use more than 3 different font sizes on a single component
- Set body text smaller than 16px (1rem)
- Use ALL CAPS for long text passages
- Mix font families arbitrarily

---

## Spacing & Layout

### Spacing Scale

Our spacing system uses a 4px base unit:

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `0` | 0 | 0px | No spacing |
| `1` | 0.25rem | 4px | Tight spacing, icon gaps |
| `2` | 0.5rem | 8px | Small gaps, compact layouts |
| `3` | 0.75rem | 12px | Input padding, button padding |
| `4` | 1rem | 16px | Standard spacing |
| `5` | 1.25rem | 20px | Comfortable spacing |
| `6` | 1.5rem | 24px | Card padding, section spacing |
| `8` | 2rem | 32px | Large gaps between sections |
| `10` | 2.5rem | 40px | Page margins |
| `12` | 3rem | 48px | Large containers |
| `16` | 4rem | 64px | Hero sections |

### Layout Grid

#### Desktop (>1024px)
- **Container max-width:** 1280px
- **Columns:** 12-column grid
- **Gutter:** 24px (var(--space-6))
- **Margin:** 40px (var(--space-10))

#### Tablet (768px - 1024px)
- **Container max-width:** 100%
- **Columns:** 8-column grid
- **Gutter:** 16px (var(--space-4))
- **Margin:** 24px (var(--space-6))

#### Mobile (<768px)
- **Container max-width:** 100%
- **Columns:** 4-column grid
- **Gutter:** 16px (var(--space-4))
- **Margin:** 16px (var(--space-4))

### Spacing Patterns

#### Cards
```tsx
<Card style={{ padding: 'var(--space-6)' }}>
  {/* 24px padding on all sides */}
</Card>
```

#### Stacked Content
```tsx
<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
  {/* 16px between items */}
</div>
```

#### Horizontal Layout
```tsx
<div style={{ display: 'flex', gap: 'var(--space-3)' }}>
  {/* 12px between items */}
</div>
```

### Responsive Breakpoints

```css
/* Mobile-first approach */

/* Small devices (phones) */
@media (min-width: 640px) { /* sm */ }

/* Medium devices (tablets) */
@media (min-width: 768px) { /* md */ }

/* Large devices (laptops) */
@media (min-width: 1024px) { /* lg */ }

/* Extra large devices (desktops) */
@media (min-width: 1280px) { /* xl */ }

/* 2X large devices (large desktops) */
@media (min-width: 1536px) { /* 2xl */ }
```

### Best Practices

✅ **Do:**
- Use spacing tokens exclusively (never hardcode pixel values)
- Maintain consistent spacing between similar elements
- Use larger spacing to group related content
- Follow the 8-point grid system

❌ **Don't:**
- Create custom spacing values (1.3rem, 17px, etc.)
- Use inconsistent spacing within the same component
- Cram content together without breathing room
- Ignore mobile spacing considerations

---

## Components

### Component Hierarchy

All components follow this structure:

```
Base Components → Composite Components → Page Templates
```

#### Base Components
Single-purpose, reusable elements:
- Button
- Input
- Card
- Badge
- Avatar

#### Composite Components
Multiple base components combined:
- Form (Input + Label + Button)
- Navigation (Button + Icon + Badge)
- Module Card (Card + Icon + Button + Badge)

#### Page Templates
Full layouts using composite components:
- Dashboard
- Module View
- Settings Page

### Button Component

#### Variants

**Primary** - Main actions
```tsx
<Button variant="primary" size="md">
  Create Project
</Button>
```
- Use for: Primary CTAs, submit actions
- Color: `--color-primary-600`
- States: hover, active, disabled, loading

**Secondary** - Supporting actions
```tsx
<Button variant="secondary" size="md">
  Cancel
</Button>
```
- Use for: Secondary actions, cancel buttons
- Color: `--color-neutral-200`
- States: hover, active, disabled

**Outline** - Tertiary actions
```tsx
<Button variant="outline" size="sm">
  Learn More
</Button>
```
- Use for: Less prominent actions
- Color: Transparent with border
- States: hover, active, disabled

**Ghost** - Minimal actions
```tsx
<Button variant="ghost" size="md">
  View Details
</Button>
```
- Use for: Text-like actions, icon buttons
- Color: Transparent
- States: hover, active

#### Sizes

- **Small (sm):** Height 32px, padding 8px 12px
- **Medium (md):** Height 40px, padding 10px 16px (default)
- **Large (lg):** Height 48px, padding 12px 24px

#### With Icons

```tsx
// Icon leading
<Button variant="primary">
  <Plus className="size-5 mr-2" />
  Add New
</Button>

// Icon trailing
<Button variant="outline">
  Download
  <Download className="size-4 ml-2" />
</Button>

// Icon only (must include aria-label)
<button aria-label="Close">
  <X className="size-5" />
</button>
```

### Card Component

```tsx
<Card>
  <CardHeader>
    <h3>Title</h3>
    <p>Description</p>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Styling:**
- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Border radius: `var(--radius-2xl)` (16px)
- Padding: `var(--space-6)` (24px)
- Shadow: `var(--shadow-sm)`

### Input Component

```tsx
<div>
  <label htmlFor="email">Email</label>
  <Input
    type="email"
    id="email"
    placeholder="you@example.com"
    error={hasError}
  />
  {hasError && <span className="error">Invalid email</span>}
</div>
```

**States:**
- Default: Border `var(--border)`
- Focus: Border `var(--color-primary-500)`, outline ring
- Error: Border `var(--color-error-500)`
- Disabled: Opacity 50%, cursor not-allowed

### Component Composition

**Example: Module Card**

```tsx
<Card className="module-card">
  <div className="flex items-center gap-4 mb-6">
    {/* Icon */}
    <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
      <Brain className="size-7 text-white" />
    </div>
    
    {/* Header */}
    <div className="flex-1">
      <h3 className="font-bold text-lg">MindMesh</h3>
      <p className="text-sm text-[var(--text-secondary)]">
        Mind mapping tool
      </p>
    </div>
    
    {/* Badge */}
    <Badge variant="success">Active</Badge>
  </div>
  
  {/* Stats */}
  <div className="flex gap-6 mb-6">
    <Stat label="Maps" value="24" />
    <Stat label="Nodes" value="156" />
  </div>
  
  {/* Actions */}
  <div className="flex gap-3">
    <Button variant="primary" className="flex-1">
      Open Module
    </Button>
    <Button variant="outline">Settings</Button>
  </div>
</Card>
```

---

## Iconography

### Icon Library

LifeSync uses **Lucide React** for all icons.

```tsx
import { Icon } from 'lucide-react';
```

### Icon Sizes

| Size | Class | Pixels | Usage |
|------|-------|--------|-------|
| XS | `size-3` | 12px | Small indicators |
| SM | `size-4` | 16px | Inline with text |
| MD | `size-5` | 20px | Buttons, inputs |
| LG | `size-6` | 24px | Headers, features |
| XL | `size-8` | 32px | Module icons |
| 2XL | `size-10` | 40px | Hero sections |
| 3XL | `size-12` | 48px | Empty states |

### Module Icons

**Always use the correct icon for each module:**

```tsx
import { Brain, Wallet, Compass, Target } from 'lucide-react';

// MindMesh
<Brain className="size-6 text-blue-600" />

// BudgetBuddy
<Wallet className="size-6 text-emerald-600" />

// CareerCompass
<Compass className="size-6 text-purple-600" />

// AutoPersona
<Target className="size-6 text-orange-600" />
```

### Icon Usage Rules

✅ **Do:**
- Use consistent sizes within the same context
- Maintain 1:1 aspect ratio (use `size-*` classes)
- Pair icons with text labels when possible
- Use semantic icon choices

❌ **Don't:**
- Mix different icon libraries
- Use icons smaller than 16px
- Rotate or transform icons unconventionally
- Use decorative icons without `aria-hidden`

### Accessibility

```tsx
// Decorative icon (screen readers ignore)
<Icon aria-hidden="true" />

// Interactive icon (needs label)
<button aria-label="Close dialog">
  <X className="size-5" />
</button>

// Icon with visible label (redundant aria-label not needed)
<button>
  <Plus className="size-4 mr-2" />
  Add Item
</button>
```

---

## Motion & Animation

### Animation Principles

1. **Purpose-Driven:** Every animation should serve a purpose
2. **Subtle:** Animations should enhance, not distract
3. **Fast:** Most animations should complete in under 300ms
4. **Consistent:** Use the same duration and easing for similar transitions

### Duration Tokens

```css
--duration-fast: 150ms;    /* Hover states, small interactions */
--duration-base: 200ms;    /* Standard transitions */
--duration-slow: 300ms;    /* Complex transitions, modals */
--duration-slower: 500ms;  /* Page transitions, emphasized */
```

### Easing Functions

```css
--easing-linear: linear;
--easing-in: cubic-bezier(0.4, 0, 1, 1);        /* Starts slow */
--easing-out: cubic-bezier(0, 0, 0.2, 1);       /* Ends slow */
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth */
```

### Common Patterns

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

#### Slide Up
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Modal Entry
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>
```

#### Stagger Children
```tsx
<motion.div
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map(item => (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Reduced Motion

Always respect user preferences:

```tsx
import { useReducedMotion } from 'motion/react';

function Component() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

### Best Practices

✅ **Do:**
- Keep animations under 500ms
- Use ease-out for elements entering
- Use ease-in for elements exiting
- Test with "Reduce Motion" enabled

❌ **Don't:**
- Animate large images or complex layouts
- Use different easings in the same transition group
- Create looping animations (except loading states)
- Ignore prefers-reduced-motion

---

## Accessibility

### WCAG 2.1 Level AA Compliance

LifeSync AI meets or exceeds WCAG 2.1 Level AA standards.

### Color Contrast

**All text must meet minimum contrast ratios:**

- Normal text (<18pt): **4.5:1**
- Large text (≥18pt or ≥14pt bold): **3:1**
- UI components: **3:1**

**Testing tools:**
- WebAIM Contrast Checker
- Chrome DevTools (Lighthouse)
- Figma plugins (Stark, Contrast)

### Keyboard Navigation

**All interactive elements must be keyboard accessible:**

| Key | Action |
|-----|--------|
| Tab | Next focusable element |
| Shift + Tab | Previous focusable element |
| Enter / Space | Activate button/link |
| Escape | Close modal/dropdown |
| Arrow keys | Navigate menus/tabs |

**Focus indicators:**
- Always visible when using keyboard
- 2px outline with 2px offset
- Color: `var(--color-primary-500)`

```css
button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Screen Readers

**ARIA labels for interactive elements:**

```tsx
// Button with icon only
<button aria-label="Close modal">
  <X className="size-5" />
</button>

// Loading state
<button aria-busy="true">
  <Loader2 className="animate-spin" />
</button>

// Toggle button
<button aria-pressed={isActive}>
  {isActive ? 'Active' : 'Inactive'}
</button>
```

**Semantic HTML:**
```tsx
// Use semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// Modal
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Modal Title</h2>
</div>
```

### Touch Targets

**Minimum target size: 44x44px**

```tsx
// Good: Button meets minimum size
<button style={{ minWidth: '44px', minHeight: '44px' }}>
  <Icon />
</button>

// Better: Add padding for larger target
<button style={{ padding: 'var(--space-3)' }}>
  <Icon className="size-6" />
</button>
```

### Accessibility Checklist

Before launching any feature:

- [ ] Test with keyboard only (no mouse)
- [ ] Verify screen reader announcements (NVDA, VoiceOver, JAWS)
- [ ] Check all color contrast ratios
- [ ] Ensure focus indicators are visible
- [ ] Test with browser zoom at 200%
- [ ] Enable "Reduce Motion" and verify animations
- [ ] Test with high contrast mode
- [ ] Validate HTML semantics

---

## Theme Implementation

### Light and Dark Modes

LifeSync supports both light and dark themes using CSS variables and data attributes.

### Setting the Theme

```tsx
// Set theme on root element
document.documentElement.setAttribute('data-theme', 'dark');

// Or on a container
<div data-theme="dark">
  {/* Dark themed content */}
</div>
```

### Theme Provider

```tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'dark', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Theme Toggle Button

```tsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        padding: 'var(--space-2)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        border: '1px solid var(--border)'
      }}
    >
      {theme === 'light' ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
    </button>
  );
}
```

### Using Theme Tokens

```tsx
// Components automatically adapt to theme
<div
  style={{
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)'
  }}
>
  This adapts to light/dark mode automatically
</div>
```

---

## Code Standards

### File Naming

- **Components:** PascalCase (`ThemeToggle.tsx`)
- **Utilities:** camelCase (`utils.ts`)
- **Styles:** kebab-case (`globals.css`)
- **Constants:** SCREAMING_SNAKE_CASE in files (`API_ENDPOINTS.ts`)

### Component Structure

```tsx
// 1. Imports
import React, { useState } from 'react';
import { Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

// 2. Types
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// 3. Constants (if needed)
const DEFAULT_CONFIG = { ... };

// 4. Component
export function Component({ title, onAction }: ComponentProps) {
  // Hooks
  const [state, setState] = useState(false);

  // Event handlers
  const handleClick = () => {
    setState(true);
    onAction?.();
  };

  // Render
  return (
    <div>
      <h3>{title}</h3>
      <button onClick={handleClick}>Action</button>
    </div>
  );
}

// 5. Sub-components (if any)
function SubComponent() {
  return <div>...</div>;
}
```

### CSS Variables Usage

```tsx
// ✅ Good: Use CSS variables
<div style={{ color: 'var(--text-primary)' }}>

// ❌ Bad: Hardcode colors
<div style={{ color: '#0F172A' }}>

// ✅ Good: Use spacing tokens
<div style={{ padding: 'var(--space-6)' }}>

// ❌ Bad: Custom spacing
<div style={{ padding: '25px' }}>
```

### TypeScript Guidelines

```tsx
// Use explicit types for props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

// Use type inference for internal state
const [count, setCount] = useState(0); // Type inferred as number

// Use generic types where appropriate
function createArray<T>(items: T[]): T[] {
  return items;
}
```

### Import Organization

```tsx
// 1. React and external libraries
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// 2. Internal utilities
import { cn } from '@/lib/utils';

// 3. Components
import { Button } from '@/components/ui/button';

// 4. Icons
import { Icon } from 'lucide-react';

// 5. Types
import type { User } from '@/types';

// 6. Styles (if separate)
import './styles.css';
```

---

## File Organization

### Directory Structure

```
lifesync-design-system/
├── components/
│   ├── design-system/
│   │   ├── ColorSwatch.tsx
│   │   ├── ComponentLibrary.tsx
│   │   ├── Documentation.tsx
│   │   ├── ExportAssets.tsx
│   │   ├── Foundations.tsx
│   │   ├── Iconography.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── ...
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── figma/
│       └── ImageWithFallback.tsx
├── lib/
│   └── utils.ts
├── styles/
│   └── globals.css
├── guidelines/
│   └── Guidelines.md
├── App.tsx
└── package.json
```

### Component Organization

Each component file should contain:

```tsx
// ComponentName.tsx
import React from 'react';

// Types specific to this component
interface ComponentNameProps {
  // ...
}

// Main component
export function ComponentName(props: ComponentNameProps) {
  // ...
}

// Sub-components (if tightly coupled)
function ComponentNameHeader() {
  // ...
}

function ComponentNameBody() {
  // ...
}

// Exports
export { ComponentName as default };
```

---

## Contribution Guidelines

### Adding New Components

1. **Proposal:** Create an issue describing the component need
2. **Design:** Create Figma designs following existing patterns
3. **Review:** Get design approval from design team
4. **Implementation:** Build component using design tokens
5. **Documentation:** Add usage examples and props documentation
6. **Testing:** Verify accessibility and responsive behavior
7. **Pull Request:** Submit for code review

### Modifying Existing Components

1. **Breaking changes:** Require major version bump
2. **New features:** Require minor version bump
3. **Bug fixes:** Require patch version bump
4. **Update documentation:** Always update when changing behavior

### Design Token Changes

**⚠️ Critical:** Token changes affect the entire system.

**Process:**
1. Propose change in design system meeting
2. Assess impact across all modules
3. Update `tokens.toon` file
4. Regenerate `globals.css`
5. Test all affected components
6. Update documentation
7. Communicate change to all teams

### Code Review Checklist

- [ ] Follows file naming conventions
- [ ] Uses design tokens (no hardcoded values)
- [ ] Includes TypeScript types
- [ ] Meets accessibility standards
- [ ] Works in light and dark modes
- [ ] Responsive on mobile, tablet, desktop
- [ ] Includes documentation/comments
- [ ] No console errors or warnings

### Version Control

**Commit message format:**
```
type(scope): description

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(button): add loading state variant
fix(input): correct focus ring color in dark mode
docs(guidelines): update color contrast requirements
```

---

## Resources

### Tools & References

- **Design:** Figma
- **Icons:** Lucide React (https://lucide.dev)
- **Animation:** Motion (https://motion.dev)
- **Styling:** Tailwind CSS v4
- **Accessibility:** WCAG 2.1 AA (https://www.w3.org/WAI/WCAG21/quickref/)

### Learning Resources

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/)
- [Motion Design for Developers](https://motion.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support

For questions or support:
- **Email:** ashborn@lifesync.ai
- **Documentation:** View in-app Documentation section
- **Issues:** Submit via project repository

---

## Changelog

### Version 2.0.0 (Ashborn Edition) - November 28, 2025

**Major Changes:**
- Complete dual-theme architecture (light/dark modes)
- Tokenized design system with `tokens.toon` format
- New Iconography section with 100+ icons
- Expanded component library
- Mobile and web template examples
- Comprehensive export system
- Enhanced accessibility features

**Breaking Changes:**
- Migrated from JSON tokens to TOON format
- Updated CSS variable naming convention
- Removed deprecated v1.x components

**New Features:**
- Theme toggle component
- Reduced motion support
- Module-specific color system
- Interactive documentation

---

**© 2024-2025 LifeSync AI — Design System by Ashborn**
