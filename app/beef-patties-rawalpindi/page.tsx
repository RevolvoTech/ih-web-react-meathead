import type { Metadata } from "next";
import Link from "next/link";

const pageUrl = "https://meatheadpakistan.vercel.app/beef-patties-rawalpindi";

export const metadata: Metadata = {
  title: "Beef Patties in Rawalpindi | Halal High-Protein Patties | MEATHEAD",
  description:
    "Looking for beef patties in Rawalpindi? MEATHEAD offers halal high-protein beef patties for burgers and meal prep. Join our launch waitlist.",
  alternates: {
    canonical: "/beef-patties-rawalpindi",
  },
  openGraph: {
    title: "Beef Patties in Rawalpindi | MEATHEAD",
    description:
      "Halal high-protein beef patties in Rawalpindi. Join the waitlist for launch updates.",
    url: pageUrl,
    type: "article",
    images: [
      {
        url: "/images/patty.webp",
        width: 1200,
        height: 630,
        alt: "High-protein halal beef patties in Rawalpindi",
      },
    ],
  },
};

const faqItems = [
  {
    question: "Do you serve Rawalpindi areas?",
    answer:
      "Yes. MEATHEAD is launching for Rawalpindi alongside Islamabad. Join the waitlist to get WhatsApp updates when your area opens.",
  },
  {
    question: "Are these patties good for burger nights and meal prep?",
    answer:
      "Yes. The patties are designed for both quick burgers and structured meal prep with consistent protein macros.",
  },
  {
    question: "What makes these different from regular frozen patties?",
    answer:
      "MEATHEAD focuses on halal beef quality, 24g+ protein per patty, and clean ingredient standards instead of filler-heavy products.",
  },
];

export default function BeefPattiesRawalpindiPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-meathead-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">
        <p className="text-meathead-red font-data uppercase tracking-wider text-sm mb-3">
          Rawalpindi Guide
        </p>
        <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-heading mb-6">
          Beef Patties in <span className="text-meathead-red">Rawalpindi</span>
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          Searching for beef patties in Rawalpindi usually means one thing: you
          want quality, consistent protein, and great burger performance. MEATHEAD
          is built around that exact demand with halal beef patties designed for
          both fitness goals and taste.
        </p>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          Our patties are engineered for real nutrition: 24g+ protein per 125g
          patty, 85/15 ratio, and a clean ingredient profile. This is for people
          in Rawalpindi who want better meat options for home cooking, smash
          burgers, and weekly meal prep.
        </p>
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-heading mb-4">
          Core Benefits
        </h2>
        <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-8">
          <li>High-protein halal beef patties with no filler-driven shortcuts.</li>
          <li>Consistent serving size and macros for easier tracking.</li>
          <li>Great for burger texture and gym-focused nutrition plans.</li>
          <li>Twin Cities launch model with Rawalpindi priority coverage.</li>
        </ul>

        <div className="bg-meathead-charcoal border border-meathead-red/30 rounded-xl p-6 mb-8">
          <p className="text-gray-200 mb-4">
            Join the Rawalpindi waitlist and get launch updates on WhatsApp.
          </p>
          <Link
            href="/#order"
            className="inline-block bg-meathead-red hover:bg-red-700 text-white font-heading uppercase tracking-heading px-6 py-3 rounded-lg transition-colors"
          >
            Join Waitlist
          </Link>
        </div>

        <div className="border-t border-meathead-gray/40 pt-6">
          <p className="text-gray-400 text-sm mb-2">Related pages:</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/beef-patties-islamabad"
              className="text-meathead-red hover:text-red-300"
            >
              Beef Patties Islamabad
            </Link>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}
