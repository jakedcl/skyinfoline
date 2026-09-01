"use client";

import type { Viewpoint, ViewpointId } from "@/lib/viewpoints";
import { VIEWPOINTS } from "@/lib/viewpoints";

type ViewpointSwitcherProps = {
  value: ViewpointId;
  onChange: (id: ViewpointId) => void;
};

export function ViewpointSwitcher({ value, onChange }: ViewpointSwitcherProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-end gap-1.5"
      role="tablist"
      aria-label="Skyline viewpoint"
    >
      {VIEWPOINTS.map((vp: Viewpoint) => {
        const active = vp.id === value;
        return (
          <button
            key={vp.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(vp.id)}
            className={[
              "border px-2.5 py-1 text-[11px] tracking-wide transition-colors sm:px-3",
              active
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white"
                : "border-white/20 bg-white/5 text-[var(--horizon)]/75 hover:border-white/35 hover:bg-white/10",
            ].join(" ")}
          >
            <span className="font-medium">{vp.label}</span>
            <span
              className={[
                "ml-1.5 hidden text-[10px] uppercase sm:inline",
                active ? "text-[var(--accent)]" : "text-[var(--horizon)]/50",
              ].join(" ")}
            >
              {vp.heading}
            </span>
          </button>
        );
      })}
    </div>
  );
}
