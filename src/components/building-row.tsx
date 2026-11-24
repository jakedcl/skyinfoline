import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildingPath, statusLabel, statusTone } from "@/lib/presentation";
import type { BuildingSummary } from "@/lib/types";

export function StatusLabel({ status }: { status: string }) {
  return <span className={`building-status status-${statusTone(status)}`}>{statusLabel(status)}</span>;
}

export function BuildingRow({ building, back }: { building: BuildingSummary; back?: string }) {
  const detail = [building.borough, building.address].filter(Boolean).join(" · ");
  return (
    <Link className="building-row" href={buildingPath(building.id, back)} prefetch={false}>
      <div className="row-description">
        <h3>{building.name}</h3>
        <p>{building.alias ? `${building.alias} · ${detail}` : detail}</p>
      </div>
      <span className="row-year">{building.year}</span>
      <StatusLabel status={building.status} />
      <ChevronRight className="row-arrow" size={19} aria-hidden="true" />
    </Link>
  );
}
