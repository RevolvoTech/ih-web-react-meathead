import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Order | MEATHEAD",
  description: "Private MEATHEAD test checkout.",
  robots: { index: false, follow: false },
};

export default function OrderLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
