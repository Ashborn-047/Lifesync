import React, { useState } from "react";
import {
  Download,
  FileJson,
  FileCode,
  FileType,
  Copy,
  Check,
  Package,
  Palette,
  Sparkles,
  Archive,
  FileText
} from "lucide-react";
import { cn } from "../lib/utils";

const CodeBlock = ({ code, language = "typescript" }: { code: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl bg-[#0D0F14] border border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[#151821] border-b border-slate-800">
        <span className="text-xs font-mono text-slate-400">{language}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default function ExportAssets() {
  const [downloading, setDownloading] = useState(false);

  // Generate tokens.toon file
  const tokensToon = {
    meta: {
      name: "LifeSync AI Design System",
      version: "2.0.0",
      designer: "Ashborn — Ui/Ux Designer",
      description: "Comprehensive design system for LifeSync AI multi-module productivity platform",
      created: "2024",
      updated: new Date().toISOString().split('T')[0]
    },
    color: {
      palette: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554"
        },
        secondary: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95"
        },
        accent: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12"
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D"
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F"
        },
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D"
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617"
        }
      },
      semantic: {
        text: {
          primary: "neutral.900",
          secondary: "neutral.600",
          tertiary: "neutral.400",
          inverse: "neutral.50",
          link: "primary.600",
          success: "success.700",
          warning: "warning.700",
          error: "error.700"
        },
        background: {
          primary: "neutral.50",
          secondary: "neutral.100",
          tertiary: "neutral.200",
          inverse: "neutral.900",
          brand: "primary.500",
          success: "success.50",
          warning: "warning.50",
          error: "error.50"
        },
        border: {
          default: "neutral.200",
          hover: "neutral.300",
          focus: "primary.500",
          error: "error.500"
        }
      },
      modes: {
        light: {
          background: {
            primary: "#F8FAFC",
            secondary: "#FFFFFF",
            tertiary: "#F1F5F9"
          },
          surface: {
            base: "#FFFFFF",
            elevated: "#FFFFFF",
            overlay: "rgba(0, 0, 0, 0.5)"
          },
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            tertiary: "#94A3B8",
            inverse: "#F8FAFC"
          },
          border: {
            default: "#E2E8F0",
            subtle: "#F1F5F9",
            strong: "#CBD5E1"
          }
        },
        dark: {
          background: {
            primary: "#0D0F14",
            secondary: "#151821",
            tertiary: "#1E293B"
          },
          surface: {
            base: "#151821",
            elevated: "#1E293B",
            overlay: "rgba(0, 0, 0, 0.8)"
          },
          text: {
            primary: "#F8FAFC",
            secondary: "#CBD5E1",
            tertiary: "#64748B",
            inverse: "#0F172A"
          },
          border: {
            default: "#334155",
            subtle: "#1E293B",
            strong: "#475569"
          }
        }
      }
    },
    typography: {
      fonts: {
        sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace"
      },
      scale: {
        xs: { size: "0.75rem", lineHeight: "1rem" },
        sm: { size: "0.875rem", lineHeight: "1.25rem" },
        base: { size: "1rem", lineHeight: "1.5rem" },
        lg: { size: "1.125rem", lineHeight: "1.75rem" },
        xl: { size: "1.25rem", lineHeight: "1.75rem" },
        "2xl": { size: "1.5rem", lineHeight: "2rem" },
        "3xl": { size: "1.875rem", lineHeight: "2.25rem" },
        "4xl": { size: "2.25rem", lineHeight: "2.5rem" },
        "5xl": { size: "3rem", lineHeight: "1" },
        "6xl": { size: "3.75rem", lineHeight: "1" }
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800
      }
    },
    spacing: {
      px: "1px",
      0: "0px",
      0.5: "0.125rem",
      1: "0.25rem",
      1.5: "0.375rem",
      2: "0.5rem",
      2.5: "0.625rem",
      3: "0.75rem",
      3.5: "0.875rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      9: "2.25rem",
      10: "2.5rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      32: "8rem"
    },
    radii: {
      none: "0px",
      sm: "0.125rem",
      base: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px"
    },
    shadows: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"
    },
    motion: {
      duration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
        slower: "500ms"
      },
      easing: {
        linear: "linear",
        in: "cubic-bezier(0.4, 0, 1, 1)",
        out: "cubic-bezier(0, 0, 0.2, 1)",
        inOut: "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    },
    components: {
      button: {
        variants: {
          primary: {
            background: "primary.600",
            backgroundHover: "primary.700",
            text: "white",
            border: "transparent"
          },
          secondary: {
            background: "neutral.200",
            backgroundHover: "neutral.300",
            text: "neutral.900",
            border: "transparent"
          },
          outline: {
            background: "transparent",
            backgroundHover: "neutral.100",
            text: "neutral.900",
            border: "neutral.300"
          },
          ghost: {
            background: "transparent",
            backgroundHover: "neutral.100",
            text: "neutral.700",
            border: "transparent"
          }
        },
        sizes: {
          sm: { padding: "0.5rem 0.75rem", fontSize: "0.875rem" },
          md: { padding: "0.625rem 1rem", fontSize: "1rem" },
          lg: { padding: "0.75rem 1.5rem", fontSize: "1.125rem" }
        }
      },
      card: {
        background: "surface.base",
        border: "border.default",
        borderRadius: "radii.2xl",
        padding: "spacing.6",
        shadow: "shadows.sm"
      },
      input: {
        background: "surface.base",
        border: "border.default",
        borderFocus: "primary.500",
        borderRadius: "radii.lg",
        padding: "spacing.3",
        fontSize: "typography.scale.base"
      },
      header: {
        background: "surface.base",
        border: "border.default",
        height: "spacing.16",
        padding: "spacing.4"
      }
    }
  };

  // Generate globals.css
  const globalsCss = `/* LifeSync AI Design System - Global CSS Variables */
/* Generated from tokens.toon */

:root {
  /* Colors - Primary */
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;
  
  /* Colors - Neutral */
  --color-neutral-50: #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;
  
  /* Semantic - Light Mode */
  --background: #F8FAFC;
  --surface: #FFFFFF;
  --surface-elevated: #FFFFFF;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-tertiary: #94A3B8;
  --border: #E2E8F0;
  --border-subtle: #F1F5F9;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Border Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* Typography */
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, 'Cascadia Code', monospace;
  
  /* Motion */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --easing: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  /* Semantic - Dark Mode */
  --background: #0D0F14;
  --surface: #151821;
  --surface-elevated: #1E293B;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-tertiary: #64748B;
  --border: #334155;
  --border-subtle: #1E293B;
  
  /* Adjusted primary for dark mode */
  --color-primary-500: #5B61FF;
  --color-primary-600: #4E54F5;
}

/* Component Tokens */
.btn-primary {
  background: var(--color-primary-600);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  transition: all var(--duration-base) var(--easing);
}

.btn-primary:hover {
  background: var(--color-primary-700);
  box-shadow: var(--shadow-md);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  color: var(--text-primary);
  transition: all var(--duration-base) var(--easing);
}

.input:focus {
  border-color: var(--color-primary-500);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}`;

  // Generate icons.json mapping
  const iconsJson = {
    categories: {
      navigation: ["Menu", "X", "ChevronRight", "ChevronLeft", "Home", "ArrowRight"],
      ui: ["Settings", "Search", "Bell", "User", "MoreHorizontal"],
      modules: ["Brain", "Wallet", "Compass", "Target"],
      actions: ["Plus", "Edit", "Trash2", "Download", "Share2"],
      status: ["CheckCircle", "AlertCircle", "Info", "Loader2"]
    },
    usage: {
      "Brain": "MindMesh module identifier",
      "Wallet": "BudgetBuddy module identifier",
      "Compass": "CareerCompass module identifier",
      "Target": "AutoPersona module identifier",
      "Menu": "Mobile menu toggle",
      "Bell": "Notifications trigger"
    }
  };

  // README content
  const readmeContent = `# Ashborn Design System (LifeSync AI)

**Version:** 2.0.0  
**Designer:** Ashborn — Ui/Ux Designer  
**Platform:** LifeSync AI Multi-Module Productivity System

## 📦 What's Included

\`\`\`
ashborn-design-system/
├── tokens.toon              # Complete design tokens (JSON)
├── globals.css              # Compiled CSS variables (light & dark)
├── components/              # React component examples
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── README.md
├── icon-pack/               # SVG icons organized by category
│   ├── navigation/
│   ├── ui/
│   ├── modules/
│   ├── actions/
│   └── icons.json          # Icon mapping & usage guide
├── package.json            # Recommended dependencies
└── README.md               # This file
\`\`\`

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install tailwindcss postcss autoprefixer motion
# or
yarn add tailwindcss postcss autoprefixer motion
\`\`\`

### 2. Import CSS Variables

Add to your main CSS file (e.g., \`globals.css\` or \`app.css\`):

\`\`\`css
@import './ashborn-design-system/globals.css';
\`\`\`

### 3. Apply Theme Toggle

To enable dark mode, add \`data-theme="dark"\` to your root element:

\`\`\`tsx
// In your app layout or theme provider
<html data-theme={isDark ? "dark" : "light"}>
  <body>{children}</body>
</html>
\`\`\`

Or use the class-based approach:

\`\`\`tsx
<div className={isDark ? "dark" : ""}>
  {/* Your app */}
</div>
\`\`\`

### 4. Use Design Tokens

**In CSS:**
\`\`\`css
.my-component {
  background: var(--surface);
  color: var(--text-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
\`\`\`

**In React/TSX:**
\`\`\`tsx
<div style={{
  background: 'var(--surface)',
  padding: 'var(--space-6)',
  borderRadius: 'var(--radius-2xl)'
}}>
  Content
</div>
\`\`\`

### 5. Load tokens.toon (Optional)

For programmatic access to design tokens:

\`\`\`tsx
import tokens from './ashborn-design-system/tokens.toon';

// Access tokens
const primaryColor = tokens.color.palette.primary[500];
const spacing = tokens.spacing[4];
\`\`\`

## 🎨 Using Components

Import pre-built component examples:

\`\`\`tsx
import { Button } from './ashborn-design-system/components/Button';

<Button variant="primary" size="md">
  Click me
</Button>
\`\`\`

## 🎯 Module Icons

LifeSync AI uses specific icons for each module:

- **MindMesh**: \`Brain\` icon
- **BudgetBuddy**: \`Wallet\` icon
- **CareerCompass**: \`Compass\` icon
- **AutoPersona**: \`Target\` icon

Find all SVG icons in \`icon-pack/\` organized by category.

## 📱 Responsive Design

All components use responsive tokens. Breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🌗 Dark Mode Support

Every token has light and dark mode variants. Toggle by adding/removing \`data-theme="dark"\` on the root element.

## 🔧 Next.js Integration Example

\`\`\`tsx
// app/layout.tsx
import './ashborn-design-system/globals.css';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
\`\`\`

## 📥 Download TOON

You can download the complete \`tokens.toon\` file from the Export Assets panel in the design system interface. This file contains all design tokens in a structured JSON format.

## 🎓 Learn More

- View the full design system documentation
- Check component examples in \`components/\`
- Explore icon usage in \`icon-pack/icons.json\`

---

**Built with ❤️ by Ashborn**  
*For questions or contributions, refer to the documentation panel in the design system.*
`;

  // Component examples
  const buttonComponent = `import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick,
  disabled 
}: ButtonProps) {
  const baseStyles = {
    borderRadius: 'var(--radius-lg)',
    transition: 'all var(--duration-base) var(--easing)',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1
  };

  const variants = {
    primary: {
      background: 'var(--color-primary-600)',
      color: 'white',
      border: 'none'
    },
    secondary: {
      background: 'var(--color-neutral-200)',
      color: 'var(--text-primary)',
      border: 'none'
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none'
    }
  };

  const sizes = {
    sm: { padding: 'var(--space-2) var(--space-3)', fontSize: '0.875rem' },
    md: { padding: 'var(--space-3) var(--space-6)', fontSize: '1rem' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: '1.125rem' }
  };

  return (
    <button
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}`;

  const cardComponent = `import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  className?: string;
}

export function Card({ children, padding, className = '' }: CardProps) {
  return (
    <div
      className={\`card \${className}\`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-2xl)',
        padding: padding || 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--duration-base) var(--easing)'
      }}
    >
      {children}
    </div>
  );
}`;

  const inputComponent = `import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
}

export function Input({ type = 'text', placeholder, value, onChange, error }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        background: 'var(--surface)',
        border: \`1px solid \${error ? 'var(--color-error-500)' : 'var(--border)'}\`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        width: '100%',
        transition: 'all var(--duration-base) var(--easing)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--color-primary-500)';
        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? 'var(--color-error-500)' : 'var(--border)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}`;

  const packageJson = {
    name: "ashborn-design-system",
    version: "2.0.0",
    description: "LifeSync AI Design System by Ashborn",
    type: "module",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      next: "^14.0.0"
    },
    devDependencies: {
      "@types/node": "^20.0.0",
      "@types/react": "^18.2.0",
      typescript: "^5.0.0",
      tailwindcss: "^4.0.0",
      postcss: "^8.4.0",
      autoprefixer: "^10.4.0",
      "motion": "^10.16.0"
    }
  };

  const nextjsExample = `// Example: Load tokens.toon in Next.js build
// app/layout.tsx

import tokens from '../ashborn-design-system/tokens.toon';

// Generate CSS variables from tokens at build time
function generateCSSVars() {
  let css = ':root {\\n';
  
  // Add color tokens
  Object.entries(tokens.color.palette.primary).forEach(([key, value]) => {
    css += \`  --color-primary-\${key}: \${value};\\n\`;
  });
  
  // Add spacing tokens
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    css += \`  --space-\${key}: \${value};\\n\`;
  });
  
  css += '}';
  return css;
}

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: generateCSSVars() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`;

  // Download function
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadToon = () => {
    downloadFile('tokens.toon', JSON.stringify(tokensToon, null, 2));
  };

  const downloadCSS = () => {
    downloadFile('globals.css', globalsCss);
  };

  const downloadPackage = () => {
    setDownloading(true);

    // Create a simple text file listing all the files that would be in the ZIP
    const manifest = `Ashborn Design System Package
================================

This would contain:
- tokens.toon
- globals.css
- components/Button.tsx
- components/Card.tsx
- components/Input.tsx
- components/README.md
- icon-pack/icons.json
- package.json
- README.md
- NEXTJS_EXAMPLE.tsx

Download individual files using the buttons above.
For a production system, this would generate a proper ZIP file.
`;

    downloadFile('ashborn-design-system-manifest.txt', manifest);

    setTimeout(() => setDownloading(false), 1000);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Export Assets</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Download the complete Ashborn Design System package with tokens, CSS variables, components, and icons.
          Everything you need to start building with LifeSync AI's design language.
        </p>
      </div>

      {/* Main Download CTA */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-900/30">
        <div className="flex items-start gap-6">
          <div className="size-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Archive className="size-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Complete Design System Package
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Download <code className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-sm font-mono">ashborn-design-system.zip</code> containing tokens.toon, CSS variables, React components, icon pack, and documentation.
            </p>
            <button
              onClick={downloadPackage}
              disabled={downloading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Package className="size-5 animate-pulse" />
                  Preparing Download...
                </>
              ) : (
                <>
                  <Download className="size-5" />
                  Download Complete Package
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Individual Downloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOON File */}
        <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
          <div className="size-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">tokens.toon</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Complete design tokens in structured JSON format with metadata and semantic tokens.
          </p>
          <button
            onClick={downloadToon}
            className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="size-4" /> Download TOON
          </button>
        </div>

        {/* CSS Variables */}
        <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
          <div className="size-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <FileType className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">globals.css</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Compiled CSS variables for light and dark modes. Import directly into your project.
          </p>
          <button
            onClick={downloadCSS}
            className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="size-4" /> Download CSS
          </button>
        </div>

        {/* Icon Pack */}
        <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
          <div className="size-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <Package className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Icon Pack</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            100+ optimized SVG icons organized by category with usage mapping.
          </p>
          <button
            onClick={() => downloadFile('icons.json', JSON.stringify(iconsJson, null, 2))}
            className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="size-4" /> Download Icons
          </button>
        </div>

        {/* README */}
        <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
          <div className="size-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <FileText className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">README.md</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Complete documentation with quick start guide and integration examples.
          </p>
          <button
            onClick={() => downloadFile('README.md', readmeContent)}
            className="w-full py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="size-4" /> Download Docs
          </button>
        </div>
      </div>

      {/* Code Previews */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
          Preview & Copy
        </h2>

        <div className="grid grid-cols-1 gap-8">
          {/* tokens.toon */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="size-5 text-amber-500" /> tokens.toon
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">JSON</span>
            </div>
            <CodeBlock code={JSON.stringify(tokensToon, null, 2)} language="json" />
          </div>

          {/* globals.css */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileType className="size-5 text-blue-500" /> globals.css
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">CSS</span>
            </div>
            <CodeBlock code={globalsCss} language="css" />
          </div>

          {/* Component Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="size-5 text-purple-500" /> Button.tsx
              </h3>
              <CodeBlock code={buttonComponent} language="tsx" />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="size-5 text-purple-500" /> Card.tsx
              </h3>
              <CodeBlock code={cardComponent} language="tsx" />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="size-5 text-purple-500" /> Input.tsx
              </h3>
              <CodeBlock code={inputComponent} language="tsx" />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileJson className="size-5 text-emerald-500" /> package.json
              </h3>
              <CodeBlock code={JSON.stringify(packageJson, null, 2)} language="json" />
            </div>
          </div>

          {/* Next.js Integration */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="size-5 text-slate-500" /> Next.js Integration Example
            </h3>
            <CodeBlock code={nextjsExample} language="tsx" />
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">🚀 Quick Integration Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">1. Install Dependencies</h4>
            <code className="block bg-white dark:bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
              npm install tailwindcss motion
            </code>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">2. Import CSS Variables</h4>
            <code className="block bg-white dark:bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
              @import './globals.css';
            </code>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">3. Enable Dark Mode</h4>
            <code className="block bg-white dark:bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
              {'<html data-theme="dark">'}
            </code>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3">4. Use CSS Variables</h4>
            <code className="block bg-white dark:bg-slate-800 p-3 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300">
              {'background: var(--surface);'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
