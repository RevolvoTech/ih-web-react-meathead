"use client";

import type { Map, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { createEnglishMap, createMapPin } from "@/lib/english-map";

interface TrackingMapProps {
  destination: { latitude: number; longitude: number };
  rider: { latitude: number; longitude: number } | null;
}

export default function TrackingMap({ destination, rider }: TrackingMapProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const markerConstructorRef = useRef<typeof Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!elementRef.current || mapRef.current) return;
    void createEnglishMap(elementRef.current, [destination.longitude, destination.latitude], 14).then(({ map, maplibre }) => {
      if (cancelled) {
        map.remove();
        return;
      }
      markerConstructorRef.current = maplibre.Marker;
      mapRef.current = map;
      map.once("load", () => setReady(true));
    }).catch((mapError) => console.error("Tracking map failed to load", mapError));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      markerConstructorRef.current = null;
    };
  }, [destination.latitude, destination.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    const MarkerConstructor = markerConstructorRef.current;
    if (!map || !MarkerConstructor || !ready) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (map.getLayer("delivery-route")) map.removeLayer("delivery-route");
    if (map.getSource("delivery-route")) map.removeSource("delivery-route");

    const destinationPoint: [number, number] = [destination.longitude, destination.latitude];
    const destinationMarker = new MarkerConstructor({
      element: createMapPin("meathead-map-dot meathead-map-dot--destination"),
    }).setLngLat(destinationPoint).addTo(map);
    markersRef.current.push(destinationMarker);

    if (rider) {
      const riderPoint: [number, number] = [rider.longitude, rider.latitude];
      const riderMarker = new MarkerConstructor({
        element: createMapPin("meathead-map-dot meathead-map-dot--rider"),
      }).setLngLat(riderPoint).addTo(map);
      markersRef.current.push(riderMarker);
      map.addSource("delivery-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [riderPoint, destinationPoint] },
        },
      });
      map.addLayer({
        id: "delivery-route",
        type: "line",
        source: "delivery-route",
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.55,
          "line-width": 2,
          "line-dasharray": [3, 3.5],
        },
      });
      map.fitBounds([
        [Math.min(riderPoint[0], destinationPoint[0]), Math.min(riderPoint[1], destinationPoint[1])],
        [Math.max(riderPoint[0], destinationPoint[0]), Math.max(riderPoint[1], destinationPoint[1])],
      ], { padding: 36, maxZoom: 16, duration: 300 });
    } else {
      map.easeTo({ center: destinationPoint, zoom: 14, duration: 300 });
    }
  }, [destination.latitude, destination.longitude, ready, rider]);

  return <div ref={elementRef} className="h-72 w-full bg-meathead-gray sm:h-96" role="img" aria-label={rider ? "Map showing the rider and delivery address" : "Map showing the delivery address"} />;
}
