"use client";

import type { ReactNode } from "react";

export type FormMessageProps = {
  variant?: "error" | "success" | "info";
  children: ReactNode;
  className?: string;
};

export function FormMessage({
  variant = "error",
  children,
  className = "",
}: FormMessageProps) {
  const color =
    variant === "success"
      ? "text-green-600"
      : variant === "info"
        ? "text-brand-600"
        : "text-red-600";
  return <p className={`text-sm ${color} ${className}`.trim()}>{children}</p>;
}
