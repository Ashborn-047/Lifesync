import React, { useState } from "react";
import {
  // Navigation & UI
  Menu, X, ChevronRight, ChevronDown, ChevronLeft, ChevronUp,
  ArrowRight, ArrowLeft, Home, Settings, Search, Bell, User,
  MoreHorizontal, MoreVertical,

  // Actions
  Plus, Minus, Edit, Trash2, Save, Download, Upload, Share2,
  Copy, Check, X as XCircle, AlertCircle, Info, HelpCircle,

  // Module Icons
  Brain, Wallet, Compass, Target, Zap, Heart, Star, Award,
  Trophy, TrendingUp, TrendingDown, Activity, BarChart3,

  // File & Content
  File, Folder, FileText, Image, Video, Music, Calendar,
  Clock, Bookmark, Tag, Paperclip,

  // Communication
  Mail, MessageCircle, Send, Phone, Video as VideoIcon,

  // Status & Feedback
  CheckCircle, AlertTriangle, XCircle as XCircleIcon,
  Loader2, Shield, Lock, Unlock, Eye, EyeOff,

  // Social & Sharing
  ThumbsUp, ThumbsDown, Share, Flag, Heart as HeartIcon,

  // Misc
  Filter, Grid, List, Map, Sun, Moon, Maximize2, Minimize2,
  RefreshCw, LogOut, LogIn, UserPlus
} from "lucide-react";
import { cn } from "../lib/utils";

// Icon categories for organized display
type IconItem = {
  name: string;
  component: any;
  label?: string;
};

const iconCategories: { name: string; description?: string; icons: IconItem[] }[] = [
  {
    name: "Navigation & UI",
    icons: [
      { name: "Menu", component: Menu },
      { name: "X", component: X },
      { name: "ChevronRight", component: ChevronRight },
      { name: "ChevronDown", component: ChevronDown },
      { name: "ChevronLeft", component: ChevronLeft },
      { name: "ChevronUp", component: ChevronUp },
      { name: "ArrowRight", component: ArrowRight },
      { name: "ArrowLeft", component: ArrowLeft },
      { name: "Home", component: Home },
      { name: "Settings", component: Settings },
      { name: "Search", component: Search },
      { name: "Bell", component: Bell },
      { name: "User", component: User },
      { name: "MoreHorizontal", component: MoreHorizontal },
      { name: "MoreVertical", component: MoreVertical },
    ]
  },
  {
    name: "Actions",
    icons: [
      { name: "Plus", component: Plus },
      { name: "Minus", component: Minus },
      { name: "Edit", component: Edit },
      { name: "Trash2", component: Trash2 },
      { name: "Save", component: Save },
      { name: "Download", component: Download },
      { name: "Upload", component: Upload },
      { name: "Share2", component: Share2 },
      { name: "Copy", component: Copy },
      { name: "Check", component: Check },
    ]
  },
  {
    name: "Module Icons",
    description: "Core module identifiers for LifeSync AI",
    icons: [
      { name: "Brain", component: Brain, label: "MindMesh" },
      { name: "Wallet", component: Wallet, label: "BudgetBuddy" },
      { name: "Compass", component: Compass, label: "CareerCompass" },
      { name: "Target", component: Target, label: "AutoPersona" },
      { name: "Zap", component: Zap },
      { name: "Heart", component: Heart },
      { name: "Star", component: Star },
      { name: "Award", component: Award },
      { name: "Trophy", component: Trophy },
    ]
  },
  {
    name: "Data & Analytics",
    icons: [
      { name: "TrendingUp", component: TrendingUp },
      { name: "TrendingDown", component: TrendingDown },
      { name: "Activity", component: Activity },
      { name: "BarChart3", component: BarChart3 },
    ]
  },
  {
    name: "File & Content",
    icons: [
      { name: "File", component: File },
      { name: "Folder", component: Folder },
      { name: "FileText", component: FileText },
      { name: "Image", component: Image },
      { name: "Video", component: Video },
      { name: "Music", component: Music },
      { name: "Calendar", component: Calendar },
      { name: "Clock", component: Clock },
      { name: "Bookmark", component: Bookmark },
      { name: "Tag", component: Tag },
      { name: "Paperclip", component: Paperclip },
    ]
  },
  {
    name: "Communication",
    icons: [
      { name: "Mail", component: Mail },
      { name: "MessageCircle", component: MessageCircle },
      { name: "Send", component: Send },
      { name: "Phone", component: Phone },
      { name: "Video", component: VideoIcon },
    ]
  },
  {
    name: "Status & Feedback",
    icons: [
      { name: "CheckCircle", component: CheckCircle },
      { name: "AlertCircle", component: AlertCircle },
      { name: "AlertTriangle", component: AlertTriangle },
      { name: "XCircle", component: XCircleIcon },
      { name: "Info", component: Info },
      { name: "HelpCircle", component: HelpCircle },
      { name: "Loader2", component: Loader2 },
      { name: "Shield", component: Shield },
      { name: "Lock", component: Lock },
      { name: "Unlock", component: Unlock },
      { name: "Eye", component: Eye },
      { name: "EyeOff", component: EyeOff },
    ]
  },
  {
    name: "Social & Interaction",
    icons: [
      { name: "ThumbsUp", component: ThumbsUp },
      { name: "ThumbsDown", component: ThumbsDown },
      { name: "Share", component: Share },
      { name: "Flag", component: Flag },
      { name: "Heart", component: HeartIcon },
    ]
  },
  {
    name: "Utilities",
    icons: [
      { name: "Filter", component: Filter },
      { name: "Grid", component: Grid },
      { name: "List", component: List },
      { name: "Map", component: Map },
      { name: "Sun", component: Sun },
      { name: "Moon", component: Moon },
      { name: "Maximize2", component: Maximize2 },
      { name: "Minimize2", component: Minimize2 },
      { name: "RefreshCw", component: RefreshCw },
      { name: "LogOut", component: LogOut },
      { name: "LogIn", component: LogIn },
      { name: "UserPlus", component: UserPlus },
    ]
  },
];

// Icon sizes following design tokens
const iconSizes = [
  { name: "XS", size: 12, class: "size-3" },
  { name: "SM", size: 16, class: "size-4" },
  { name: "MD", size: 20, class: "size-5" },
  { name: "LG", size: 24, class: "size-6" },
  { name: "XL", size: 32, class: "size-8" },
  { name: "2XL", size: 40, class: "size-10" },
  { name: "3XL", size: 48, class: "size-12" },
];

const IconCard = ({ icon: IconComponent, name, label }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`import { ${name} } from "lucide-react";`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group relative flex flex-col items-center justify-center p-4 bg-white dark:bg-[#151821] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:shadow-lg cursor-pointer"
    >
      <IconComponent className="size-6 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {name}
      </span>
      {label && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          {label}
        </span>
      )}
      {isCopied && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
          Copied!
        </div>
      )}
    </button>
  );
};

export default function Iconography() {
  return (
    <div className="space-y-20 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Iconography</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          A comprehensive icon system powered by Lucide React. Click any icon to copy its import statement.
        </p>
      </div>

      {/* Icon Sizes Token Display */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Icon Sizes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Standardized icon sizes following our spacing scale
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {iconSizes.map((size) => (
            <div
              key={size.name}
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4 h-16">
                  <Brain className={cn(size.class, "text-blue-600 dark:text-blue-400")} />
                </div>
                <div className="space-y-1 text-center">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {size.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {size.size}px
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                    {size.class}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Icon Library by Category */}
      {iconCategories.map((category, idx) => (
        <section key={idx} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{category.name}</h2>
            {category.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {category.icons.map((icon, iconIdx) => (
              <IconCard
                key={iconIdx}
                icon={icon.component}
                name={icon.name}
                label={icon.label}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Usage Guidelines */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
          Usage Guidelines
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Do's */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Do</h3>
            </div>
            <ul className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
              <li className="flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">•</span>
                <span>Use consistent icon sizes within the same context</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">•</span>
                <span>Maintain 1:1 aspect ratio (use size-* classes)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">•</span>
                <span>Use semantic icon choices that match user expectations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">•</span>
                <span>Pair icons with text labels for clarity</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">•</span>
                <span>Use module-specific icons (Brain, Wallet, Compass, Target)</span>
              </li>
            </ul>
          </div>

          {/* Don'ts */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
              <h3 className="font-bold text-red-900 dark:text-red-300">Don't</h3>
            </div>
            <ul className="space-y-3 text-sm text-red-800 dark:text-red-200">
              <li className="flex gap-2">
                <span className="text-red-600 dark:text-red-400">•</span>
                <span>Mix different icon styles or libraries</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 dark:text-red-400">•</span>
                <span>Use icons that are too small to recognize (&lt;16px)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 dark:text-red-400">•</span>
                <span>Overuse icons - they should enhance, not clutter</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 dark:text-red-400">•</span>
                <span>Rotate or transform icons in unconventional ways</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-600 dark:text-red-400">•</span>
                <span>Use decorative icons without proper aria-hidden attribute</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
          Code Examples
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Usage */}
          <div className="bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Basic Usage</h3>
            </div>
            <div className="p-6">
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                {`import { Brain } from "lucide-react";

<Brain className="size-6 text-blue-600" />`}
              </pre>
            </div>
          </div>

          {/* With Button */}
          <div className="bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">With Button</h3>
            </div>
            <div className="p-6">
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                {`import { Plus } from "lucide-react";

<button>
  <Plus className="size-4 mr-2" />
  Add New
</button>`}
              </pre>
            </div>
          </div>

          {/* Animated Icon */}
          <div className="bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Animated (Loading)</h3>
            </div>
            <div className="p-6">
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                {`import { Loader2 } from "lucide-react";

<Loader2 className="size-5 animate-spin" />`}
              </pre>
            </div>
          </div>

          {/* With Colors */}
          <div className="bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Themed Colors</h3>
            </div>
            <div className="p-6">
              <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono overflow-x-auto">
                {`// Auto adapts to dark mode
<Brain className="text-blue-600 
  dark:text-blue-400" />`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
          Quick Reference
        </h2>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Info className="size-5 text-blue-600 dark:text-blue-400" />
                Library Information
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Library:</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">lucide-react</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Total Icons:</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">1000+</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Stroke Width:</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">2px (default)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">License:</dt>
                  <dd className="font-mono text-slate-900 dark:text-white">MIT</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
                Module Icon Mapping
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Brain className="size-4" />
                    MindMesh
                  </dt>
                  <dd className="font-mono text-slate-900 dark:text-white">Brain</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Wallet className="size-4" />
                    BudgetBuddy
                  </dt>
                  <dd className="font-mono text-slate-900 dark:text-white">Wallet</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Compass className="size-4" />
                    CareerCompass
                  </dt>
                  <dd className="font-mono text-slate-900 dark:text-white">Compass</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Target className="size-4" />
                    AutoPersona
                  </dt>
                  <dd className="font-mono text-slate-900 dark:text-white">Target</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
