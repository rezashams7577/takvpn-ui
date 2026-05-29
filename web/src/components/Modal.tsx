"use client";

import { useEffect, useId } from "react";

export type ModalVariant = "success" | "error" | "warning";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  variant?: ModalVariant;
  closeLabel?: string;
};

const variantAccent: Record<ModalVariant, string> = {
  success: "border-emerald-500/40",
  error: "border-red-500/40",
  warning: "border-amber-500/40",
};

export function Modal({
  open,
  title,
  children,
  onClose,
  variant = "success",
  closeLabel = "Close",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative w-full max-w-md rounded-lg border bg-[var(--card)] p-6 shadow-xl ${variantAccent[variant]}`}
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <div className="mt-3 text-sm text-[var(--muted)]">{children}</div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
