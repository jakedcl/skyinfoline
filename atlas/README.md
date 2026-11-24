# Atlas inputs

These JSONL files are the website projection of NYC Building Atlas release 0.3 (November 24, 2026). The full canonical research release is maintained separately. The projection keeps stable IDs, sourced building facts, references, and City building outlines. It excludes unresolved identities and bulk or discovery-only references without independent identity evidence. It omits raw archival assets and internal decision records from the research bundle.

To regenerate from a local copy of a complete atlas release, run `node scripts/prepare-atlas.mjs /absolute/path/to/nyc-building-atlas` from the repository root. Use a new output directory as a second argument to compare a release before replacing the checked-in projection.

The location and landmark layers are derived from NYC Open Data and credited in the source registry, including the NYC Office of Technology and Innovation and the NYC Landmarks Preservation Commission. Source dates, locators, and available claim paths are stored with the individual records. The source registry records source-specific reuse terms.

The homepage photo is a separate item from the Library of Congress Prints and Photographs Division, Detroit Publishing Co., [New York skyline from Brooklyn](https://www.loc.gov/item/2016796126/), dated between 1900 and 1920. The Library states that there are no known restrictions on publication.
