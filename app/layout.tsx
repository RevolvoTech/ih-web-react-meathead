import type { Metadata } from "next";
import { Anton, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MEATHEAD | Premium Beef Patties for Serious Gains",
  description: "24G+ protein per 125g patty. 80/20 precision. 0% fillers. Premium beef patties designed for gym bros who demand quality protein sources.",
  keywords: ["beef patties", "protein", "gym food", "high protein", "meathead", "80/20 beef", "premium beef", "125g patty"],
  icons: {
    icon: '/images/logo.webp',
  },
  openGraph: {
    title: "MEATHEAD | Premium Beef Patties",
    description: "24G+ protein per 125g patty. 80/20 precision. 0% fillers.",
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
      <body className={`${anton.variable} ${spaceGrotesk.variable} ${inter.variable} font-inter antialiased`}>
        <OrderProvider>
          {children}
        </OrderProvider>
      </body>
    </html>
  );
}
