import type { Map as LeafletMap } from "leaflet";
import type { StyleSpecification } from "maplibre-gl";

const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const MAP_ATTRIBUTION = [
  '<a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a>',
  '&copy; <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a>',
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
].join(" &middot; ");

const ENGLISH_LABEL = [
  "coalesce",
  ["get", "name_en"],
  ["get", "name:en"],
  ["get", "name:latin"],
] as const;

let baseStylePromise: Promise<StyleSpecification> | null = null;

function fetchBaseStyle() {
  if (!baseStylePromise) {
    baseStylePromise = fetch(OPENFREEMAP_STYLE_URL)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Map style failed to load (${response.status})`);
        return response.json() as Promise<StyleSpecification>;
      })
      .catch((error) => {
        baseStylePromise = null;
        throw error;
      });
  }
  return baseStylePromise;
}

async function getEnglishStyle() {
  const style = JSON.parse(JSON.stringify(await fetchBaseStyle())) as StyleSpecification;

  for (const layer of style.layers) {
    if (layer.type !== "symbol" || !layer.layout) continue;
    const layout = layer.layout as Record<string, unknown>;
    const textField = layout["text-field"];

    // OpenFreeMap defaults to local and Latin names together. For delivery,
    // prefer English and fall back to Latin transliteration only.
    if (JSON.stringify(textField).includes("name:nonlatin")) {
      layout["text-field"] = ENGLISH_LABEL;
    }
  }

  return style;
}

export async function addEnglishBasemap(map: LeafletMap) {
  const [{ maplibreGL }, style] = await Promise.all([
    import("@maplibre/maplibre-gl-leaflet"),
    getEnglishStyle(),
  ]);

  return maplibreGL({
    style,
    attributionControl: { customAttribution: MAP_ATTRIBUTION },
    maxZoom: 20,
  }).addTo(map);
}
