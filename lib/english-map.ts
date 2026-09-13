import type { LngLatLike, MapOptions, StyleSpecification } from "maplibre-gl";

const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

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

export async function getEnglishMapStyle() {
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

export async function createEnglishMap(
  container: HTMLElement,
  center: LngLatLike,
  zoom: number,
  options: Partial<Omit<MapOptions, "container" | "style" | "center" | "zoom">> = {},
) {
  const [maplibre, style] = await Promise.all([
    import("maplibre-gl"),
    getEnglishMapStyle(),
  ]);
  maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

  const map = new maplibre.Map({
    ...options,
    container,
    style,
    center,
    zoom,
    attributionControl: false,
    maxZoom: 20,
  });

  map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-left");
  map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");
  const attribution = container.querySelector<HTMLDetailsElement>(".maplibregl-ctrl-attrib");
  const collapseAttribution = () => {
    if (!attribution) return;
    attribution.open = false;
    attribution.classList.remove("maplibregl-compact-show");
  };
  collapseAttribution();
  map.once("load", collapseAttribution);

  return { map, maplibre };
}

export function createMapPin(className = "meathead-map-pin") {
  const element = document.createElement("div");
  element.className = className;
  const pin = document.createElement("span");
  element.appendChild(pin);
  return element;
}
