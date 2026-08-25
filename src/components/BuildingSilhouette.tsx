import type { BuildingSilhouette } from "@/types/building";

type SilhouetteProps = {
  type: BuildingSilhouette;
  className?: string;
  title?: string;
};

/** Simple SVG building profiles used when no PNG cutout is set. */
export function BuildingSilhouetteShape({
  type,
  className,
  title,
}: SilhouetteProps) {
  const common = {
    className,
    preserveAspectRatio: "none" as const,
    role: "img" as const,
    "aria-hidden": title ? undefined : (true as const),
  };

  if (type === "spire") {
    return (
      <svg viewBox="0 0 40 120" {...common}>
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M8 120 V48 L18 28 V8 L20 0 L22 8 V28 L32 48 V120 Z"
        />
      </svg>
    );
  }

  if (type === "art-deco") {
    return (
      <svg viewBox="0 0 44 120" {...common}>
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M4 120 V70 H10 V52 H14 V36 H18 V22 H20 V6 L22 0 L24 6 V22 H26 V36 H30 V52 H34 V70 H40 V120 Z"
        />
      </svg>
    );
  }

  if (type === "step") {
    return (
      <svg viewBox="0 0 48 120" {...common}>
        {title ? <title>{title}</title> : null}
        <path
          fill="currentColor"
          d="M2 120 V78 H10 V58 H16 V40 H22 V22 H26 V12 H22 V120 Z M26 12 H30 V22 H34 V40 H40 V58 H46 V78 H38 V120 H26 Z"
        />
      </svg>
    );
  }

  // rect
  return (
    <svg viewBox="0 0 36 120" {...common}>
      {title ? <title>{title}</title> : null}
      <rect x="6" y="0" width="24" height="120" fill="currentColor" />
    </svg>
  );
}

export function silhouetteAspect(type: BuildingSilhouette): number {
  switch (type) {
    case "spire":
      return 40 / 120;
    case "art-deco":
      return 44 / 120;
    case "step":
      return 48 / 120;
    default:
      return 36 / 120;
  }
}
