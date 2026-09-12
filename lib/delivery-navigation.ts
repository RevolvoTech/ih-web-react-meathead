import type { DeliveryRun, DeliveryStop } from "@/lib/meathead-api";

export const ARRIVAL_RADIUS_METERS = 100;
export const MAX_ARRIVAL_ACCURACY_METERS = 75;

export interface LocationReading {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export function distanceInMeters(
  from: Pick<LocationReading, "latitude" | "longitude">,
  to: Pick<LocationReading, "latitude" | "longitude">,
): number {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function isConfidentArrival(
  readings: LocationReading[],
  destination: Pick<LocationReading, "latitude" | "longitude">,
): boolean {
  return readings.length >= 2 && readings.every((reading) => (
    reading.accuracyMeters <= MAX_ARRIVAL_ACCURACY_METERS
    && distanceInMeters(reading, destination) <= ARRIVAL_RADIUS_METERS
  ));
}

export function googleMapsDirectionsUrl(latitude: number, longitude: number): string {
  const parameters = new URLSearchParams({
    api: "1",
    destination: `${latitude},${longitude}`,
    travelmode: "driving",
    dir_action: "navigate",
  });
  return `https://www.google.com/maps/dir/?${parameters.toString()}`;
}

export function whatsappArrivalUrl(order: {
  customerName: string;
  customerPhone: string;
  orderNumber: string;
}): string {
  const digits = order.customerPhone.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("00")
    ? digits.slice(2)
    : digits.startsWith("0")
      ? `92${digits.slice(1)}`
      : /^3\d{9}$/.test(digits)
        ? `92${digits}`
        : digits;
  const message = `Hi ${order.customerName}, your MEATHEAD rider is at your location. Please receive your order (${order.orderNumber}).`;
  return `https://wa.me/${internationalNumber}?${new URLSearchParams({ text: message }).toString()}`;
}

export function nextPendingStop(
  run: DeliveryRun,
  afterSequence = 0,
  excludeStopId?: string,
): DeliveryStop | undefined {
  const remaining = run.stops.filter((stop) => stop.status === "PENDING" && stop.id !== excludeStopId);
  return remaining.find((stop) => stop.sequence > afterSequence) ?? remaining[0];
}
