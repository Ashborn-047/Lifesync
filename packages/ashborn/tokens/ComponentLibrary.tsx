import React, { useState } from "react";
import {
  Bell,
  Search,
  ChevronRight,
  Plus,
  Trash2,
  MoreHorizontal,
  Check,
  AlertCircle,
  TrendingUp,
  Zap,
  Brain,
  Wallet,
  Compass,
  ChevronDown,
  User,
  Menu,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- REUSABLE UI COMPONENTS ---

const Button = ({ variant = "primary", size = "md", className, children, icon: Icon, ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:focus:ring-offset-slate-900";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 dark:shadow-none dark:bg-blue-600 dark:hover:bg-blue-500",
    secondary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200 dark:shadow-none dark:bg-emerald-600 dark:hover:bg-emerald-500",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/30",
    link: "text-blue-600 hover:underline p-0 h-auto dark:text-blue-400",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "size-10 p-0",
  };

  return (
    <button className={cn(baseStyles, variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes], className)} {...props}>
      {Icon && <Icon className={cn("mr-2 size-4", size === "icon" && "mr-0")} />}
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600",
        error && "border-red-300 focus:ring-red-200 dark:border-red-900 dark:focus:ring-red-900"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
  </div>
);

const Badge = ({ variant = "neutral", children }: any) => {
  const variants = {
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
    info: "bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    warning: "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
    danger: "bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant as keyof typeof variants])}>
      {children}
    </span>
  );
};

const ThemePreview = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
    <div className="bg-slate-50 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
      <div className="mb-6 flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
        <div className="size-2 bg-slate-400 rounded-full" /> Light Mode
      </div>
      <div className="flex-1 flex items-center justify-center light w-full">
        {children}
      </div>
    </div>
    <div className="bg-[#0D0F14] p-8 flex flex-col">
      <div className="mb-6 flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider">
        <div className="size-2 bg-slate-600 rounded-full" /> Dark Mode
      </div>
      <div className="flex-1 flex items-center justify-center dark w-full text-slate-200">
        <div className="dark w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  </div>
);

// --- DEMO SECTION ---

export default function ComponentLibrary() {
  // Mock Data for Charts
  const chartData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 60 },
    { name: 'Thu', value: 45 },
    { name: 'Fri', value: 80 },
    { name: 'Sat', value: 55 },
    { name: 'Sun', value: 70 },
  ];

  return (
    <div className="space-y-20 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Component Library</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          A collection of reusable, accessible, and modular components tailored for the LifeSync AI ecosystem.
          Now supporting full Dark Mode.
        </p>
      </div>

      {/* 2.1 Buttons */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Buttons</h2>
        <ThemePreview title="Buttons">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="primary" icon={Plus}>Add New</Button>
            </div>
          </div>
        </ThemePreview>
      </section>

      {/* 2.2 Inputs */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Inputs & Forms</h2>
        <ThemePreview title="Inputs">
          <div className="w-full max-w-md space-y-4">
            <Input label="Email Address" placeholder="ashborn@lifesync.ai" />
            <Input label="Password" type="password" placeholder="••••••••" />

            <div className="flex items-center gap-8 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="size-5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center text-white"></div>
                <span className="text-sm text-slate-700 dark:text-slate-300">Remember me</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </ThemePreview>
      </section>

      {/* 2.3 Cards */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric Card */}
          <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <TrendingUp className="size-5" />
              </div>
              <Badge variant="success">+12%</Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Weekly Focus</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">84.5 hrs</h3>
          </div>

          {/* Insight Card */}
          <div className="p-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 opacity-90">
                <Zap className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Daily Insight</span>
              </div>
              <h3 className="text-lg font-bold mb-2 leading-snug">Your energy peaks at 10 AM.</h3>
              <p className="text-sm opacity-80 leading-relaxed">Try scheduling your deep work sessions during this window for maximum output.</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
              <Zap className="size-40" />
            </div>
          </div>

          {/* Profile Card */}
          <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
            <div className="size-20 rounded-full bg-slate-200 dark:bg-slate-800 mb-4 border-4 border-white dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="size-full bg-gradient-to-br from-blue-400 to-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ashborn</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ui/Ux Designer</p>
            <div className="flex gap-2">
              <Badge variant="neutral">INTJ-A</Badge>
              <Badge variant="info">Level 5</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 2.4 Accordion & Components */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Interactive Components</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Accordion</h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Is this accessible?
                    <ChevronDown className="size-4 text-slate-500" />
                  </button>
                  {i === 1 && (
                    <div className="p-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151821]">
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Navigation Bar (Web)</h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="h-14 bg-white dark:bg-[#0D0F14] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <div className="font-bold text-slate-900 dark:text-white">Logo</div>
                  <div className="hidden md:flex gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-slate-900 dark:text-white">Home</span>
                    <span>Features</span>
                    <span>Pricing</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline">Log in</Button>
                  <Button size="sm">Sign up</Button>
                </div>
              </div>
              <div className="p-8 bg-slate-50 dark:bg-[#151821] text-center text-slate-400 text-sm">
                Page Content
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.6 Data Visualization */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Data Visualization (Token Aware)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Weekly Activity</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 w-full text-left">Budget Breakdown</h3>
            <div className="h-64 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Housing', value: 400 },
                      { name: 'Food', value: 300 },
                      { name: 'Savings', value: 300 },
                      { name: 'Fun', value: 200 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#6366f1" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">$4.2k</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
