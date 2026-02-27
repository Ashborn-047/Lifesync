"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { registerGlobalToast } from "@/lib/api";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = { id, message, type, duration: 3000 };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    },
    []
  );

  // Register global toast handler
  useEffect(() => {
    registerGlobalToast(showToast);
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-4 min-w-[300px] flex items-center gap-3"
            >
              {toast.type === "success" && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 text-blue-400" />
              )}
              <p className="flex-1 text-sm text-white">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

