"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-white/80 border-white/20",
    primary: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    secondary: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    accent: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
