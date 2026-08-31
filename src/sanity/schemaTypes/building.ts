import { defineField, defineType } from "sanity";

/**
 * One Manhattan tower on the skyline.
 * orderIndex: lower = farther south = farther left.
 * cutout: transparent PNG preferred — used on the skyline when set.
 */
export const buildingType = defineType({
  name: "building",
  title: "Building",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
      description: "Stable id used in the app (e.g. empire-state).",
    }),
    defineField({
      name: "heightFt",
      title: "Height (ft)",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "floors",
      title: "Floors",
      type: "number",
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: "yearCompleted",
      title: "Year completed",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(1600).max(2100),
    }),
    defineField({
      name: "architect",
      title: "Architect",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Completed", value: "completed" },
          { title: "Under construction", value: "under-construction" },
          { title: "Demolished", value: "demolished" },
        ],
        layout: "radio",
      },
      initialValue: "completed",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderIndex",
      title: "Skyline order",
      type: "number",
      description: "Left → right = south → north. Lower number = farther left.",
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: "neighborhood",
      title: "Neighborhood",
      type: "string",
    }),
    defineField({
      name: "cutout",
      title: "Skyline cutout (transparent PNG)",
      type: "image",
      description:
        "Upload a transparent PNG of the building only. Used on the skyline; silhouette is the fallback.",
      options: { hotspot: false },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
        }),
      ],
    }),
    defineField({
      name: "silhouette",
      title: "Silhouette shape",
      type: "string",
      description: "Used when no cutout image is uploaded.",
      options: {
        list: [
          { title: "Rectangle", value: "rect" },
          { title: "Step / setback", value: "step" },
          { title: "Spire", value: "spire" },
          { title: "Art Deco", value: "art-deco" },
        ],
        layout: "radio",
      },
      initialValue: "rect",
    }),
    defineField({
      name: "shortBlurb",
      title: "Short blurb",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "wikipediaUrl",
      title: "Wikipedia URL",
      type: "url",
    }),
  ],
  orderings: [
    {
      title: "Skyline order",
      name: "orderAsc",
      by: [{ field: "orderIndex", direction: "asc" }],
    },
    {
      title: "Year",
      name: "yearAsc",
      by: [{ field: "yearCompleted", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "neighborhood",
      media: "cutout",
      orderIndex: "orderIndex",
      heightFt: "heightFt",
      year: "yearCompleted",
    },
    prepare({ title, subtitle, media, orderIndex, heightFt, year }) {
      return {
        title,
        subtitle: `#${orderIndex ?? "?"} · ${heightFt ?? "?"} ft · ${year ?? "?"} · ${subtitle ?? "Manhattan"}`,
        media,
      };
    },
  },
});
