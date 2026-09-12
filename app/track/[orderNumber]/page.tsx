import type { Metadata } from "next";
import TrackingClient from "@/components/tracking/TrackingClient";

export const metadata: Metadata = {
  title: "Track your MEATHEAD order",
  description: "Private MEATHEAD order status and delivery tracking.",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <TrackingClient orderNumber={orderNumber} />;
}
