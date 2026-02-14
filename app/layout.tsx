import type { Metadata } from "next";
import { Anton, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "@/context/OrderContext";
import StructuredData from "@/components/StructuredData";

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
  title: "MEATHEAD | Beef Patties, Smash Burgers & Protein Powder Alternative Islamabad | Best Meal Replacement Pakistan",
  description: "Pakistan's #1 protein replacement alternative to protein powder, energy bars & shakes. 24G+ protein beef patties in Islamabad & Rawalpindi. Better than meal replacement bars, protein shakes, whey powder. Perfect beef burger patty for smash burgers. Pre-cooked, zero fillers, halal beef for serious gains.",
  keywords: [
    // PRIMARY TARGET KEYWORDS - Protein Alternatives
    "protein powder alternative islamabad",
    "meal replacement alternative pakistan",
    "energy bars alternative islamabad",
    "protein shake replacement rawalpindi",
    "whey protein alternative pakistan",
    "protein supplement alternative twin cities",

    // Beef Burger/Patty Keywords
    "beef patties islamabad",
    "beef burger patty rawalpindi",
    "smash burger patty pakistan",
    "burger patties islamabad",
    "premium beef patties twin cities",
    "halal beef patties islamabad",
    "fresh beef patties rawalpindi",

    // Smash Burger Specific
    "smash burger islamabad",
    "smash burger patty pakistan",
    "best burger patties islamabad",
    "homemade burger patties rawalpindi",
    "restaurant quality burger patties pakistan",

    // Protein Powder Competitors
    "protein powder pakistan",
    "whey protein islamabad",
    "protein supplements rawalpindi",
    "protein shakes islamabad",
    "mass gainer alternative pakistan",
    "better than protein powder islamabad",

    // Meal Replacement Competitors
    "meal replacement islamabad",
    "meal replacement bars pakistan",
    "protein bars islamabad",
    "energy bars rawalpindi",
    "nutrition bars pakistan",
    "ready to eat protein meals islamabad",

    // Local SEO - Islamabad/Rawalpindi
    "high protein food islamabad",
    "gym food islamabad",
    "protein food rawalpindi",
    "bodybuilding food pakistan",
    "fitness meals twin cities",

    // Protein Rich Food Categories
    "high protein snacks islamabad",
    "protein rich meals rawalpindi",
    "post workout food islamabad",
    "pre workout meals pakistan",
    "muscle building food islamabad",
    "bulking food rawalpindi",
    "cutting diet food pakistan",

    // Gym/Fitness Keywords
    "gym diet food rawalpindi",
    "bodybuilding meals islamabad",
    "fitness food islamabad",
    "athlete nutrition pakistan",
    "sports nutrition islamabad",
    "performance food rawalpindi",

    // Product-Specific Long-tail
    "pre cooked beef patties islamabad",
    "ready to eat beef burgers rawalpindi",
    "85/15 beef patties pakistan",
    "lean beef patties islamabad",
    "high protein beef rawalpindi",
    "cooked burger patties twin cities",

    // Competitor Product Alternatives
    "better than chicken breast islamabad",
    "alternative to whey protein pakistan",
    "replace protein powder islamabad",
    "no need protein shakes rawalpindi",
    "real food protein islamabad",
    "whole food protein pakistan",

    // Convenience Keywords
    "quick protein meals islamabad",
    "easy high protein food rawalpindi",
    "convenient protein source pakistan",
    "meal prep protein islamabad",
    "ready made protein meals rawalpindi",

    // Health/Quality Keywords
    "clean protein islamabad",
    "natural protein source pakistan",
    "no artificial protein rawalpindi",
    "zero filler protein islamabad",
    "pure beef protein pakistan",
    "halal protein islamabad",

    // Price/Value Keywords
    "affordable protein islamabad",
    "cheap protein source rawalpindi",
    "bulk protein pakistan",
    "wholesale beef patties islamabad",
    "protein on budget rawalpindi",

    // Delivery Keywords
    "protein delivery islamabad",
    "beef patties delivery rawalpindi",
    "gym food delivery twin cities",
    "home delivery protein pakistan",

    // Brand
    "meathead pakistan",
    "meathead islamabad",
    "meathead beef patties"
  ],
  authors: [{ name: "MEATHEAD Pakistan" }],
  creator: "MEATHEAD",
  publisher: "MEATHEAD",

  icons: {
    icon: '/images/logo.webp',
    apple: '/images/logo.webp',
  },

  metadataBase: new URL('https://meathead.pk'),

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: "MEATHEAD | High Protein Beef Patties Islamabad & Rawalpindi",
    description: "24G+ protein per patty. Zero fillers. Pre-cooked beef patties for serious gains. Now delivering in Twin Cities. Join the waitlist!",
    url: 'https://meathead.pk',
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
      <head>
        <StructuredData />
      </head>
      <body className={`${anton.variable} ${spaceGrotesk.variable} ${inter.variable} font-inter antialiased`}>
        <OrderProvider>
          {children}
        </OrderProvider>
      </body>
    </html>
  );
}
