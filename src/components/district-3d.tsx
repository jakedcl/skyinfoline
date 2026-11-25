"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ExpressionSpecification, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import { baseStyle, blankStyle } from "@/lib/map-style";
import { buildingPath } from "@/lib/presentation";
import type { DistrictBuilding, DistrictShapes } from "@/lib/district";

const pagePath = "/lower-manhattan-3d";
const cameraKey = "skyinfoline-3d:lower-manhattan";
const atlasColor = "#b4543a";
const selectedColor = "#2f5b52";

type Camera = { center: [number, number]; zoom: number; pitch: number; bearing: number };
type Props = {
  buildings: DistrictBuilding[];
  shapes: DistrictShapes;
  boundary: [number, number][];
  initialId: string | null;
};

const defaultCamera: Camera = { center: [-74.0112, 40.7058], zoom: 15.05, pitch: 60, bearing: -32 };

function readCamera(): Camera | null {
  try {
    const text = sessionStorage.getItem(cameraKey);
    return text ? JSON.parse(text) as Camera : null;
  } catch {
    return null;
  }
}

function storeCamera(camera: Camera) {
  try {
    sessionStorage.setItem(cameraKey, JSON.stringify(camera));
  } catch {
    // Private browsing can block session storage.
  }
}

function backPath(id: string | null) {
  return id ? `${pagePath}?building=${id}` : pagePath;
}

function colorFor(id: string | null): ExpressionSpecification {
  return ["case", ["==", ["get", "id"], id ?? ""], selectedColor, atlasColor];
}

function contextOpacity(id: string | null) {
  return id ? 0.45 : 0.82;
}

// Keep the basemap's labels and roads, and replace its flat building layer with
// approximate 3D context from the same OpenStreetMap tiles.
function withContextBuildings(style: StyleSpecification, selectedId: string | null): StyleSpecification {
  const layers = style.layers.filter((layer) => layer.id !== "building");
  const firstLabel = layers.findIndex((layer) => layer.type === "symbol");
  const context = {
    id: "context-buildings",
    type: "fill-extrusion" as const,
    source: "openmaptiles",
    "source-layer": "building",
    minzoom: 13,
    filter: ["!=", ["get", "hide_3d"], true] as ExpressionSpecification,
    paint: {
      "fill-extrusion-color": "#d9dcd6",
      "fill-extrusion-height": ["coalesce", ["get", "render_height"], 8] as ExpressionSpecification,
      "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0] as ExpressionSpecification,
      "fill-extrusion-opacity": contextOpacity(selectedId),
    },
  };
  layers.splice(firstLabel < 0 ? layers.length : firstLabel, 0, context);
  return { ...style, layers };
}

export function District3D({ buildings, shapes, boundary, initialId }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const selectionCard = useRef<HTMLDivElement>(null);
  const revealSelection = useRef(false);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "fallback" | "error">("loading");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId && buildings.some((building) => building.id === initialId) ? initialId : null,
  );
  const selectedRef = useRef(selectedId);
  const selected = buildings.find((building) => building.id === selectedId) ?? null;

  const select = useCallback((id: string | null, fly: boolean) => {
    if (fly) {
      if (id === selectedRef.current) selectionCard.current?.scrollIntoView({ block: "nearest" });
      else revealSelection.current = true;
    }
    setSelectedId(id);
    const map = mapRef.current;
    const building = buildings.find((item) => item.id === id);
    if (map && building && fly) {
      map.flyTo({ center: building.center, zoom: Math.max(map.getZoom(), 16), duration: 900 });
    }
  }, [buildings]);

  useEffect(() => {
    selectedRef.current = selectedId;
    const map = mapRef.current;
    if (map?.getLayer("district-buildings")) map.setPaintProperty("district-buildings", "fill-extrusion-color", colorFor(selectedId));
    if (map?.getLayer("context-buildings")) map.setPaintProperty("context-buildings", "fill-extrusion-opacity", contextOpacity(selectedId));
    window.history.replaceState(window.history.state, "", backPath(selectedId));
    if (revealSelection.current) {
      revealSelection.current = false;
      selectionCard.current?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedId]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    void import("maplibre-gl").then((maplibre) => {
      if (cancelled) return;
      maplibre.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());
      const saved = readCamera();
      const start = buildings.find((building) => building.id === selectedRef.current);
      const camera = saved ?? (start ? { ...defaultCamera, center: start.center, zoom: 16 } : defaultCamera);

      const map = new maplibre.Map({
        container: element,
        style: blankStyle,
        ...camera,
        maxPitch: 75,
        scrollZoom: false,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      let failed = false;
      let online = false;
      let initialized = false;
      const request = new AbortController();
      const timeout = window.setTimeout(() => { request.abort(); fallBack(); }, 3500);
      dispose = () => {
        request.abort();
        window.clearTimeout(timeout);
        mapRef.current = null;
        map.remove();
      };

      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-right");

      const addDistrictLayers = () => {
        if (map.getSource("district")) return;
        map.addSource("district-boundary", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: boundary } },
        });
        map.addLayer({
          id: "district-boundary", source: "district-boundary", type: "line",
          paint: { "line-color": "#2f5b52", "line-width": 2, "line-dasharray": [2, 2], "line-opacity": 0.7 },
        });
        map.addSource("district", {
          type: "geojson", data: shapes,
          attribution: "Outlines and roof heights: NYC Office of Technology and Innovation",
        });
        map.addLayer({
          id: "district-buildings", source: "district", type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": colorFor(selectedRef.current),
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.94,
            "fill-extrusion-vertical-gradient": true,
          },
        });
      };

      map.on("style.load", () => {
        if (cancelled) return;
        addDistrictLayers();
        if (initialized || (!online && !failed)) return;
        initialized = true;
        map.once("idle", () => {
          if (!cancelled) setLoadState(failed ? "fallback" : "ready");
        });
      });

      map.on("click", "district-buildings", (event) => {
        const id = event.features?.[0]?.properties.id;
        if (typeof id === "string") select(id, false);
      });
      map.on("mouseenter", "district-buildings", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "district-buildings", () => { map.getCanvas().style.cursor = ""; });
      map.on("moveend", () => {
        const center = map.getCenter();
        storeCamera({ center: [center.lng, center.lat], zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() });
      });

      function fallBack() {
        if (cancelled || failed) return;
        failed = true;
        setLoadState("fallback");
        if (online) map.setStyle(blankStyle, { diff: false });
      }

      void fetch(baseStyle, { signal: request.signal }).then((response) => {
        if (!response.ok) throw new Error("Basemap unavailable");
        return response.json() as Promise<StyleSpecification>;
      }).then((style) => {
        if (cancelled || failed) return;
        online = true;
        map.setStyle(withContextBuildings(style, selectedRef.current), { diff: false });
      }).catch(fallBack).finally(() => window.clearTimeout(timeout));

      map.on("error", ({ error }) => {
        if (/worker failed to load|webgl/i.test(error.message)) {
          setLoadState("error");
          return;
        }
        if (online && !map.getSource("district")) fallBack();
      });
    }).catch(() => {
      if (!cancelled) setLoadState("error");
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [boundary, buildings, select, shapes]);

  return (
    <div className="district-layout">
      <div className="map-panel district-map">
        <div className="map-canvas" ref={container} role="region" aria-label="3D view of Lower Manhattan atlas buildings" />
        {loadState === "loading" && <p className="map-notice" role="status">Loading 3D view…</p>}
        {loadState === "fallback" && <p className="map-notice" role="status">Basemap unavailable. Atlas buildings are still shown.</p>}
        {loadState === "error" && <p className="map-notice" role="status">The 3D view couldn’t load on this device. Use the building list.</p>}
        {selected && (
          <div className="map-selection" aria-live="polite" ref={selectionCard}>
            <p>{selected.name}</p>
            <span className="selection-detail">
              {[selected.year, `Mapped roof ${Math.round(selected.roofFeet).toLocaleString("en-US")} ft`].filter(Boolean).join(" · ")}
            </span>
            <Link className="text-link" href={buildingPath(selected.id, backPath(selected.id))}>Open building page</Link>
            <button type="button" className="close-selection" onClick={() => select(null, false)} aria-label="Clear selection">×</button>
          </div>
        )}
      </div>
      <section className="district-list" aria-labelledby="district-list-title">
        <h2 id="district-list-title">{buildings.length} atlas buildings, tallest first</h2>
        <ol>
          {buildings.map((building) => (
            <li key={building.id}>
              <button type="button" aria-pressed={building.id === selectedId} onClick={() => select(building.id, true)}>
                <span>{building.name}</span>
                <span className="district-height">{Math.round(building.roofFeet).toLocaleString("en-US")} ft</span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
