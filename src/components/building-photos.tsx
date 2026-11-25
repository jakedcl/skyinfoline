import Image from "next/image";
import { showDate } from "@/lib/presentation";
import type { BuildingPhoto } from "@/lib/types";

export function BuildingPhotos({ photos }: { photos: BuildingPhoto[] }) {
  return (
    <section className="entry-photos" aria-labelledby="entry-photos-title">
      <h2 id="entry-photos-title" className="sr-only">Photographs</h2>
      {photos.map((photo) => {
        const date = showDate(photo.depicted_date);
        const credit = [photo.creator, photo.credit].filter(Boolean).join(" · ");
        return (
          <figure className="entry-photo" key={photo.path}>
            <div className="entry-photo-frame">
              <Image
                src={photo.path}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(max-width: 760px) calc(100vw - 2rem), 52vw"
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
      })}
    </section>
  );
}
