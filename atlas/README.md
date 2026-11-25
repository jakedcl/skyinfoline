# Atlas inputs

These JSONL files are the website projection of NYC Building Atlas release 0.3 (November 24, 2026). The full canonical research release is maintained separately. The projection keeps stable IDs, sourced building facts, references, and City building outlines. It excludes unresolved identities and bulk or discovery-only references without independent identity evidence. It omits raw archival assets and internal decision records from the research bundle.

To regenerate from a local copy of a complete atlas release, run `node scripts/prepare-atlas.mjs /absolute/path/to/nyc-building-atlas` from the repository root. Use a new output directory as a second argument to compare a release before replacing the checked-in projection.

`profile-enrichments.json` records additional research for selected building pages. Each claim uses an existing building ID and note field, plus the source ID, locator, and dates. A claim can link directly to the relevant item within a source collection. The projection appends the notes and assigns citations to their exact field paths. Add new source IDs here when the research release does not already carry them.

The location and landmark layers are derived from NYC Open Data and credited in the source registry, including the NYC Office of Technology and Innovation and the NYC Landmarks Preservation Commission. Source dates, locators, and available claim paths are stored with the individual records. The source registry records source-specific reuse terms.

The homepage photo is a separate item from the Library of Congress Prints and Photographs Division, Detroit Publishing Co., [New York skyline from Brooklyn](https://www.loc.gov/item/2016796126/), dated between 1900 and 1920. The Library states that there are no known restrictions on publication.

`building-photos.jsonl` carries publication copies selected for building pages. It uses the canonical asset fields and joins to buildings by `entity_id`. The first row for a building is its lead photo, and additional rows appear in the gallery in file order. Each row records the source item, depicted date, creator, credit, rights, and changes made to the copy in `public/building-photos/`. The generated atlas projection leaves these manually reviewed records in place. The image rights in each row also apply to the copy in this repository.

`viewpoints.jsonl` holds hand-reviewed photo observations in the research release's viewpoint format. Each tagged building uses an existing building ID, an identification basis (`visually_identified` or `tentative`), a confidence value, and an image box given as fractions of the published photo's width and height. The site refuses to build if a tag points to a building that isn't published. Like `building-photos.jsonl`, the generated atlas projection leaves this file in place.
