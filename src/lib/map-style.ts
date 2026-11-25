export const baseStyle = "https://tiles.openfreemap.org/styles/positron";

export const blankStyle = {
  version: 8 as const,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: {},
  layers: [{ id: "background", type: "background" as const, paint: { "background-color": "#e7ecea" } }],
};
