"use client";

import { Crosshair } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type L from "leaflet";

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
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!elementRef.current || mapRef.current) return;
    let cancelled = false;

    void import("leaflet").then(({ default: leaflet }) => {
      if (cancelled || !elementRef.current) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(elementRef.current, { zoomControl: true }).setView(ISLAMABAD, 12);
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      map.on("click", ({ latlng }) => onChangeRef.current({ latitude: latlng.lat, longitude: latlng.lng }));
      mapRef.current = map;
      setMapReady(true);
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
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !value) return;
    const point: [number, number] = [value.latitude, value.longitude];

    if (!markerRef.current) {
      const redPin = leaflet.divIcon({
        className: "custom-marker",
        html: '<div style="background:#D2001B;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.45)"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      const marker = leaflet.marker(point, { draggable: true, icon: redPin }).addTo(map);
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onChangeRef.current({ latitude: position.lat, longitude: position.lng });
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(point);
    }
    map.setView(point, Math.max(map.getZoom(), 16));
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
    <div ref={elementRef} className="h-72 w-full bg-meathead-gray sm:h-80" aria-label="Choose delivery location on map" />
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
