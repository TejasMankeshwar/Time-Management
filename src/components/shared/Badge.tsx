import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "frog" | "high" | "medium" | "low";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-primary text-white",
    secondary: "border-transparent bg-surface-alt text-text-primary",
    outline: "text-text-primary border-border",
    success: "border-transparent bg-success text-white",
    warning: "border-transparent bg-warning text-white",
    danger: "border-transparent bg-danger text-white",
    frog: "border-transparent bg-accent text-white", // Terracotta
    high: "border-transparent bg-danger text-white", // Red
    medium: "border-transparent bg-accent-warm text-white", // Amber/Warm
    low: "border-transparent bg-primary-light text-white" // Light green
  };

  return (
    <div className={cn(baseClasses, variants[variant], className)} {...props} />
  );
}

export { Badge };
