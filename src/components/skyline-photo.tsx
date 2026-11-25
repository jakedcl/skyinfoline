"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildingPath } from "@/lib/presentation";
import type { BuildingSummary, ImageBox } from "@/lib/types";

type Target = {
  entity_id: string;
  identification: string;
  image_box: ImageBox;
  notes: string;
  building: BuildingSummary;
};

type Props = {
  src: string;
  width: number;
  height: number;
  alt: string;
  targets: Target[];
  initialId: string | null;
};

const pagePath = "/skyline";

const identificationNames: Record<string, string> = {
  source_identified: "Named by the source",
  visually_identified: "Identified by its silhouette",
  tentative: "Likely match",
};

function backPath(id: string | null) {
  return id ? `${pagePath}?building=${id}` : pagePath;
}

export function SkylinePhoto({ src, width, height, alt, targets, initialId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId && targets.some((target) => target.entity_id === initialId) ? initialId : null,
  );
  const selected = targets.find((target) => target.entity_id === selectedId) ?? null;

  useEffect(() => {
    window.history.replaceState(window.history.state, "", backPath(selectedId));
  }, [selectedId]);

  return (
    <div className="skyline-layout">
      <div className="skyline-photo" style={{ aspectRatio: `${width} / ${height}` }}>
        <Image src={src} alt={alt} width={width} height={height} preload sizes="(max-width: 1150px) 100vw, 64rem" />
        {targets.map((target, index) => {
          const box = target.image_box;
          return (
            <button
              key={target.entity_id}
              type="button"
              className="skyline-target"
              aria-pressed={target.entity_id === selectedId}
              aria-label={`${index + 1}. ${target.building.name}`}
              onClick={() => setSelectedId(target.entity_id === selectedId ? null : target.entity_id)}
              style={{
                left: `${box.left * 100}%`,
                top: `${box.top * 100}%`,
                width: `${(box.right - box.left) * 100}%`,
                height: `${(box.bottom - box.top) * 100}%`,
              }}
            >
              <span className="skyline-number" aria-hidden="true">{index + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="skyline-detail" aria-live="polite">
        {selected ? (
          <>
            <p className="skyline-kind">{identificationNames[selected.identification] ?? "Identified"}</p>
            <h2>{selected.building.name}</h2>
            <p className="skyline-meta">{[selected.building.year, selected.building.address].filter(Boolean).join(" · ")}</p>
            <p>{selected.notes}</p>
            <Link className="text-link" href={buildingPath(selected.entity_id, backPath(selected.entity_id))}>Open building page</Link>
          </>
        ) : (
          <p className="skyline-hint">Select a numbered building in the photo or the list below.</p>
        )}
      </div>

      <ol className="skyline-list">
        {targets.map((target, index) => (
          <li key={target.entity_id}>
            <button type="button" aria-pressed={target.entity_id === selectedId} onClick={() => setSelectedId(target.entity_id)}>
              <span className="skyline-number" aria-hidden="true">{index + 1}</span>
              <span>
                <strong>{target.building.name}</strong>
                <small>{identificationNames[target.identification] ?? "Identified"}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
