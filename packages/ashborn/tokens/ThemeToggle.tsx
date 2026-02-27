import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        className
      )}
      aria-label="Toggle Theme"
    >
      <span className="sr-only">Toggle theme</span>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute flex size-7 items-center justify-center rounded-full shadow-sm",
          theme === "light" ? "bg-white text-amber-500 left-1" : "bg-slate-700 text-blue-400 right-1"
        )}
      >
        {theme === "light" ? (
          <Sun className="size-4 fill-current" />
        ) : (
          <Moon className="size-4 fill-current" />
        )}
      </motion.div>
      <div className="absolute left-1 flex size-7 items-center justify-center text-slate-400 dark:text-slate-600 z-0 pointer-events-none">
        <Sun className="size-4" strokeWidth={2} />
      </div>
      <div className="absolute right-1 flex size-7 items-center justify-center text-slate-400 dark:text-slate-600 z-0 pointer-events-none">
        <Moon className="size-4" strokeWidth={2} />
      </div>
    </button>
  );
}
