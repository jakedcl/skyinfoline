"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { BuildingPhotoFigure } from "@/components/building-photos";
import type { BuildingPhoto } from "@/lib/types";

export function BuildingPhotoGallery({ photos }: { photos: BuildingPhoto[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const photo = selected === null ? undefined : photos[selected];
  const canBrowse = photos.length > 1;

  function move(offset: number) {
    setSelected((index) => index === null ? null : (index + offset + photos.length) % photos.length);
  }

  function handleKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (!canBrowse || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    <section className="entry-section" id="photos" aria-labelledby="photos-title">
      <h2 id="photos-title">Photos</h2>
      <ul className="photo-gallery-grid">
        {photos.map((item, index) => (
          <li key={item.path}>
            <button
              type="button"
              className="photo-gallery-tile"
              aria-label={`Enlarge ${item.title}`}
              aria-haspopup="dialog"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setSelected(index);
                dialog.current?.showModal();
              }}
            >
              <Image
                src={item.path}
                width={item.width}
                height={item.height}
                alt=""
                sizes="(max-width: 420px) calc(100vw - 2rem), 22vw"
                unoptimized
              />
              <span>{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-labelledby="photo-dialog-title"
        onKeyDown={handleKeys}
        onClose={() => {
          setSelected(null);
          opener.current?.focus();
        }}
      >
        <div className="photo-dialog-header">
          <h3 id="photo-dialog-title">{photo?.title ?? "Photograph"}</h3>
          <button type="button" onClick={() => dialog.current?.close()}>Close</button>
        </div>
        {photo && <BuildingPhotoFigure key={photo.path} photo={photo} eager />}
        {canBrowse && selected !== null && (
          <div className="photo-dialog-footer">
            <button type="button" onClick={() => move(-1)}>Previous</button>
            <span role="status">{selected + 1} of {photos.length}</span>
            <button type="button" onClick={() => move(1)}>Next</button>
          </div>
        )}
      </dialog>
    </section>
  );
}
