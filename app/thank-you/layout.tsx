import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You - Welcome to MEATHEAD Waitlist | Premium Beef Patties Islamabad",
  description: "You're on the MEATHEAD waitlist! We'll notify you on WhatsApp when we launch premium beef patties delivery in Islamabad & Rawalpindi. Join the protein revolution!",
  robots: {
    index: false, // Don't index thank you pages (common practice)
    follow: true,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
