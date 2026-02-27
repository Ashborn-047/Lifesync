import React from "react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { ColorSwatch } from "./ColorSwatch";
import { Moon, Sun, Zap, Check, AlertTriangle, Info, XCircle } from "lucide-react";

const TokenRow = ({ name, light, dark, variable }: { name: string, light: string, dark: string, variable: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 items-center">
    <div className="md:col-span-4">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</p>
      <code className="text-xs text-slate-500 dark:text-slate-400 font-mono">{variable}</code>
    </div>
    <div className="md:col-span-4 flex items-center gap-3">
      <div className="size-8 rounded-lg border border-slate-200 shadow-sm" style={{ background: light }} />
      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{light}</span>
    </div>
    <div className="md:col-span-4 flex items-center gap-3">
      <div className="size-8 rounded-lg border border-slate-700 shadow-sm" style={{ background: dark }} />
      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{dark}</span>
    </div>
  </div>
);

const ColorCard = ({ title, colorClass }: { title: string, colorClass: string }) => (
  <div className={cn("p-6 rounded-xl border flex flex-col justify-between h-32", colorClass)}>
    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</span>
  </div>
);

export default function ThemeSystem() {
  return (
    <div className="space-y-16 pb-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Theme System</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              A unified dual-theme architecture ensuring seamless transition between Light and Dark modes.
              Built on CSS variables for performance and maintainability.
            </p>
          </div>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-12">
          <div className="text-center space-y-2">
            <div className="size-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500">
              <Sun className="size-8" />
            </div>
            <p className="font-semibold text-slate-900">Light Mode</p>
          </div>
          <div className="h-px w-24 bg-slate-300 dark:bg-slate-700" />
          <div className="text-center space-y-2">
            <div className="size-16 mx-auto bg-slate-950 rounded-full flex items-center justify-center shadow-sm text-blue-400">
              <Moon className="size-8" />
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">Dark Mode</p>
          </div>
        </div>
      </div>

      {/* 1. Color Tokens */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">1.1 Color Tokens</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Primary (Blue) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Primary (Blue)</h3>
            <div className="space-y-2">
              <ColorSwatch weight="50" hex="#EFF6FF" textColor="text-slate-700" />
              <ColorSwatch weight="100" hex="#DBEAFE" textColor="text-slate-700" />
              <ColorSwatch weight="300" hex="#93C5FD" textColor="text-slate-800" />
              <ColorSwatch weight="500" hex="#3B82F6" textColor="text-white" isMain />
              <ColorSwatch weight="700" hex="#1D4ED8" textColor="text-white" />
              <ColorSwatch weight="900" hex="#1E3A8A" textColor="text-white" />
            </div>
          </div>

          {/* Secondary (Emerald) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Secondary (Emerald)</h3>
            <div className="space-y-2">
              <ColorSwatch weight="50" hex="#ECFDF5" textColor="text-slate-700" />
              <ColorSwatch weight="100" hex="#D1FAE5" textColor="text-slate-700" />
              <ColorSwatch weight="300" hex="#6EE7B7" textColor="text-slate-800" />
              <ColorSwatch weight="500" hex="#10B981" textColor="text-white" isMain />
              <ColorSwatch weight="700" hex="#047857" textColor="text-white" />
              <ColorSwatch weight="900" hex="#064E3B" textColor="text-white" isMain />
            </div>
          </div>

          {/* Accent (Coral) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Accent (Coral)</h3>
            <div className="space-y-2">
              <ColorSwatch weight="50" hex="#FFF7ED" textColor="text-slate-700" />
              <ColorSwatch weight="100" hex="#FFEDD5" textColor="text-slate-700" />
              <ColorSwatch weight="300" hex="#FDBA74" textColor="text-slate-800" />
              <ColorSwatch weight="500" hex="#F97316" textColor="text-white" isMain />
              <ColorSwatch weight="700" hex="#C2410C" textColor="text-white" />
              <ColorSwatch weight="900" hex="#7C2D12" textColor="text-white" isMain />
            </div>
          </div>

          {/* Neutral (Slate) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Neutral (Slate)</h3>
            <div className="space-y-2">
              <ColorSwatch weight="50" hex="#F8FAFC" textColor="text-slate-700" />
              <ColorSwatch weight="100" hex="#F1F5F9" textColor="text-slate-700" />
              <ColorSwatch weight="200" hex="#E2E8F0" textColor="text-slate-800" />
              <ColorSwatch weight="300" hex="#CBD5E1" textColor="text-slate-800" />
              <ColorSwatch weight="400" hex="#94A3B8" textColor="text-white" />
              <ColorSwatch weight="500" hex="#64748B" textColor="text-white" />
              <ColorSwatch weight="600" hex="#475569" textColor="text-white" />
              <ColorSwatch weight="700" hex="#334155" textColor="text-white" />
              <ColorSwatch weight="800" hex="#1E293B" textColor="text-white" />
              <ColorSwatch weight="900" hex="#0F172A" textColor="text-white" isMain />
            </div>
          </div>
        </div>
      </section>

      {/* 1.2 Semantic Tokens */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">1.2 Semantic Tokens</h2>

        <div className="bg-white dark:bg-[#181B22] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 font-bold text-xs uppercase tracking-wider text-slate-500">
            <div className="md:col-span-4">Token Name</div>
            <div className="md:col-span-4">Light Value</div>
            <div className="md:col-span-4">Dark Value</div>
          </div>

          <TokenRow name="Background" variable="--background" light="#F8FAFC" dark="#0D0F14" />
          <TokenRow name="Surface" variable="--surface" light="#FFFFFF" dark="#151821" />
          <TokenRow name="Surface Hover" variable="--surface-hover" light="#F1F5F9" dark="#1C1F27" />
          <TokenRow name="Card" variable="--card" light="#FFFFFF" dark="#181B22" />
          <TokenRow name="Border" variable="--border" light="#E2E8F0" dark="#2A2E36" />
          <TokenRow name="Text Primary" variable="--text-primary" light="#0F172A" dark="#F1F4F9" />
          <TokenRow name="Text Secondary" variable="--text-secondary" light="#64748B" dark="#AEB6C6" />
          <TokenRow name="Text Muted" variable="--text-muted" light="#94A3B8" dark="#7D8595" />
        </div>
      </section>

      {/* 2. Brand Color Application */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">2. Brand Color Application</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <ColorCard title="Primary Light" colorClass="bg-blue-600 text-white" />
            <ColorCard title="Primary Dark" colorClass="bg-[#5B61FF] text-white border-none" />
            <p className="text-sm text-slate-500">Blue 600 → Indigo 500</p>
          </div>
          <div className="space-y-3">
            <ColorCard title="Secondary Light" colorClass="bg-emerald-500 text-white" />
            <ColorCard title="Secondary Dark" colorClass="bg-[#3CE0A0] text-slate-900 border-none" />
            <p className="text-sm text-slate-500">Emerald 500 → Mint 400</p>
          </div>
          <div className="space-y-3">
            <ColorCard title="Accent Light" colorClass="bg-orange-500 text-white" />
            <ColorCard title="Accent Dark" colorClass="bg-[#FF6B8A] text-white border-none" />
            <p className="text-sm text-slate-500">Orange 500 → Rose 400</p>
          </div>
        </div>
      </section>

      {/* 3. Semantic Colors */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">3. Semantic States</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center gap-3">
            <Check className="text-green-600 dark:text-[#4ADE80]" />
            <div>
              <p className="text-sm font-bold text-green-900 dark:text-[#4ADE80]">Success</p>
              <p className="text-xs text-green-700 dark:text-green-400">#4ADE80</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 flex items-center gap-3">
            <AlertTriangle className="text-amber-600 dark:text-[#FBBF24]" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-[#FBBF24]">Warning</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">#FBBF24</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 flex items-center gap-3">
            <Info className="text-sky-600 dark:text-[#38BDF8]" />
            <div>
              <p className="text-sm font-bold text-sky-900 dark:text-[#38BDF8]">Info</p>
              <p className="text-xs text-sky-700 dark:text-sky-400">#38BDF8</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center gap-3">
            <XCircle className="text-red-600 dark:text-[#F87171]" />
            <div>
              <p className="text-sm font-bold text-red-900 dark:text-[#F87171]">Danger</p>
              <p className="text-xs text-red-700 dark:text-red-400">#F87171</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Component */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">4. Toggle Component</h2>
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-[#0D0F14] border border-slate-200 dark:border-slate-800 rounded-2xl">
          <ThemeToggle className="scale-150" />
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Interactive Demo (Try clicking it)</p>
        </div>
      </section>
    </div>
  );
}
