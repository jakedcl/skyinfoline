"use client";

import type { Viewpoint, ViewpointId } from "@/lib/viewpoints";
import { VIEWPOINTS } from "@/lib/viewpoints";

type ViewpointSwitcherProps = {
  value: ViewpointId;
  onChange: (id: ViewpointId) => void;
};

export function ViewpointSwitcher({ value, onChange }: ViewpointSwitcherProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6">
      <p className="mb-2 text-center text-[11px] tracking-[0.22em] text-[var(--horizon)]/70 uppercase">
        Viewpoint
      </p>
      <div
        className="flex flex-wrap justify-center gap-2"
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
                "border px-3 py-2 text-left transition-colors sm:px-4",
                active
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-white"
                  : "border-white/20 bg-white/5 text-[var(--horizon)]/80 hover:border-white/40 hover:bg-white/10",
              ].join(" ")}
            >
              <span className="block text-xs font-medium tracking-wide">
                {vp.label}
              </span>
              <span
                className={[
                  "mt-0.5 block text-[10px] tracking-wider uppercase",
                  active ? "text-[var(--accent)]" : "text-[var(--horizon)]/50",
                ].join(" ")}
              >
                {vp.heading}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
