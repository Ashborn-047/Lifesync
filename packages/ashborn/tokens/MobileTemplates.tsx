import React, { useState } from "react";
import {
  Battery,
  Wifi,
  Signal,
  ChevronLeft,
  User,
  Home,
  Settings,
  Bell,
  Brain,
  Wallet,
  Compass,
  Zap,
  Plus,
  ArrowRight,
  CheckCircle2,
  MoreHorizontal,
  TrendingUp,
  Search,
  Layout,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  Cell
} from 'recharts';

// --- MOCK SCREENS ---

const MobileHeader = ({ title, leftIcon: LeftIcon, rightIcon: RightIcon }: any) => (
  <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#151821] sticky top-0 z-10 transition-colors">
    <button className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
      {LeftIcon ? <LeftIcon className="size-5" /> : <div className="size-5" />}
    </button>
    <h1 className="font-semibold text-slate-900 dark:text-white">{title}</h1>
    <button className="p-2 -mr-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
      {RightIcon ? <RightIcon className="size-5" /> : <div className="size-5" />}
    </button>
  </div>
);

const BottomNav = () => (
  <div className="h-20 pb-6 bg-white dark:bg-[#151821] border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-2 sticky bottom-0 z-10 transition-colors">
    <button className="flex flex-col items-center gap-1 p-2 text-blue-600 dark:text-blue-400">
      <Home className="size-6" />
      <span className="text-[10px] font-medium">Home</span>
    </button>
    <button className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
      <Brain className="size-6" />
      <span className="text-[10px] font-medium">Mind</span>
    </button>
    <div className="relative -top-6">
      <button className="size-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 transition-colors">
        <Plus className="size-7" />
      </button>
    </div>
    <button className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
      <Wallet className="size-6" />
      <span className="text-[10px] font-medium">Budget</span>
    </button>
    <button className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
      <User className="size-6" />
      <span className="text-[10px] font-medium">Profile</span>
    </button>
  </div>
);

// 1. Home Screen
const HomeScreen = () => (
  <div className="flex flex-col min-h-full bg-slate-50 dark:bg-[#0D0F14] transition-colors">
    <div className="p-4 pb-2 bg-white dark:bg-[#151821] transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">AS</div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Good Morning,</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Ashborn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold flex items-center gap-1">
            <Zap className="size-3 fill-current" /> 12
          </div>
          <button className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full relative">
            <Bell className="size-5" />
            <div className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-[#151821]" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-slate-900 dark:bg-blue-950 rounded-2xl text-white shadow-lg shadow-slate-200 dark:shadow-none mb-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-blue-200">
            <Zap className="size-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Daily Insight</span>
          </div>
          <p className="font-medium text-lg leading-snug mb-4">Your focus score is up 15% compared to last week.</p>
          <button className="text-sm font-semibold text-blue-300 flex items-center gap-1">View Report <ArrowRight className="size-4" /></button>
        </div>
      </div>
    </div>

    <div className="flex-1 p-4 space-y-6">
      {/* Modules */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Your Modules</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white dark:bg-[#151821] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="size-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Brain className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">MindMesh</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">3 items pending</span>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-[#151821] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="size-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Budget</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">$420 left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Plan</h3>
          <button className="text-xs text-blue-600 dark:text-blue-400 font-medium">View All</button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#151821] rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="size-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />
            <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">Morning Meditation</span>
            <span className="text-xs text-slate-400">8:00 AM</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#151821] rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="size-5 rounded-full border-2 border-blue-500 flex items-center justify-center bg-blue-500">
              <CheckCircle2 className="size-3 text-white" />
            </div>
            <span className="text-sm text-slate-400 flex-1 line-through">Review Budget</span>
            <span className="text-xs text-slate-400">Done</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#151821] rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="size-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />
            <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">Read Chapter 4</span>
            <span className="text-xs text-slate-400">9:30 PM</span>
          </div>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
);

// 2. Assessment Screen
const AssessmentScreen = () => (
  <div className="flex flex-col min-h-full bg-white dark:bg-[#0D0F14] transition-colors">
    <MobileHeader title="Daily Check-in" leftIcon={ChevronLeft} />

    <div className="flex-1 p-6 flex flex-col">
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden">
        <div className="bg-blue-600 h-full w-1/3 rounded-full" />
      </div>

      <div className="flex-1">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 block">Question 3 of 8</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">How energized do you feel right now?</h2>

        <div className="space-y-4">
          {['Fully Charged', 'Moderately Energized', 'Neutral', 'A bit drained', 'Exhausted'].map((opt, i) => (
            <button key={i} className={cn(
              "w-full p-4 rounded-xl border text-left transition-all",
              i === 1
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}>
              <span className="text-sm font-medium">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold mt-6 shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
        Continue
      </button>
    </div>
  </div>
);

// 3. Results Screen
const ResultsScreen = () => {
  const data = [
    { subject: 'Openness', A: 120, fullMark: 150 },
    { subject: 'Conscien.', A: 98, fullMark: 150 },
    { subject: 'Extrav.', A: 86, fullMark: 150 },
    { subject: 'Agreeable', A: 99, fullMark: 150 },
    { subject: 'Neurot.', A: 85, fullMark: 150 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-[#0D0F14] transition-colors">
      <MobileHeader title="Personality Profile" leftIcon={ChevronLeft} rightIcon={MoreHorizontal} />

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-[#151821] p-6 pb-8 rounded-b-3xl shadow-sm border-b border-slate-100 dark:border-slate-800">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Mike" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">The Architect</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">INTJ-A • Rare Personality</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Top Strengths</h3>
            <div className="flex flex-wrap gap-2">
              {["Strategic Thinking", "Independence", "Analysis"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-900/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#151821] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-500 uppercase">Recommendation</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Leverage your analytical nature.</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You thrive when solving complex problems. Consider allocating more time to deep work sessions in the morning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Budget Screen (Module)
const BudgetScreen = () => {
  const data = [
    { name: 'Mon', amt: 400 },
    { name: 'Tue', amt: 300 },
    { name: 'Wed', amt: 600 },
    { name: 'Thu', amt: 200 },
    { name: 'Fri', amt: 500 },
    { name: 'Sat', amt: 800 },
    { name: 'Sun', amt: 100 },
  ];

  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-[#0D0F14] transition-colors">
      <div className="bg-emerald-600 p-6 pb-12 text-white rounded-b-[2.5rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <ChevronLeft className="size-5" />
          </div>
          <span className="font-medium">BudgetBuddy</span>
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Settings className="size-5" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-emerald-100 text-sm font-medium mb-1">Total Balance</p>
          <h1 className="text-4xl font-bold">$12,450.00</h1>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-500/30 rounded-full text-xs font-medium backdrop-blur-sm border border-emerald-400/30">
            <TrendingUp className="size-3" /> +$1,200 this month
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-8">
        {/* Spending Graph Card */}
        <div className="bg-white dark:bg-[#151821] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Spending Trend</h3>
            <select className="text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-1 px-2 text-slate-600 dark:text-slate-400 font-medium outline-none">
              <option>This Week</option>
            </select>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={128}>
              <BarChart data={data}>
                <Bar dataKey="amt" radius={[4, 4, 4, 4]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#10b981' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-[#151821] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Transactions</h3>
            <button className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">See All</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl">🍔</div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Burger King</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Today, 12:30 PM</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">-$14.50</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Career Screen
const CareerScreen = () => (
  <div className="flex flex-col min-h-full bg-white dark:bg-[#0D0F14] transition-colors">
    <MobileHeader title="CareerCompass" leftIcon={ChevronLeft} rightIcon={Search} />
    <div className="p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Product Design Path</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Level 4 • Senior Designer</p>
        <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div className="bg-orange-500 h-full rounded-full w-3/4" />
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Junior</span>
          <span className="text-orange-600 dark:text-orange-400">Senior</span>
          <span>Lead</span>
        </div>
      </div>

      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recommended Skills</h3>
      <div className="space-y-4">
        {[
          { name: "Advanced Prototyping", type: "Technical", time: "2h 30m", progress: 40 },
          { name: "Stakeholder Management", type: "Soft Skill", time: "45m", progress: 10 },
          { name: "Design Systems", type: "Technical", time: "5h", progress: 85 },
        ].map((skill, i) => (
          <div key={i} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4 shadow-sm bg-white dark:bg-[#151821]">
            <div className="size-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
              {skill.progress}%
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{skill.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{skill.type} • {skill.time} left</p>
            </div>
            <button className="p-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-bold">Resume</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 6. Onboarding Screen
const OnboardingScreen = () => (
  <div className="flex flex-col min-h-full bg-white dark:bg-[#0D0F14] relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-transparent pointer-events-none" />

    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
      <div className="size-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30 rotate-12">
        <Brain className="size-12" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Welcome to LifeSync</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-12 leading-relaxed">
        Your personal AI companion for productivity, mental clarity, and financial growth.
      </p>

      <div className="flex gap-2 mb-12">
        <div className="h-1.5 w-8 bg-blue-600 rounded-full" />
        <div className="h-1.5 w-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-1.5 w-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-transform">
        Get Started
      </button>
      <button className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        I already have an account
      </button>
    </div>
  </div>
);

// --- PHONE FRAME COMPONENT ---

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto border-slate-900 bg-slate-900 border-[14px] rounded-[2.5rem] h-[800px] w-[375px] shadow-2xl overflow-hidden ring-8 ring-slate-200 dark:ring-slate-800">
    <div className="h-[32px] w-[3px] bg-slate-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
    <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
    <div className="h-[46px] w-[3px] bg-slate-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
    <div className="h-[64px] w-[3px] bg-slate-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
    <div className="rounded-[2rem] overflow-hidden size-full bg-white dark:bg-[#0D0F14] relative transition-colors">
      {/* Status Bar Placeholder */}
      <div className="h-10 bg-transparent absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 pointer-events-none">
        <span className="text-xs font-bold text-slate-900 dark:text-white">9:41</span>
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
          <Signal className="size-3.5" />
          <Wifi className="size-3.5" />
          <Battery className="size-4" />
        </div>
      </div>
      {/* Content */}
      <div className="h-full overflow-y-auto no-scrollbar pt-10 pb-4">
        {children}
      </div>
    </div>
  </div>
);

export default function MobileTemplates() {
  const [currentScreen, setCurrentScreen] = useState("home");

  const screens = [
    { id: "onboarding", label: "Onboarding", component: OnboardingScreen },
    { id: "home", label: "Home Dashboard", component: HomeScreen },
    { id: "assessment", label: "Assessment Flow", component: AssessmentScreen },
    { id: "results", label: "Results / Profile", component: ResultsScreen },
    { id: "budget", label: "BudgetBuddy", component: BudgetScreen },
    { id: "career", label: "CareerCompass", component: CareerScreen },
  ];

  const ActiveComponent = screens.find(s => s.id === currentScreen)?.component || HomeScreen;

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Mobile Templates</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          High-fidelity mobile screens demonstrating the core user flows and module interfaces. Now with dark mode.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Controls */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-[#151821] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Select Screen</h3>
            <div className="space-y-2">
              {screens.map(screen => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreen(screen.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors",
                    currentScreen === screen.id
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                  )}
                >
                  {screen.label}
                  {currentScreen === screen.id && <CheckCircle2 className="size-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <h4 className="text-blue-900 dark:text-blue-300 font-bold mb-2">Design Notes</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <li>Switch Global Theme to see Dark Mode variants.</li>
              <li>Bottom navigation is sticky and prominent.</li>
              <li>Cards use soft shadows for depth.</li>
            </ul>
          </div>
        </div>

        {/* Preview */}
        <div className="w-full lg:w-2/3 flex justify-center bg-slate-100 dark:bg-[#0D0F14] py-12 rounded-3xl border border-slate-200 dark:border-slate-800">
          <PhoneFrame>
            <ActiveComponent />
          </PhoneFrame>
        </div>
      </div>
    </div>
  );
}
