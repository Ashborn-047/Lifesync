import React from "react";
import { cn } from "../lib/utils";
import ThemeSystem from "./ThemeSystem";

const TypographyRow = ({ role, size, weight, sample }: { role: string, size: string, weight: string, sample: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-slate-100 dark:border-slate-800 items-center">
    <div className="md:col-span-3">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{role}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">{size} / {weight}</p>
    </div>
    <div className="md:col-span-9 overflow-hidden">
      {sample}
    </div>
  </div>
);

const SpacingBox = ({ size, label }: { size: number, label: string }) => (
  <div className="flex flex-col gap-2 items-center">
    <div
      style={{ width: size, height: size }}
      className="bg-blue-500/20 border border-blue-500 rounded-sm flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 font-mono relative"
    >
    </div>
    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{label} ({size}px)</span>
  </div>
);

const GridCol = ({ span }: { span: number }) => (
  <div className={`col-span-${span} h-12 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded flex items-center justify-center text-xs text-blue-600 dark:text-blue-400 font-mono`}>
    col-{span}
  </div>
);

export default function Foundations() {
  return (
    <div className="space-y-20">
      {/* Integrate the Theme System (Colors & Tokens) */}
      <ThemeSystem />

      {/* Typography */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Typography</h2>
        <div className="space-y-0">
          <TypographyRow
            role="Display"
            size="48px"
            weight="Bold"
            sample={<span className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">The Quick Brown Fox</span>}
          />
          <TypographyRow
            role="Heading 1"
            size="36px"
            weight="Bold"
            sample={<h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">The Quick Brown Fox</h1>}
          />
          <TypographyRow
            role="Heading 2"
            size="30px"
            weight="SemiBold"
            sample={<h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">The Quick Brown Fox</h2>}
          />
          <TypographyRow
            role="Heading 3"
            size="24px"
            weight="SemiBold"
            sample={<h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">The Quick Brown Fox</h3>}
          />
          <TypographyRow
            role="Heading 4"
            size="20px"
            weight="SemiBold"
            sample={<h4 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">The Quick Brown Fox</h4>}
          />
          <TypographyRow
            role="Body Large"
            size="18px"
            weight="Regular"
            sample={<p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">The quick brown fox jumps over the lazy dog. It was a bright and sunny morning when the adventure began.</p>}
          />
          <TypographyRow
            role="Body Default"
            size="16px"
            weight="Regular"
            sample={<p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">The quick brown fox jumps over the lazy dog. It was a bright and sunny morning when the adventure began.</p>}
          />
          <TypographyRow
            role="Small / Caption"
            size="14px"
            weight="Medium"
            sample={<p className="text-sm font-medium text-slate-500 dark:text-slate-500">The quick brown fox jumps over the lazy dog.</p>}
          />
        </div>
      </section>

      {/* Spacing */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Spacing Scale</h2>
        <div className="flex flex-wrap items-end gap-8 p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800">
          <SpacingBox size={4} label="4" />
          <SpacingBox size={8} label="8" />
          <SpacingBox size={12} label="12" />
          <SpacingBox size={16} label="16" />
          <SpacingBox size={24} label="24" />
          <SpacingBox size={32} label="32" />
          <SpacingBox size={48} label="48" />
          <SpacingBox size={64} label="64" />
        </div>
      </section>

      {/* Grid */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Grid System</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2">Mobile (4 Col)</h3>
            <div className="grid grid-cols-4 gap-4">
              {[1, 1, 1, 1].map((_, i) => <GridCol key={i} span={1} />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2">Tablet (8 Col)</h3>
            <div className="grid grid-cols-8 gap-4">
              {[1, 1, 1, 1, 1, 1, 1, 1].map((_, i) => <GridCol key={i} span={1} />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-2">Desktop (12 Col)</h3>
            <div className="grid grid-cols-12 gap-4">
              {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((_, i) => <GridCol key={i} span={1} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Elevation */}
      <section className="space-y-8 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Elevation & Shadows</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="h-32 bg-white dark:bg-[#151821] rounded-xl shadow-sm flex items-center justify-center text-sm font-medium text-slate-500 border border-slate-100 dark:border-slate-800">
            Shadow SM
          </div>
          <div className="h-32 bg-white dark:bg-[#151821] rounded-xl shadow-md flex items-center justify-center text-sm font-medium text-slate-500 border border-slate-100 dark:border-slate-800">
            Shadow MD
          </div>
          <div className="h-32 bg-white dark:bg-[#151821] rounded-xl shadow-lg flex items-center justify-center text-sm font-medium text-slate-500 border border-slate-100 dark:border-slate-800">
            Shadow LG
          </div>
          <div className="h-32 bg-white dark:bg-[#151821] rounded-xl shadow-xl flex items-center justify-center text-sm font-medium text-slate-500 border border-slate-100 dark:border-slate-800">
            Shadow XL
          </div>
        </div>
      </section>
    </div>
  );
}
