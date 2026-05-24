"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type FormSubmitProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};

export function FormSubmit({
  loading,
  children,
  className = "",
  disabled,
  ...rest
}: FormSubmitProps) {
  return (
    <button
      type="submit"
      disabled={disabled ?? loading}
      className={`rounded-lg bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50 ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
