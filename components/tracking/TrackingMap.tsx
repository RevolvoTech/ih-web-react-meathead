"use client";

import type L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { addEnglishBasemap } from "@/lib/english-map";

interface TrackingMapProps {
  destination: { latitude: number; longitude: number };
  rider: { latitude: number; longitude: number } | null;
}

export default function TrackingMap({ destination, rider }: TrackingMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then(async ({ default: leaflet }) => {
      if (cancelled || !elementRef.current || mapRef.current) return;
      leafletRef.current = leaflet;
      const map = leaflet.map(elementRef.current, { zoomControl: true, attributionControl: true });
      map.attributionControl.setPrefix(false);
      mapRef.current = map;
      await addEnglishBasemap(map);
      if (cancelled) return;
      setReady(true);
    }).catch((mapError) => console.error("Tracking map failed to load", mapError));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet || !ready) return;
    layerRef.current?.remove();
    const layer = leaflet.layerGroup().addTo(map);
    layerRef.current = layer;
    const destinationPoint: L.LatLngTuple = [destination.latitude, destination.longitude];
    leaflet.circleMarker(destinationPoint, {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: "#D2001B",
      fillOpacity: 1,
    }).bindTooltip("Delivery address").addTo(layer);

    if (rider) {
      const riderPoint: L.LatLngTuple = [rider.latitude, rider.longitude];
      leaflet.circleMarker(riderPoint, {
        radius: 9,
        color: "#ffffff",
        weight: 3,
        fillColor: "#0ea5e9",
        fillOpacity: 1,
      }).bindTooltip("Rider location").addTo(layer);
      leaflet.polyline([riderPoint, destinationPoint], { color: "#ffffff", opacity: 0.55, weight: 2, dashArray: "6 7" }).addTo(layer);
      map.fitBounds(leaflet.latLngBounds([riderPoint, destinationPoint]), { padding: [36, 36], maxZoom: 16 });
    } else {
      map.setView(destinationPoint, 14);
    }
  }, [destination.latitude, destination.longitude, ready, rider]);

  return <div ref={elementRef} className="h-72 w-full bg-meathead-gray sm:h-96" role="img" aria-label={rider ? "Map showing the rider and delivery address" : "Map showing the delivery address"} />;
}
