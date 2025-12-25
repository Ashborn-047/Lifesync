import React, { useState } from "react";
import {
   LayoutDashboard,
   Target,
   BookOpen,
   Users,
   Settings,
   Bell,
   Search,
   ChevronRight,
   MoreHorizontal,
   Plus,
   Check,
   Brain,
   Wallet,
   Compass,
   Zap,
   Briefcase,
   LogOut,
   Moon,
   Sun
} from "lucide-react";
import { cn } from "../lib/utils";
import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   Tooltip,
   ResponsiveContainer,
   BarChart,
   Bar
} from 'recharts';
import { ThemeToggle } from "./ThemeToggle";

// --- MOCK WEB SCREENS ---

const WebSidebar = () => (
   <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151821] flex flex-col h-full shrink-0 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
         <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-lg shadow-blue-500/20">
            <Zap className="size-5" />
         </div>
         <span className="font-bold text-slate-900 dark:text-white text-lg">LifeSync</span>
      </div>

      <div className="p-4 space-y-8 flex-1">
         <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Platform</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
               <LayoutDashboard className="size-4" /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
               <Target className="size-4" /> Goals
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
               <BookOpen className="size-4" /> Journal
            </button>
         </div>

         <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Modules</p>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
               <Brain className="size-4" /> MindMesh
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
               <Wallet className="size-4" /> BudgetBuddy
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
               <Briefcase className="size-4" /> CareerCompass
            </button>
         </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 ring-2 ring-white dark:ring-slate-700" />
            <div className="flex-1">
               <p className="text-sm font-bold text-slate-900 dark:text-white">Ashborn</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">Pro Plan</p>
            </div>
            <Settings className="size-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" />
         </div>
      </div>
   </div>
);

const WebHeader = ({ title }: { title: string }) => (
   <div className="h-16 bg-white dark:bg-[#151821] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 transition-colors">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
      <div className="flex items-center gap-4">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0D0F14] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 dark:text-white dark:placeholder:text-slate-600 transition-colors" placeholder="Search..." />
         </div>
         <button className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-colors">
            <Bell className="size-4" />
         </button>
         <button className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-blue-600/20">
            + New Entry
         </button>
      </div>
   </div>
);

// 1. Main Dashboard
const DashboardScreen = () => {
   const data = [{ name: 'M', v: 40 }, { name: 'T', v: 30 }, { name: 'W', v: 60 }, { name: 'T', v: 45 }, { name: 'F', v: 80 }];

   return (
      <div className="flex h-[800px] bg-slate-50 dark:bg-[#0D0F14] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
         <WebSidebar />
         <div className="flex-1 flex flex-col overflow-hidden">
            <WebHeader title="Overview" />
            <div className="flex-1 overflow-y-auto p-8">
               {/* KPI Grid */}
               <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                           <Target className="size-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+12%</span>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Weekly Goals</p>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white">18/24</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                           <Brain className="size-6" />
                        </div>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Mind Clarity</p>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white">8.5</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                           <Wallet className="size-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+5%</span>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Savings</p>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white">$4.2k</h3>
                  </div>
                  <div className="p-6 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl">
                           <Zap className="size-6" />
                        </div>
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Streak</p>
                     <h3 className="text-3xl font-bold text-slate-900 dark:text-white">12 Days</h3>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6 h-96">
                  <div className="col-span-2 bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Productivity Trend</h3>
                     <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                           <AreaChart data={data}>
                              <defs>
                                 <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                 </linearGradient>
                              </defs>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                              <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} fill="url(#colorV)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Upcoming</h3>
                     <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                           <div key={i} className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                              <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white font-bold text-sm leading-none">
                                 <span>12</span>
                                 <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 uppercase">OCT</span>
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900 dark:text-white">Quarterly Review</p>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">2:00 PM • Zoom</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

// 2. MindMesh Web
const MindMeshScreen = () => {
   // Mock Nodes
   const nodes = [
      { x: '50%', y: '50%', label: 'Core Idea', size: 'lg', color: 'bg-blue-500 shadow-blue-500/50' },
      { x: '30%', y: '30%', label: 'Research', size: 'md', color: 'bg-purple-500 shadow-purple-500/50' },
      { x: '70%', y: '40%', label: 'Design', size: 'md', color: 'bg-emerald-500 shadow-emerald-500/50' },
      { x: '60%', y: '70%', label: 'Marketing', size: 'md', color: 'bg-orange-500 shadow-orange-500/50' },
      { x: '40%', y: '60%', label: 'Sales', size: 'sm', color: 'bg-slate-400 dark:bg-slate-600' },
   ];

   return (
      <div className="flex h-[800px] bg-slate-50 dark:bg-[#0D0F14] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
         <div className="w-64 bg-white dark:bg-[#151821] border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 font-bold text-slate-900 dark:text-white">
               <Brain className="mr-2 size-5 text-blue-600 dark:text-blue-400" /> MindMesh
            </div>
            <div className="p-4 space-y-2">
               <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium">All Nodes</button>
               <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors">Favorites</button>
               <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium transition-colors">Recent</button>
            </div>
         </div>
         <div className="flex-1 relative bg-slate-50 dark:bg-[#0D0F14] overflow-hidden cursor-grab active:cursor-grabbing">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Nodes */}
            {nodes.map((node, i) => (
               <div
                  key={i}
                  className="absolute flex flex-col items-center gap-2 transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer"
                  style={{ left: node.x, top: node.y }}
               >
                  <div className={cn("rounded-full border-4 border-white dark:border-[#0D0F14] shadow-lg", node.color, node.size === 'lg' ? 'size-24' : node.size === 'md' ? 'size-16' : 'size-12')} />
                  <span className="px-3 py-1 bg-white dark:bg-[#151821] rounded-full shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">{node.label}</span>
               </div>
            ))}

            {/* Floating Toolbar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-[#151821] p-2 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 flex gap-2">
               <button className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"><Plus className="size-5" /></button>
               <button className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"><Search className="size-5" /></button>
               <button className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors"><Settings className="size-5" /></button>
            </div>
         </div>
         <div className="w-80 bg-white dark:bg-[#151821] border-l border-slate-200 dark:border-slate-800 p-6 transition-colors">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 block">Details</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Core Idea</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Created on Oct 12, 2023</p>
            <div className="space-y-4">
               <div className="p-4 bg-slate-50 dark:bg-[#0D0F14] rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                  The central concept revolves around a unified dashboard for personal productivity...
               </div>
               <button className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">Add Connection</button>
            </div>
         </div>
      </div>
   );
};

// 3. AutoPersona Web
const AutoPersonaScreen = () => {
   return (
      <div className="flex h-[800px] bg-slate-50 dark:bg-[#0D0F14] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
         <WebSidebar />
         <div className="flex-1 flex flex-col">
            <WebHeader title="AutoPersona Builder" />
            <div className="flex-1 p-8 overflow-y-auto">
               <div className="max-w-4xl mx-auto">
                  {/* Timeline Header */}
                  <div className="mb-10 flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Persona Timeline</h2>
                        <p className="text-slate-500 dark:text-slate-400">Tracing the evolution of your traits over time.</p>
                     </div>
                     <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-colors">
                        Generate New Analysis
                     </button>
                  </div>

                  {/* Timeline Content */}
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-10 pb-10">
                     {[
                        { date: "Oct 15, 2023", title: "The Strategic Pivot", desc: "Shifted from high neuroticism to stability through daily meditation practices.", type: "Milestone" },
                        { date: "Sep 01, 2023", title: "Leadership Emergence", desc: "Extraversion score increased by 15% after taking the team lead role.", type: "Growth" },
                        { date: "Aug 12, 2023", title: "Baseline Assessment", desc: "Initial calibration of personality traits.", type: "Start" }
                     ].map((item, i) => (
                        <div key={i} className="relative pl-8">
                           <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-white dark:bg-[#0D0F14] border-4 border-blue-500" />
                           <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">{item.date}</span>
                           <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                              <div className="flex justify-between mb-2">
                                 <h3 className="font-bold text-slate-900 dark:text-white text-lg">{item.title}</h3>
                                 <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold">{item.type}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Action Items */}
                  <div className="grid grid-cols-2 gap-6 mt-8">
                     <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                        <h3 className="text-indigo-900 dark:text-indigo-300 font-bold mb-2">Short Term Focus</h3>
                        <ul className="space-y-3 mt-4">
                           <li className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 text-sm">
                              <Check className="size-4" /> Daily Gratitude Journaling
                           </li>
                           <li className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 text-sm">
                              <div className="size-4 border-2 border-indigo-200 dark:border-indigo-800 rounded-full" /> 10 mins Deep Breathing
                           </li>
                        </ul>
                     </div>
                     <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-slate-900 dark:text-white font-bold mb-2">Long Term Trajectory</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                           Based on current trends, you are moving towards the "Visionary" archetype. Continue reinforcing Openness traits.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

// 4. Settings Web
const SettingsScreen = () => {
   return (
      <div className="flex h-[800px] bg-slate-50 dark:bg-[#0D0F14] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
         <WebSidebar />
         <div className="flex-1 flex flex-col">
            <WebHeader title="Settings" />
            <div className="flex-1 p-8 overflow-y-auto">
               <div className="max-w-2xl mx-auto space-y-8">
                  {/* Theme Settings */}
                  <div className="bg-white dark:bg-[#151821] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Appearance</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage how LifeSync looks and feels on this device.</p>

                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0D0F14] rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                              <Moon className="size-5" />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Toggle the application theme</p>
                           </div>
                        </div>
                        {/* We can reuse the ThemeToggle component here nicely */}
                        <ThemeToggle />
                     </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="bg-white dark:bg-[#151821] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Notifications</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose what we can contact you about.</p>

                     <div className="space-y-4">
                        <label className="flex items-center justify-between cursor-pointer">
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Insights</span>
                           <div className="w-11 h-6 bg-blue-600 rounded-full relative">
                              <div className="absolute right-1 top-1 size-4 bg-white rounded-full" />
                           </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Progress Report</span>
                           <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                              <div className="absolute left-1 top-1 size-4 bg-white rounded-full shadow-sm" />
                           </div>
                        </label>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default function WebTemplates() {
   const [currentScreen, setCurrentScreen] = useState("dashboard");

   return (
      <div className="space-y-8">
         <div className="flex items-center justify-between">
            <div className="space-y-2">
               <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Web Templates</h1>
               <p className="text-lg text-slate-600 dark:text-slate-400">Responsive web application layouts for desktop users. Dark mode ready.</p>
            </div>
            <div className="flex gap-2">
               {[
                  { id: "dashboard", label: "Dashboard" },
                  { id: "mindmesh", label: "MindMesh" },
                  { id: "autopersona", label: "AutoPersona" },
                  { id: "settings", label: "Settings" }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setCurrentScreen(tab.id)}
                     className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                        currentScreen === tab.id
                           ? "bg-slate-900 dark:bg-blue-600 text-white border-transparent"
                           : "bg-white dark:bg-[#151821] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                     )}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         <div className="bg-slate-200 dark:bg-[#1E2329] p-8 rounded-3xl overflow-x-auto border border-slate-300 dark:border-slate-700">
            <div className="min-w-[1024px]">
               {currentScreen === "dashboard" && <DashboardScreen />}
               {currentScreen === "mindmesh" && <MindMeshScreen />}
               {currentScreen === "autopersona" && <AutoPersonaScreen />}
               {currentScreen === "settings" && <SettingsScreen />}
            </div>
         </div>
      </div>
   );
}
