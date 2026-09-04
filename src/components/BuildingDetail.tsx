"use client";

import Image from "next/image";
import { BuildingSilhouetteShape } from "@/components/BuildingSilhouette";
import { CLUSTER_LABELS, type Building } from "@/types/building";

type BuildingDetailProps = {
  building: Building | null;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
};

export function BuildingDetail({
  building,
  onClose,
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
}: BuildingDetailProps) {
  return (
    <aside
      className={[
        "detail-panel operator-detail relative overflow-hidden transition-[max-height,opacity] duration-400 ease-out",
        building
          ? "max-h-[36rem] opacity-100"
          : "pointer-events-none max-h-0 opacity-0",
      ].join(" ")}
      aria-live="polite"
      aria-hidden={!building}
    >
      {building ? (
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="operator-detail__plate grid gap-5 p-4 sm:grid-cols-[minmax(0,120px)_1fr] sm:items-start sm:p-5">
            <div className="relative mx-auto flex h-32 w-24 items-end justify-center text-[var(--steel)] md:mx-0">
              {building.imageSrc ? (
                <Image
                  src={building.imageSrc}
                  alt={building.name}
                  width={112}
                  height={144}
                  className="skyline-cutout h-full w-full object-contain object-bottom"
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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="operator-detail__meta">
                    {[
                      building.cluster
                        ? CLUSTER_LABELS[building.cluster]
                        : null,
                      building.neighborhood,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Manhattan"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--op-ink)] md:text-3xl">
                    {building.name}
                  </h2>
                  {building.nicknames?.length ? (
                    <p className="mt-1 text-sm text-[var(--op-muted)]">
                      Also known as {building.nicknames.join(", ")}
                    </p>
                  ) : null}
                </div>
                <div className="relative z-10 flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                  <div
                    className="operator-detail__neighbors"
                    role="group"
                    aria-label="Building navigation"
                  >
                    <button
                      type="button"
                      onClick={onPrevious}
                      disabled={!canPrevious || !onPrevious}
                      className="operator-detail__nav px-2.5 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase"
                      aria-label="Previous building"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      disabled={!canNext || !onNext}
                      className="operator-detail__nav px-2.5 py-1.5 text-[10px] font-bold tracking-[0.14em] uppercase"
                      aria-label="Next building"
                    >
                      Next →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="operator-detail__close px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase"
                  >
                    Close
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="operator-detail__stat">
                  <dt>Height</dt>
                  <dd>{building.heightFt.toLocaleString()} ft</dd>
                </div>
                <div className="operator-detail__stat">
                  <dt>On skyline</dt>
                  <dd>
                    {building.yearDemolished != null
                      ? `${building.yearCompleted}–${building.yearDemolished}`
                      : `${building.yearCompleted}–present`}
                  </dd>
                </div>
                {building.status === "demolished" ? (
                  <div className="operator-detail__stat">
                    <dt>Status</dt>
                    <dd>Demolished</dd>
                  </div>
                ) : null}
                {building.floors != null ? (
                  <div className="operator-detail__stat">
                    <dt>Floors</dt>
                    <dd>{building.floors}</dd>
                  </div>
                ) : null}
                {building.architect ? (
                  <div className="operator-detail__stat col-span-2 sm:col-span-1">
                    <dt>Architect</dt>
                    <dd>{building.architect}</dd>
                  </div>
                ) : null}
                {building.style ? (
                  <div className="operator-detail__stat">
                    <dt>Style</dt>
                    <dd>{building.style}</dd>
                  </div>
                ) : null}
              </dl>

              {building.shortBlurb ? (
                <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-[var(--op-ink)]/85">
                  {building.shortBlurb}
                </p>
              ) : null}

              {building.wikipediaUrl ? (
                <a
                  href={building.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-bold tracking-[0.14em] text-[var(--op-signal)] uppercase underline-offset-4 hover:underline"
                >
                  Spec sheet →
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
