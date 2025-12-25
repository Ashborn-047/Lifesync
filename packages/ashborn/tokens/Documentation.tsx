import React, { useState } from "react";
import {
  BookOpen,
  Zap,
  Layers,
  Move,
  Palette,
  Code,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Package,
  Terminal,
  Sparkles,
  Lightbulb,
  FileCode,
  Download,
  Settings,
  Brain,
  Wallet,
  Compass,
  Target,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type GuideSection =
  | "quickstart"
  | "theming"
  | "components"
  | "motion"
  | "accessibility"
  | "developer"
  | null;

const GuideCard = ({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  isActive
}: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left p-6 rounded-2xl border shadow-sm transition-all cursor-pointer group",
      isActive
        ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-500 dark:border-blue-500 shadow-lg"
        : "bg-white dark:bg-[#151821] border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md"
    )}
  >
    <div className="flex items-start justify-between mb-4">
      <div className={cn(
        "size-12 rounded-xl flex items-center justify-center transition-colors",
        isActive
          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          : "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400"
      )}>
        <Icon className="size-6" />
      </div>
      {badge && (
        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </span>
      )}
    </div>
    <h3 className={cn(
      "text-lg font-bold mb-2 transition-colors",
      isActive
        ? "text-blue-600 dark:text-blue-400"
        : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
    )}>
      {title}
    </h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
      {description}
    </p>
    <div className={cn(
      "mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 transition-all",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
    )}>
      Read Guide <ArrowRight className="ml-1 size-4" />
    </div>
  </button>
);

const CodeBlock = ({ code, language = "bash" }: { code: string, language?: string }) => (
  <div className="bg-[#0D0F14] rounded-xl overflow-hidden border border-slate-800">
    <div className="px-4 py-2 bg-[#151821] border-b border-slate-800 flex items-center justify-between">
      <span className="text-xs font-mono text-slate-400">{language}</span>
    </div>
    <pre className="p-4 overflow-x-auto">
      <code className="text-sm font-mono text-slate-300">{code}</code>
    </pre>
  </div>
);

export default function Documentation() {
  const [activeGuide, setActiveGuide] = useState<GuideSection>(null);

  const toggleGuide = (section: GuideSection) => {
    setActiveGuide(activeGuide === section ? null : section);
  };

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Documentation</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Comprehensive guides for designers and developers. Learn how to implement, extend, and maintain the LifeSync AI design system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Ashborn</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ui/Ux Designer</p>
          </div>
          <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        </div>
      </div>

      {/* Hero Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white p-12 text-center">
        <div className="relative z-10 space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-wider">
            System Architecture v2.0
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Built for scale. <br /> Designed for humans.
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            LifeSync AI's design system leverages atomic design principles and React-based component architecture to deliver consistent experiences across web and mobile.
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
      </div>

      {/* Guides Grid */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">Core Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GuideCard
            icon={Zap}
            title="Quick Start"
            description="Get up and running with the LifeSync design system in under 5 minutes. Includes installation and setup."
            badge="New"
            onClick={() => toggleGuide("quickstart")}
            isActive={activeGuide === "quickstart"}
          />
          <GuideCard
            icon={Palette}
            title="Theming & Tokens"
            description="Understanding the dual-theme architecture (Light/Dark) and how to use design tokens effectively."
            onClick={() => toggleGuide("theming")}
            isActive={activeGuide === "theming"}
          />
          <GuideCard
            icon={Layers}
            title="Component Usage"
            description="Best practices for using core components, variants, and composing complex interfaces."
            onClick={() => toggleGuide("components")}
            isActive={activeGuide === "components"}
          />
          <GuideCard
            icon={Move}
            title="Motion Guidelines"
            description="Principles of animation within LifeSync. Timing, easing, and transition patterns."
            onClick={() => toggleGuide("motion")}
            isActive={activeGuide === "motion"}
          />
          <GuideCard
            icon={CheckCircle2}
            title="Accessibility"
            description="WCAG 2.1 compliance checklist. Ensuring the platform is usable by everyone."
            onClick={() => toggleGuide("accessibility")}
            isActive={activeGuide === "accessibility"}
          />
          <GuideCard
            icon={Code}
            title="Developer Handoff"
            description="How to translate Figma designs into production-ready React code using our export tools."
            onClick={() => toggleGuide("developer")}
            isActive={activeGuide === "developer"}
          />
        </div>
      </section>

      {/* Expanded Guide Content */}
      <AnimatePresence>
        {activeGuide && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-[#151821] rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 shadow-xl"
          >
            {/* Quick Start Guide */}
            {activeGuide === "quickstart" && (
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Zap className="size-8 text-white" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                      New
                    </span>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quick Start Guide</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Get up and running with LifeSync AI Design System in under 5 minutes
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                      Install Dependencies
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      First, install the required packages. The LifeSync Design System is built on top of Tailwind CSS and uses Motion (Framer Motion) for animations, along with Lucide React for icons.
                    </p>
                    <CodeBlock
                      code={`# Using npm
npm install tailwindcss postcss autoprefixer motion lucide-react

# Using yarn
yarn add tailwindcss postcss autoprefixer motion lucide-react

# Using pnpm
pnpm add tailwindcss postcss autoprefixer motion lucide-react`}
                      language="bash"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                      Initialize Tailwind CSS
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Create your Tailwind configuration file. This will generate <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">tailwind.config.js</code> and <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">postcss.config.js</code> files.
                    </p>
                    <CodeBlock
                      code={`npx tailwindcss init -p`}
                      language="bash"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                      Download Design Tokens
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Go to the <strong>Export Assets</strong> section and download the complete design system package. This includes:
                    </p>
                    <ul className="space-y-2 mb-4">
                      {[
                        'tokens.toon - Complete design tokens in JSON format',
                        'globals.css - Pre-compiled CSS variables for light and dark modes',
                        'components/ - React component examples',
                        'icon-pack/ - SVG icons organized by category',
                        'README.md - Complete documentation'
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-300">
                        <strong>💡 Tip:</strong> Place the downloaded files in your project's root directory or in a <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs font-mono">design-system/</code> folder for easy access.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">4</span>
                      Import CSS Variables
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Import the globals.css file into your main CSS file (usually <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">app/globals.css</code> or <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">styles/globals.css</code>):
                    </p>
                    <CodeBlock
                      code={`/* In your main CSS file (e.g., app/globals.css) */
@import './design-system/globals.css';

/* Or if you placed it in the root */
@import '../ashborn-design-system/globals.css';

/* Add Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;`}
                      language="css"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">5</span>
                      Set Up Theme Provider (Optional)
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      For dynamic theme switching, create a theme provider component:
                    </p>
                    <CodeBlock
                      code={`// components/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Set data-theme attribute on document root
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="flex items-center justify-center size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">6</span>
                      Wrap Your App
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Wrap your application with the ThemeProvider:
                    </p>
                    <CodeBlock
                      code={`// app/layout.tsx (Next.js) or main.tsx (Vite)
import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                      You're All Set!
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      You can now start using the design system. Try creating your first component:
                    </p>
                    <CodeBlock
                      code={`// app/page.tsx
export default function Home() {
  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <div 
        className="max-w-md mx-auto p-6 rounded-2xl shadow-lg"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)'
        }}
      >
        <h1 style={{ color: 'var(--text-primary)' }}>
          Welcome to LifeSync AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
          Your design system is ready to use!
        </p>
      </div>
    </div>
  );
}`}
                      language="tsx"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                      <Sparkles className="size-5" />
                      Next Steps
                    </h4>
                    <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                      <li className="flex items-start gap-2">
                        <span>→</span>
                        <span>Explore the <strong>Theming & Tokens</strong> guide to understand color modes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>→</span>
                        <span>Check out <strong>Component Usage</strong> for pre-built component examples</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>→</span>
                        <span>Visit the <strong>Iconography</strong> section to browse available icons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>→</span>
                        <span>Review <strong>Motion Guidelines</strong> for animation best practices</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Theming & Tokens Guide */}
            {activeGuide === "theming" && (
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Palette className="size-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Theming & Tokens</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Master the dual-theme architecture and design token system
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Understanding Design Tokens</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Design tokens are the atomic building blocks of our design system. They store visual design decisions (colors, spacing, typography) as data that can be shared across platforms and frameworks.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2">✅ Benefits</h5>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <li>• Single source of truth for design decisions</li>
                          <li>• Consistent theming across platforms</li>
                          <li>• Easy updates and maintenance</li>
                          <li>• Seamless light/dark mode support</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2">📦 Token Categories</h5>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <li>• Color (palette, semantic, modes)</li>
                          <li>• Typography (fonts, scale, weights)</li>
                          <li>• Spacing (margins, padding, gaps)</li>
                          <li>• Radii, Shadows, Motion</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Color System</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      LifeSync AI uses a comprehensive color system with three layers:
                    </p>

                    <div className="space-y-4">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-white">1. Palette Tokens (Base Colors)</h5>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Raw color values organized in scales from 50-950. These never change between themes.
                          </p>
                          <CodeBlock
                            code={`// From tokens.toon
{
  "color": {
    "palette": {
      "primary": {
        "50": "#EFF6FF",
        "500": "#3B82F6",  // Main brand color
        "900": "#1E3A8A"
      }
    }
  }
}

/* In CSS */
--color-primary-500: #3B82F6;`}
                            language="json"
                          />
                        </div>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-white">2. Semantic Tokens</h5>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Purpose-driven tokens that reference palette tokens. These provide meaning and context.
                          </p>
                          <CodeBlock
                            code={`// Semantic references
{
  "semantic": {
    "text": {
      "primary": "neutral.900",   // References neutral-900
      "link": "primary.600"       // References primary-600
    },
    "background": {
      "brand": "primary.500"
    }
  }
}`}
                            language="json"
                          />
                        </div>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-white">3. Mode Tokens (Light/Dark)</h5>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Theme-specific values that change based on light or dark mode.
                          </p>
                          <CodeBlock
                            code={`:root {
  /* Light mode (default) */
  --background: #F8FAFC;
  --surface: #FFFFFF;
  --text-primary: #0F172A;
  --border: #E2E8F0;
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --background: #0D0F14;
  --surface: #151821;
  --text-primary: #F8FAFC;
  --border: #334155;
}`}
                            language="css"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Implementing Dark Mode</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      LifeSync uses a data-attribute approach for theme switching. Here's how to implement it:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Method 1: Manual Toggle</h5>
                        <CodeBlock
                          code={`// ThemeToggle component
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}`}
                          language="tsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Method 2: System Preference</h5>
                        <CodeBlock
                          code={`useEffect(() => {
  // Check system preference
  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;
  
  const theme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  
  // Listen for system changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute(
        'data-theme', 
        e.matches ? 'dark' : 'light'
      );
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);`}
                          language="tsx"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Using Tokens in Components</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Here are the recommended ways to use design tokens in your components:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">CSS Variables (Recommended)</h5>
                        <CodeBlock
                          code={`<div 
  style={{
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    padding: 'var(--space-6)',
    borderRadius: 'var(--radius-2xl)',
    border: '1px solid var(--border)'
  }}
>
  Content
</div>`}
                          language="tsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">With Tailwind (Using arbitrary values)</h5>
                        <CodeBlock
                          code={`<div className="
  bg-[var(--surface)] 
  text-[var(--text-primary)]
  p-[var(--space-6)]
  rounded-[var(--radius-2xl)]
  border border-[var(--border)]
">
  Content
</div>`}
                          language="tsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Loading tokens.toon Programmatically</h5>
                        <CodeBlock
                          code={`import tokens from './tokens.toon';

// Access any token
const primaryColor = tokens.color.palette.primary[500];
const spacing = tokens.spacing[6];
const borderRadius = tokens.radii['2xl'];

// Use in styles
<div style={{
  backgroundColor: primaryColor,
  padding: spacing,
  borderRadius: borderRadius
}}>
  Content
</div>`}
                          language="tsx"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-6">
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <Lightbulb className="size-5" />
                      Best Practices
                    </h4>
                    <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Always use semantic tokens (--text-primary) instead of palette tokens (--color-neutral-900) in components</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Test components in both light and dark modes during development</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Use spacing tokens for consistent padding, margins, and gaps</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Leverage shadow and radius tokens for consistent elevation and roundness</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✗</span>
                        <span>Don't hardcode color values - always use CSS variables</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✗</span>
                        <span>Don't create custom spacing values - use the predefined scale</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Component Usage Guide */}
            {activeGuide === "components" && (
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="size-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Component Usage Guide</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Best practices for using and composing LifeSync AI components
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Component Library Overview</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      The LifeSync AI Design System includes a comprehensive component library built with React and TypeScript. All components are designed to work seamlessly with the token system and support both light and dark modes.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Core Components</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Button', description: 'Primary, secondary, outline, and ghost variants with multiple sizes', variants: '4 variants, 3 sizes' },
                        { name: 'Card', description: 'Container component with consistent styling and elevation', variants: 'Flexible padding' },
                        { name: 'Input', description: 'Text input with focus states and error handling', variants: 'Error states' },
                        { name: 'Badge', description: 'Status indicators and labels', variants: 'Multiple colors' },
                        { name: 'Modal', description: 'Overlay dialogs for focused content', variants: 'Animated entrance' },
                        { name: 'Dropdown', description: 'Menu and selection components', variants: 'Multi-select support' },
                      ].map((comp, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">{comp.name}</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{comp.description}</p>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{comp.variants}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Button Component</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      The button component is one of the most frequently used elements. Here's how to use it effectively:
                    </p>
                    <CodeBlock
                      code={`import { Button } from './components/Button';
import { Plus, Download } from 'lucide-react';

// Primary button (default)
<Button variant="primary" size="md">
  Create Project
</Button>

// With icon
<Button variant="primary" size="lg">
  <Plus className="size-5 mr-2" />
  Add New
</Button>

// Secondary variant
<Button variant="secondary" size="md">
  Cancel
</Button>

// Outline variant
<Button variant="outline" size="sm">
  <Download className="size-4 mr-2" />
  Export
</Button>

// Ghost variant (minimal)
<Button variant="ghost" size="md">
  Learn More
</Button>

// Disabled state
<Button variant="primary" disabled>
  Processing...
</Button>`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Card Component</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Cards are versatile containers for grouping related content:
                    </p>
                    <CodeBlock
                      code={`import { Card } from './components/Card';
import { Brain } from 'lucide-react';

// Basic card
<Card>
  <h3>MindMesh</h3>
  <p>Create and visualize mind maps</p>
</Card>

// Card with custom padding
<Card padding="var(--space-8)">
  <div className="flex items-center gap-4">
    <div className="size-12 bg-blue-100 dark:bg-blue-900/30 
                    rounded-xl flex items-center justify-center">
      <Brain className="size-6 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <h3 className="font-bold">MindMesh</h3>
      <p className="text-sm text-[var(--text-secondary)]">
        Mind mapping tool
      </p>
    </div>
  </div>
</Card>

// Interactive card
<Card className="hover:shadow-xl cursor-pointer transition-shadow">
  {/* Clickable content */}
</Card>`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Module-Specific Icons</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      LifeSync AI has dedicated icons for each module. Always use the correct icon to maintain consistency:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Brain className="size-6 text-blue-600 dark:text-blue-400" />
                          <h5 className="font-bold text-blue-900 dark:text-blue-300">MindMesh</h5>
                        </div>
                        <code className="text-xs font-mono text-blue-800 dark:text-blue-200">
                          {'<Brain className="size-6" />'}
                        </code>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet className="size-6 text-emerald-600 dark:text-emerald-400" />
                          <h5 className="font-bold text-emerald-900 dark:text-emerald-300">BudgetBuddy</h5>
                        </div>
                        <code className="text-xs font-mono text-emerald-800 dark:text-emerald-200">
                          {'<Wallet className="size-6" />'}
                        </code>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Compass className="size-6 text-purple-600 dark:text-purple-400" />
                          <h5 className="font-bold text-purple-900 dark:text-purple-300">CareerCompass</h5>
                        </div>
                        <code className="text-xs font-mono text-purple-800 dark:text-purple-200">
                          {'<Compass className="size-6" />'}
                        </code>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="size-6 text-amber-600 dark:text-amber-400" />
                          <h5 className="font-bold text-amber-900 dark:text-amber-300">AutoPersona</h5>
                        </div>
                        <code className="text-xs font-mono text-amber-800 dark:text-amber-200">
                          {'<Target className="size-6" />'}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Composing Complex Interfaces</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Here's an example of composing multiple components to create a module card:
                    </p>
                    <CodeBlock
                      code={`import { Card } from './components/Card';
import { Button } from './components/Button';
import { Brain, ArrowRight, TrendingUp } from 'lucide-react';

export function ModuleCard() {
  return (
    <Card>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="size-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #5B61FF 100%)'
          }}
        >
          <Brain className="size-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            MindMesh
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Mind mapping & brainstorming
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6">
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            24
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Active Maps
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            156
          </p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Total Nodes
          </p>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-4" />
          <span className="text-sm font-semibold">+12%</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="primary" size="md" className="flex-1">
          Open Module
          <ArrowRight className="size-4 ml-2" />
        </Button>
        <Button variant="outline" size="md">
          Settings
        </Button>
      </div>
    </Card>
  );
}`}
                      language="tsx"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6">
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="size-5" />
                      Component Best Practices
                    </h4>
                    <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Use semantic HTML elements for better accessibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Always provide alt text for icons used as content (not decorative)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Use appropriate button sizes for touch targets (minimum 44x44px)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Maintain consistent spacing using design tokens</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Test interactive states (hover, focus, active, disabled)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Use loading states for async operations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Motion Guidelines */}
            {activeGuide === "motion" && (
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <Move className="size-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Motion Guidelines</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Animation principles and implementation patterns for LifeSync AI
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Motion Philosophy</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Motion in LifeSync AI serves three primary purposes:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2">1. Feedback</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Confirm user actions and system responses through visual feedback
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2">2. Guidance</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Direct attention and guide users through workflows
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2">3. Continuity</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Create smooth transitions that maintain spatial context
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Duration Tokens</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Use predefined duration tokens for consistent timing across the application:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <code className="font-mono text-sm text-blue-600 dark:text-blue-400">--duration-fast</code>
                          <span className="font-bold text-slate-900 dark:text-white">150ms</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Quick interactions: hover states, small micro-interactions
                        </p>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <code className="font-mono text-sm text-blue-600 dark:text-blue-400">--duration-base</code>
                          <span className="font-bold text-slate-900 dark:text-white">200ms</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Standard transitions: fades, slides, scale animations
                        </p>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <code className="font-mono text-sm text-blue-600 dark:text-blue-400">--duration-slow</code>
                          <span className="font-bold text-slate-900 dark:text-white">300ms</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Complex transitions: page changes, modal overlays
                        </p>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                          <code className="font-mono text-sm text-blue-600 dark:text-blue-400">--duration-slower</code>
                          <span className="font-bold text-slate-900 dark:text-white">500ms</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Emphasized animations: onboarding, feature reveals
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Easing Functions</h4>
                    <CodeBlock
                      code={`/* From tokens.toon */
{
  "motion": {
    "easing": {
      "linear": "linear",                          // Constant speed
      "in": "cubic-bezier(0.4, 0, 1, 1)",         // Starts slow, ends fast
      "out": "cubic-bezier(0, 0, 0.2, 1)",        // Starts fast, ends slow
      "inOut": "cubic-bezier(0.4, 0, 0.2, 1)"     // Smooth acceleration/deceleration
    }
  }
}

/* Usage in CSS */
.element {
  transition: transform var(--duration-base) var(--easing);
}`}
                      language="json"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Implementation with Motion (Framer Motion)</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      LifeSync uses Motion (Framer Motion) for declarative animations:
                    </p>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Fade In Animation</h5>
                        <CodeBlock
                          code={`import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>`}
                          language="tsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Slide Up Animation</h5>
                        <CodeBlock
                          code={`<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>
  Content
</motion.div>`}
                          language="tsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Stagger Children</h5>
                        <CodeBlock
                          code={`<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>`}
                          language="tsx"
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3">Modal Animation</h5>
                        <CodeBlock
                          code={`import { AnimatePresence } from 'motion/react';

<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: 'var(--surface-overlay)' }}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        Modal Content
      </motion.div>
    </>
  )}
</AnimatePresence>`}
                          language="tsx"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-6">
                    <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                      <Lightbulb className="size-5" />
                      Motion Best Practices
                    </h4>
                    <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Keep animations under 500ms for most interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Use ease-out for elements entering the screen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Use ease-in for elements leaving the screen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✓</span>
                        <span>Respect prefers-reduced-motion for accessibility</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✗</span>
                        <span>Don't animate large content blocks or images</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✗</span>
                        <span>Don't use different easing functions in the same transition group</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility */}
            {activeGuide === "accessibility" && (
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="size-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Accessibility Guidelines</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Building inclusive experiences that work for everyone
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">WCAG 2.1 AA Compliance</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      LifeSync AI is designed to meet WCAG 2.1 Level AA standards. Here are the key areas of focus:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Color Contrast', description: 'All text meets 4.5:1 contrast ratio (3:1 for large text)', status: 'Compliant' },
                        { title: 'Keyboard Navigation', description: 'All interactive elements are keyboard accessible', status: 'Compliant' },
                        { title: 'Screen Readers', description: 'Proper ARIA labels and semantic HTML', status: 'Compliant' },
                        { title: 'Focus Indicators', description: 'Visible focus states for all interactive elements', status: 'Compliant' },
                      ].map((item, i) => (
                        <div key={i} className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-emerald-900 dark:text-emerald-300">{item.title}</h5>
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Color Contrast</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      All color combinations in the design system have been tested for adequate contrast:
                    </p>
                    <CodeBlock
                      code={`/* Light Mode - Text on Background */
--text-primary (#0F172A) on --background (#F8FAFC)
Contrast Ratio: 15.8:1 ✓ AAA (Exceeds requirements)

--text-secondary (#475569) on --background (#F8FAFC)
Contrast Ratio: 7.2:1 ✓ AA

/* Dark Mode - Text on Background */
--text-primary (#F8FAFC) on --background (#0D0F14)
Contrast Ratio: 17.2:1 ✓ AAA

/* Interactive Elements */
--color-primary-600 (#2563EB) on white
Contrast Ratio: 5.1:1 ✓ AA`}
                      language="css"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Keyboard Navigation</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Ensure all interactive elements are keyboard accessible:
                    </p>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-900">
                          <tr>
                            <th className="text-left p-4 text-slate-900 dark:text-white font-semibold">Key</th>
                            <th className="text-left p-4 text-slate-900 dark:text-white font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700 dark:text-slate-300">
                          <tr className="border-t border-slate-200 dark:border-slate-800">
                            <td className="p-4"><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Tab</kbd></td>
                            <td className="p-4">Move focus to next interactive element</td>
                          </tr>
                          <tr className="border-t border-slate-200 dark:border-slate-800">
                            <td className="p-4"><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Shift + Tab</kbd></td>
                            <td className="p-4">Move focus to previous interactive element</td>
                          </tr>
                          <tr className="border-t border-slate-200 dark:border-slate-800">
                            <td className="p-4"><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Enter / Space</kbd></td>
                            <td className="p-4">Activate button or link</td>
                          </tr>
                          <tr className="border-t border-slate-200 dark:border-slate-800">
                            <td className="p-4"><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Esc</kbd></td>
                            <td className="p-4">Close modal or dropdown</td>
                          </tr>
                          <tr className="border-t border-slate-200 dark:border-slate-800">
                            <td className="p-4"><kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Arrow Keys</kbd></td>
                            <td className="p-4">Navigate within dropdowns, menus, tabs</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">ARIA Implementation</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Examples of proper ARIA usage for common patterns:
                    </p>
                    <CodeBlock
                      code={`// Button with icon only - add aria-label
<button aria-label="Close modal">
  <X className="size-5" />
</button>

// Loading state
<button aria-busy="true" aria-label="Loading">
  <Loader2 className="size-5 animate-spin" />
</button>

// Disabled state
<button disabled aria-disabled="true">
  Submit
</button>

// Toggle button
<button 
  aria-pressed={isActive}
  onClick={() => setIsActive(!isActive)}
>
  {isActive ? 'Active' : 'Inactive'}
</button>

// Navigation
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// Modal
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Modal Title</h2>
</div>`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reduced Motion</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Respect user preferences for reduced motion:
                    </p>
                    <CodeBlock
                      code={`// CSS approach
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// React / Motion approach
import { useReducedMotion } from 'motion/react';

function Component() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3
      }}
    >
      Content
    </motion.div>
  );
}`}
                      language="tsx"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-900/30 rounded-2xl p-6">
                    <h4 className="font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="size-5" />
                      Accessibility Checklist
                    </h4>
                    <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                      <li className="flex items-start gap-2">
                        <span>☑</span>
                        <span>Test with keyboard only (no mouse)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>☑</span>
                        <span>Verify screen reader announcements (NVDA, VoiceOver)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>☑</span>
                        <span>Check color contrast with tools (Stark, Contrast Checker)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>☑</span>
                        <span>Ensure focus indicators are visible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>☑</span>
                        <span>Test with browser zoom at 200%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>☑</span>
                        <span>Enable "Reduce Motion" in system preferences and test</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Developer Handoff */}
            {activeGuide === "developer" && (
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center flex-shrink-0">
                    <Code className="size-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Developer Handoff</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Translating designs into production-ready code
                    </p>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Export Package Overview</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      The LifeSync AI Design System provides a complete export package with everything developers need:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                          <h5 className="font-bold text-blue-900 dark:text-blue-300">tokens.toon</h5>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Complete design tokens in structured JSON format with all colors, typography, spacing, and component tokens
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <FileCode className="size-5 text-purple-600 dark:text-purple-400" />
                          <h5 className="font-bold text-purple-900 dark:text-purple-300">globals.css</h5>
                        </div>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          Pre-compiled CSS variables for both light and dark modes, ready to import
                        </p>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Package className="size-5 text-emerald-600 dark:text-emerald-400" />
                          <h5 className="font-bold text-emerald-900 dark:text-emerald-300">components/</h5>
                        </div>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">
                          React component examples (Button, Card, Input) showing proper token usage
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Download className="size-5 text-amber-600 dark:text-amber-400" />
                          <h5 className="font-bold text-amber-900 dark:text-amber-300">icon-pack/</h5>
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          100+ SVG icons organized by category with usage mapping
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Design to Code Workflow</h4>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                          1
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">Download Export Package</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Go to <strong>Export Assets</strong> section and download <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">ashborn-design-system.zip</code>
                          </p>
                          <CodeBlock
                            code={`# Extract the package
unzip ashborn-design-system.zip
cd ashborn-design-system/`}
                            language="bash"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                          2
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">Integrate into Project</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Place the design system folder in your project root or source directory
                          </p>
                          <CodeBlock
                            code={`your-project/
├── ashborn-design-system/
│   ├── tokens.toon
│   ├── globals.css
│   ├── components/
│   └── icon-pack/
├── src/
├── package.json
└── ...`}
                            language="plaintext"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                          3
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">Import CSS Variables</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Add the globals.css import to your main stylesheet
                          </p>
                          <CodeBlock
                            code={`// In your main CSS file (e.g., app/globals.css)
@import '../ashborn-design-system/globals.css';

@tailwind base;
@tailwind components;
@tailwind utilities;`}
                            language="css"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex items-center justify-center size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">
                          4
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold text-slate-900 dark:text-white mb-2">Use Component Examples</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            Copy component examples from the package or create your own using the tokens
                          </p>
                          <CodeBlock
                            code={`// Import and use the pre-built Button component
import { Button } from '../ashborn-design-system/components/Button';

<Button variant="primary" size="md">
  Click me
</Button>

// Or create your own using CSS variables
<button
  style={{
    background: 'var(--color-primary-600)',
    color: 'white',
    padding: 'var(--space-3) var(--space-6)',
    borderRadius: 'var(--radius-lg)'
  }}
>
  Custom Button
</button>`}
                            language="tsx"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reading tokens.toon Programmatically</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      For advanced use cases, you can load and process tokens at build time:
                    </p>
                    <CodeBlock
                      code={`// Load tokens in your build script or component
import tokens from './ashborn-design-system/tokens.toon';

// Access any token
const primaryColor = tokens.color.palette.primary[500];  // "#3B82F6"
const spacing = tokens.spacing[6];                        // "1.5rem"
const shadowLg = tokens.shadows.lg;                       // "0 10px 15px..."

// Generate CSS variables dynamically
function generateCSSVars() {
  let css = ':root {\\n';
  
  // Colors
  Object.entries(tokens.color.palette.primary).forEach(([key, value]) => {
    css += \`  --color-primary-\${key}: \${value};\\n\`;
  });
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    css += \`  --space-\${key}: \${value};\\n\`;
  });
  
  css += '}';
  return css;
}

// Use in Next.js app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: generateCSSVars() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}`}
                      language="tsx"
                    />
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Version Control & Collaboration</h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Recommended practices for managing design system updates:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Commit the design system folder to version control</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            This ensures all developers have access to the same tokens and components
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Use semantic versioning for updates</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Update the version in tokens.toon meta when making changes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Document breaking changes in README</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Keep a changelog of token updates and component modifications
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Set up automated testing for token changes</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Test that color contrast ratios remain compliant after updates
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Terminal className="size-5" />
                      Quick Reference
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">Download Location</p>
                        <p className="text-slate-600 dark:text-slate-400">Export Assets section → Download Complete Package</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">Support</p>
                        <p className="text-slate-600 dark:text-slate-400">Contact: ashborn@lifesync.ai</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">Current Version</p>
                        <p className="text-slate-600 dark:text-slate-400">v2.0.0 (Ashborn Edition)</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white mb-2">License</p>
                        <p className="text-slate-600 dark:text-slate-400">MIT (for included libraries)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveGuide(null)}
              className="mt-8 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Close Guide
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Installation */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Installation</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            To install the LifeSync AI Design System, you'll need Node.js 16+ and a modern package manager (npm, yarn, or pnpm). The system is framework-agnostic but optimized for React-based projects.
          </p>
          <div className="bg-[#0D0F14] rounded-xl p-6 border border-slate-800 font-mono text-sm text-slate-300 space-y-4">
            <div>
              <p className="text-slate-500 mb-2"># Install dependencies</p>
              <p><span className="text-purple-400">npm</span> install tailwindcss postcss autoprefixer motion lucide-react</p>
            </div>
            <div>
              <p className="text-slate-500 mb-2"># Initialize Tailwind CSS</p>
              <p><span className="text-purple-400">npx</span> tailwindcss init -p</p>
            </div>
            <div>
              <p className="text-slate-500 mb-2"># Download design system from Export Assets</p>
              <p className="text-slate-400"># Extract and place in your project root</p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>💡 Quick Tip:</strong> Visit the <strong>Quick Start</strong> guide above for detailed step-by-step instructions on setting up your environment.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Integration</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            The system is designed to be drop-in compatible with Next.js, Vite, and Create React App projects. Import the <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">globals.css</code> file into your main stylesheet to activate all design tokens. For dynamic theming, wrap your application root with the <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">ThemeProvider</code> component (example included in export package).
          </p>
          <ul className="space-y-3">
            {[
              'Automatic Dark Mode detection based on system preferences',
              'Type-safe component props with TypeScript support',
              'Zero-runtime CSS-in-JS overhead - uses CSS variables',
              'Tree-shakable icon imports from Lucide React',
              'Full Next.js 14 App Router compatibility'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="size-6 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="size-3.5" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
