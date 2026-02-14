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
  title: "MEATHEAD | Halal Beef Patties in Islamabad & Rawalpindi",
  description: "Premium halal beef patties for smash burgers and high-protein meals in Islamabad and Rawalpindi (Twin Cities). 24g+ protein per patty, 85/15 ratio, zero fillers.",
  authors: [{ name: "MEATHEAD Pakistan" }],
  creator: "MEATHEAD",
  publisher: "MEATHEAD",
  keywords: [
    "beef patties Islamabad",
    "beef patties Rawalpindi",
    "halal beef patties Pakistan",
    "high protein beef patties",
    "smash burger patties Islamabad",
    "Twin Cities beef patties",
    "MEATHEAD Pakistan",
    "protein meals Islamabad Rawalpindi",
  ],

  icons: {
    icon: '/images/logo.webp',
    apple: '/images/logo.webp',
  },

  metadataBase: new URL('https://meatheadpakistan.vercel.app'),

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: "MEATHEAD | High Protein Beef Patties Islamabad & Rawalpindi",
    description: "24G+ protein per patty. Zero fillers. Pre-cooked beef patties for serious gains. Now delivering in Twin Cities. Join the waitlist!",
    url: 'https://meatheadpakistan.vercel.app',
    siteName: 'MEATHEAD Pakistan',
    locale: 'en_PK',
    type: "website",
    images: [
      {
        url: '/images/patty.webp',
        width: 1200,
        height: 630,
        alt: 'MEATHEAD Premium Beef Patty - High Protein Gym Food',
      }
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MEATHEAD | High Protein Beef Patties Islamabad',
    description: '24G+ protein. Zero BS. Pre-cooked beef patties for gym bros in Twin Cities.',
    images: ['/images/patty.webp'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  other: {
    'geo.region': 'PK-IS',
    'geo.placename': 'Islamabad',
    'geo.position': '33.6844;73.0479',
    'ICBM': '33.6844, 73.0479',
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
