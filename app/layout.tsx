import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEATHEAD | Premium Beef Patties for Serious Gains",
  description: "24G protein. 80/20 precision. 0% fillers. Premium beef patties designed for gym bros who demand quality protein sources.",
  keywords: ["beef patties", "protein", "gym food", "high protein", "meathead", "80/20 beef", "premium beef"],
  openGraph: {
    title: "MEATHEAD | Premium Beef Patties",
    description: "24G protein. 80/20 precision. 0% fillers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
