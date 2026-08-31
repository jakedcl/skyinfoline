"use client";

import Image from "next/image";
import { BuildingSilhouetteShape } from "@/components/BuildingSilhouette";
import { CLUSTER_LABELS, type Building } from "@/types/building";

type BuildingDetailProps = {
  building: Building | null;
  onClose: () => void;
};

export function BuildingDetail({ building, onClose }: BuildingDetailProps) {
  return (
    <aside
      className={[
        "detail-panel relative overflow-hidden border-t border-[var(--line)] bg-[var(--panel)]/90 backdrop-blur-md transition-[max-height,opacity] duration-400 ease-out",
        building ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0",
      ].join(" ")}
      aria-live="polite"
      aria-hidden={!building}
    >
      {building ? (
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[minmax(0,140px)_1fr] md:items-start">
          <div className="relative mx-auto flex h-36 w-28 items-end justify-center text-[var(--steel)] md:mx-0">
            {building.imageSrc ? (
              <Image
                src={building.imageSrc}
                alt={building.name}
                width={112}
                height={144}
                className="h-full w-full object-contain object-bottom"
                unoptimized
              />
            ) : (
              <BuildingSilhouetteShape
                type={building.silhouette ?? "rect"}
                className="h-full w-16"
                title={building.name}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] text-[var(--accent)] uppercase">
                  {[
                    building.cluster
                      ? CLUSTER_LABELS[building.cluster]
                      : null,
                    building.neighborhood,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Manhattan"}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)] md:text-3xl">
                  {building.name}
                </h2>
                {building.nicknames?.length ? (
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    Also known as {building.nicknames.join(", ")}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="relative z-10 shrink-0 border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs tracking-wider text-[var(--ink-muted)] uppercase transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-[11px] tracking-wider text-[var(--ink-muted)] uppercase">
              ← → keys move along the skyline · Esc closes
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-[var(--ink-muted)]">Height</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {building.heightFt.toLocaleString()} ft
                </dd>
              </div>
              <div>
                <dt className="text-[var(--ink-muted)]">Completed</dt>
                <dd className="font-medium text-[var(--ink)]">
                  {building.yearCompleted}
                </dd>
              </div>
              {building.floors != null ? (
                <div>
                  <dt className="text-[var(--ink-muted)]">Floors</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {building.floors}
                  </dd>
                </div>
              ) : null}
              {building.architect ? (
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-[var(--ink-muted)]">Architect</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {building.architect}
                  </dd>
                </div>
              ) : null}
              {building.style ? (
                <div>
                  <dt className="text-[var(--ink-muted)]">Style</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {building.style}
                  </dd>
                </div>
              ) : null}
            </dl>

            {building.shortBlurb ? (
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
                {building.shortBlurb}
              </p>
            ) : null}

            {building.wikipediaUrl ? (
              <a
                href={building.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm text-[var(--river)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline"
              >
                Read more
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
