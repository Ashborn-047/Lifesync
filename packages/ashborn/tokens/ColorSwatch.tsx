import React from "react";
import { cn } from "../lib/utils";

interface ColorSwatchProps {
  weight: string;
  hex: string;
  textColor: string;
  isMain?: boolean;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({ weight, hex, textColor, isMain = false }) => {
  return (
    <div
      className={cn(
        "p-4 flex items-center justify-between transition-all",
        isMain ? "rounded-lg shadow-md" : "rounded-md"
      )}
      style={{ backgroundColor: hex }}
    >
      <span className={cn("font-semibold", textColor)}>{weight}</span>
      <span className={cn("font-mono text-sm", textColor)}>{hex}</span>
    </div>
  );
};
