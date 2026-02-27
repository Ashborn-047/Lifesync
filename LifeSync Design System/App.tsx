import React, { useState } from "react";
import { 
  Layout, 
  Type, 
  Palette, 
  Component, 
  Smartphone, 
  Monitor, 
  Grid, 
  Activity, 
  Brain, 
  Wallet, 
  Compass, 
  User,
  Menu,
  X,
  ChevronRight,
  FolderDown,
  BookOpen,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

import { ThemeProvider } from "./components/design-system/ThemeProvider";
import { ThemeToggle } from "./components/design-system/ThemeToggle";

// Sections
import Foundations from "./components/design-system/Foundations";
import Iconography from "./components/design-system/Iconography";
import ComponentLibrary from "./components/design-system/ComponentLibrary";
import MobileTemplates from "./components/design-system/MobileTemplates";
import WebTemplates from "./components/design-system/WebTemplates";
import ExportAssets from "./components/design-system/ExportAssets";
import Documentation from "./components/design-system/Documentation";

type View = "foundations" | "iconography" | "components" | "mobile" | "web" | "modules" | "export" | "docs";

export default function App() {
  const [activeView, setActiveView] = useState<View>("foundations");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: "foundations", label: "Foundations", icon: Palette },
    { id: "iconography", label: "Iconography", icon: Sparkles },
    { id: "components", label: "Components", icon: Grid },
    { id: "mobile", label: "Mobile Templates", icon: Smartphone },
    { id: "web", label: "Web Templates", icon: Monitor },
    { id: "export", label: "Export Assets", icon: FolderDown },
    { id: "docs", label: "Documentation", icon: BookOpen },
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="lifesync-theme">
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D0F14] flex font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#151821] border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
            !isSidebarOpen && "-translate-x-full lg:hidden"
          )}
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Activity className="size-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">LifeSync AI</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ashborn Edition v2.0</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as View);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  activeView === item.id 
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <item.icon className={cn("size-5", activeView === item.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500")} />
                {item.label}
                {activeView === item.id && (
                  <ChevronRight className="ml-auto size-4 text-blue-400 dark:text-blue-500/50" />
                )}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-700">
                AS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Ashborn</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Ui/Ux Designer</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50 dark:bg-[#0D0F14]">
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151821] flex items-center justify-between px-6 lg:px-10 shrink-0 transition-colors">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                <Menu className="size-6" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {navItems.find(i => i.id === activeView)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button 
                onClick={() => setActiveView('export')}
                className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <FolderDown className="size-4" />
                Export Assets
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeView === "foundations" && <Foundations />}
                  {activeView === "iconography" && <Iconography />}
                  {activeView === "components" && <ComponentLibrary />}
                  {activeView === "mobile" && <MobileTemplates />}
                  {activeView === "web" && <WebTemplates />}
                  {activeView === "export" && <ExportAssets />}
                  {activeView === "docs" && <Documentation />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
