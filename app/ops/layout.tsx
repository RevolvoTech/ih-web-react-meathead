import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MEATHEAD Ops",
  robots: { index: false, follow: false },
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
