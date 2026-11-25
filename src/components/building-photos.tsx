import Image from "next/image";
import { showDate } from "@/lib/presentation";
import type { BuildingPhoto } from "@/lib/types";

export function BuildingPhotoFigure({ photo, eager = false }: { photo: BuildingPhoto; eager?: boolean }) {
  const date = showDate(photo.depicted_date);
  const credit = [photo.creator, photo.credit].filter(Boolean).join(" · ");

  return (
    <figure className="entry-photo">
      <div className="entry-photo-frame">
        <Image
          src={photo.path}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes={eager ? "min(100vw - 2rem, 65rem)" : "(max-width: 760px) calc(100vw - 2rem), 52vw"}
          loading={eager ? "eager" : "lazy"}
          unoptimized
        />
      </div>
      <figcaption>
        <p>{photo.caption}{date && <span className="photo-date"> {date}.</span>}</p>
        <div className="photo-credit">
          {credit && <span>{credit}</span>}
          <a href={photo.url} aria-label={`Image source for ${photo.title}`}>Image source</a>
          {photo.license_url ? <a href={photo.license_url}>{photo.rights}</a> : <span>{photo.rights}</span>}
          {photo.changes && <span>{photo.changes}</span>}
        </div>
      </figcaption>
    </figure>
  );
}
