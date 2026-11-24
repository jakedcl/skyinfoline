"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildingPath } from "@/lib/presentation";
import { StatusLabel } from "./building-row";
import type { AtlasMarkers, AtlasOutlines, MapMarker } from "@/lib/types";

const baseStyle = "https://tiles.openfreemap.org/styles/positron";
const blankStyle = {
  version: 8 as const,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {},
  layers: [{ id: "background", type: "background" as const, paint: { "background-color": "#e7ecea" } }],
};

type Camera = { center: [number, number]; zoom: number };
type Props = {
  markers: AtlasMarkers;
  outlines?: AtlasOutlines;
  back?: string;
  detail?: boolean;
};

function readCamera(key: string): Camera | null {
  try {
    const text = sessionStorage.getItem(key);
    return text ? JSON.parse(text) as Camera : null;
  } catch {
    return null;
  }
}

function storeCamera(key: string, camera: Camera) {
  try {
    sessionStorage.setItem(key, JSON.stringify(camera));
  } catch {
    // Private browsing can block session storage.
  }
}

export function MapPanel({ markers, outlines, back, detail }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "fallback" | "error">("loading");
  const [selection, setSelection] = useState<MapMarker | null>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void import("maplibre-gl").then((maplibre) => {
      if (cancelled) return;
      maplibre.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
      const first = markers.features[0];
      const storageKey = back ? "skyinfoline-map:" + back : null;
      const saved = storageKey ? readCamera(storageKey) : null;
      const coordinates = first?.geometry.coordinates as [number, number] | undefined;

      const map = new maplibre.Map({
        container: element,
        style: blankStyle,
        center: saved?.center ?? coordinates ?? [-73.975, 40.704],
        zoom: saved?.zoom ?? (markers.features.length === 1 ? 15.3 : 10),
        scrollZoom: false,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
      let failed = false;
      let initialized = false;
      let online = false;
      const basemapRequest = new AbortController();
      dispose = () => {
        basemapRequest.abort();
        window.clearTimeout(basemapTimeout);
        map.remove();
      };

      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      const addAtlasLayers = () => {
        if (map.getSource("atlas")) return;
        if (outlines) {
          map.addSource("atlas-outline", { type: "geojson", data: outlines });
          map.addLayer({
            id: "atlas-outline-fill", source: "atlas-outline", type: "fill",
            paint: { "fill-color": "#ae4d30", "fill-opacity": 0.24 },
          });
          map.addLayer({
            id: "atlas-outline-line", source: "atlas-outline", type: "line",
            paint: { "line-color": "#8c3521", "line-width": 2 },
          });
        }
        map.addSource("atlas", {
          type: "geojson", data: markers, cluster: !detail, clusterRadius: 46, clusterMaxZoom: 14,
          attribution: "Building locations: SkyInfoLine atlas sources",
        });
        map.addLayer({
          id: "clusters", source: "atlas", type: "circle", filter: ["has", "point_count"],
          paint: {
            "circle-color": "#305a53", "circle-opacity": 0.94,
            "circle-radius": ["step", ["get", "point_count"], 17, 25, 21, 100, 26],
            "circle-stroke-color": "#fcfaf2", "circle-stroke-width": 2,
          },
        });
        map.addLayer({
          id: "cluster-count", source: "atlas", type: "symbol", filter: ["has", "point_count"],
          layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 12 },
          paint: { "text-color": "#fff" },
        });
        map.addLayer({
          id: "atlas-point", source: "atlas", type: "circle", filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match", ["get", "status"], ["demolished", "destroyed", "lost_unspecified"], "#8b622f",
              ["under_construction", "planned_approved", "unbuilt"], "#3a6184", "#b94b2e",
            ],
            "circle-radius": detail ? 8 : 6,
            "circle-stroke-color": "#fffaf2", "circle-stroke-width": 2,
          },
        });
      };

      const layerReady = () => {
        if (cancelled) return;
        addAtlasLayers();
        if (initialized) return;
        initialized = true;
        if (!saved && markers.features.length > 1) {
          const bounds = new maplibre.LngLatBounds();
          for (const feature of markers.features) {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          }
          map.fitBounds(bounds, { padding: 52, maxZoom: 14, duration: 0 });
        }
        setLoadState(failed ? "fallback" : "ready");
      };

      map.on("style.load", layerReady);
      if (!detail) {
        map.on("click", "clusters", async (event) => {
          const id = event.features?.[0]?.properties.cluster_id;
          const source = map.getSource<import("maplibre-gl").GeoJSONSource>("atlas");
          if (id === undefined || !source) return;
          try {
            const zoom = await source.getClusterExpansionZoom(id);
            if (!cancelled) map.easeTo({ center: event.lngLat, zoom, duration: 450 });
          } catch {
            // The cluster may have changed during zoom or navigation.
          }
        });
        map.on("click", "atlas-point", (event) => {
          const properties = event.features?.[0]?.properties;
          if (properties?.id) setSelection({ id: properties.id, name: properties.name, status: properties.status });
        });
        map.on("mouseenter", ["atlas-point", "clusters"], () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", ["atlas-point", "clusters"], () => { map.getCanvas().style.cursor = ""; });
      }

      if (storageKey) {
        map.on("moveend", () => {
          const center = map.getCenter();
          storeCamera(storageKey, { center: [center.lng, center.lat], zoom: map.getZoom() });
        });
      }

      const fallBack = () => {
        if (cancelled || failed) return;
        failed = true;
        setLoadState("fallback");
        if (online) map.setStyle(blankStyle, { diff: false });
      };

      const basemapTimeout = window.setTimeout(() => {
        basemapRequest.abort();
        fallBack();
      }, 3500);

      void fetch(baseStyle, { signal: basemapRequest.signal }).then((response) => {
        if (!response.ok) throw new Error("Basemap unavailable");
        return response.json() as Promise<import("maplibre-gl").StyleSpecification>;
      }).then((style) => {
        if (cancelled || failed) return;
        online = true;
        map.setStyle(style, { diff: false });
      }).catch(fallBack).finally(() => window.clearTimeout(basemapTimeout));

      map.on("error", ({ error }) => {
        if (/worker failed to load|webgl/i.test(error.message)) {
          setLoadState("error");
          return;
        }
        if (online && !map.getSource("atlas")) fallBack();
      });
    }).catch(() => {
      if (!cancelled) setLoadState("error");
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [back, detail, markers, outlines]);

  return (
    <div className={detail ? "map-panel map-detail" : "map-panel"}>
      <div className="map-canvas" ref={container} role="region" aria-label={detail ? "Building location map" : "Building results map"} />
      {loadState === "loading" && <p className="map-notice" role="status">Loading map…</p>}
      {loadState === "fallback" && <p className="map-notice" role="status">Basemap unavailable. Atlas locations are still shown.</p>}
      {loadState === "error" && <p className="map-notice" role="status">The map couldn’t load on this device.</p>}
      {selection && (
        <div className="map-selection" aria-live="polite">
          <StatusLabel status={selection.status} />
          <p>{selection.name}</p>
          <Link className="text-link" href={buildingPath(selection.id, back)}>Open building page</Link>
          <button type="button" className="close-selection" onClick={() => setSelection(null)} aria-label="Clear selection">×</button>
        </div>
      )}
    </div>
  );
}
