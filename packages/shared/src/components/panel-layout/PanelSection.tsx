import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "danger";
  className?: string;
};

export function PanelSection({
  title,
  description,
  children,
  variant = "default",
  className = "",
}: Props) {
  const borderClass =
    variant === "danger"
      ? "border-red-200 dark:border-red-900/50"
      : "border-[var(--border)]";

  return (
    <section
      className={`panel-section rounded-xl border bg-[var(--card)] ${borderClass} ${className}`.trim()}
    >
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
