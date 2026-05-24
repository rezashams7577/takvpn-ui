import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action: ReactNode;
  variant?: "default" | "danger";
};

export function PanelActionRow({
  title,
  description,
  action,
  variant = "default",
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 first:pt-0 last:pb-0 border-b border-[var(--border)] last:border-b-0">
      <div className="min-w-0">
        <p
          className={`text-sm font-medium ${
            variant === "danger"
              ? "text-red-700 dark:text-red-400"
              : "text-[var(--fg)]"
          }`}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-[var(--muted)] mt-1">{description}</p>
        )}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
