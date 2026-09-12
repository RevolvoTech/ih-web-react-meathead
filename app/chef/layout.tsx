import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MEATHEAD Chef",
  robots: { index: false, follow: false },
};

export default function ChefLayout({ children }: { children: React.ReactNode }) {
  return children;
}
