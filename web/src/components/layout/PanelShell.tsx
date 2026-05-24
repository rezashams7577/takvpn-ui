"use client";

import { useState } from "react";

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  header?: React.ReactNode;
  menuOpenLabel?: string;
  menuCloseLabel?: string;
};

export function PanelShell({
  sidebar,
  children,
  header,
  menuOpenLabel = "Menu",
  menuCloseLabel = "Close menu",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 w-full">
      {header && <div className="mb-6">{header}</div>}
      <div className="flex gap-8">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-8">{sidebar}</div>
        </aside>

        <div className="flex-1 min-w-0 w-full">
          <div className="md:hidden mb-4">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? menuCloseLabel : menuOpenLabel}
            </button>
            {mobileOpen && (
              <div className="mt-3 w-56 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
                {sidebar}
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
