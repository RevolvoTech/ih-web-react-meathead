"use client";

import { Crosshair } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Map, Marker } from "maplibre-gl";
import { createEnglishMap, createMapPin } from "@/lib/english-map";

export interface DeliveryPoint {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value: DeliveryPoint | null;
  onChange: (point: DeliveryPoint) => void;
}

const ISLAMABAD: [number, number] = [33.6844, 73.0479];

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerConstructorRef = useRef<typeof Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    let cancelled = false;

    void createEnglishMap(elementRef.current, [ISLAMABAD[1], ISLAMABAD[0]], 12).then(({ map, maplibre }) => {
      if (cancelled) {
        map.remove();
        return;
      }
      markerConstructorRef.current = maplibre.Marker;
      mapRef.current = map;
      map.on("click", ({ lngLat }) => onChangeRef.current({ latitude: lngLat.lat, longitude: lngLat.lng }));
      map.once("load", () => setMapReady(true));
    }).catch((mapError) => {
      console.error("Map failed to load", mapError);
      if (!cancelled) setError("The map could not load. You can still use your current location.");
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const MarkerConstructor = markerConstructorRef.current;
    if (!map || !MarkerConstructor || !value) return;
    const point: [number, number] = [value.longitude, value.latitude];

    if (!markerRef.current) {
      const marker = new MarkerConstructor({
        draggable: true,
        element: createMapPin(),
        anchor: "bottom",
      }).setLngLat(point).addTo(map);
      marker.on("dragend", () => {
        const position = marker.getLngLat();
        onChangeRef.current({ latitude: position.lat, longitude: position.lng });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLngLat(point);
    }
    map.easeTo({ center: point, zoom: Math.max(map.getZoom(), 16), duration: 250 });
  }, [mapReady, value]);

  function useCurrentLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Location is not available in this browser. Tap your delivery point on the map.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onChange({ latitude: coords.latitude, longitude: coords.longitude });
        setLocating(false);
      },
      () => {
        setError("We could not get your location. Allow location access or tap the map instead.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }

  return <div>
    <div ref={elementRef} className="h-72 w-full overflow-hidden rounded-xl bg-meathead-gray shadow-lg shadow-black/20 sm:h-80" aria-label="Choose delivery location on map" />
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" onClick={useCurrentLocation} disabled={locating} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 px-4 font-data text-xs font-bold uppercase tracking-[0.1em] hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red disabled:opacity-50">
        <Crosshair size={16} aria-hidden="true" /> {locating ? "Finding you…" : "Use my location"}
      </button>
      <p className="font-data text-xs text-white/50">
        {value ? "Drag the red pin to the exact entrance" : "Tap the map to place the delivery pin"}
      </p>
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-red-200">{error}</p>}
  </div>;
}
