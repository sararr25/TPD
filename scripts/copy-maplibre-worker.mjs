// MapLibre runs its tile worker from a separate module file that the Next
// bundler does not emit, so serve it (and the shared chunk it imports) from
// public/. Runs before dev and build; the copies are git-ignored.
import { copyFileSync, mkdirSync } from "node:fs";
const from = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const to = new URL("../public/maplibre/", import.meta.url);
mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(new URL(file, from), new URL(file, to));
