import type { Metadata } from "next";
import Link from "next/link";

const pageUrl = "https://meatheadpakistan.vercel.app/beef-patties-islamabad";

export const metadata: Metadata = {
  title: "Beef Patties in Islamabad | Halal High-Protein Patties | MEATHEAD",
  description:
    "Looking for beef patties in Islamabad? MEATHEAD offers halal high-protein beef patties (24g+ protein, 125g, 85/15). Join the waitlist for launch updates.",
  alternates: {
    canonical: "/beef-patties-islamabad",
  },
  openGraph: {
    title: "Beef Patties in Islamabad | MEATHEAD",
    description:
      "Halal, high-protein beef patties in Islamabad. Join MEATHEAD waitlist for launch updates.",
    url: pageUrl,
    type: "article",
    images: [
      {
        url: "/images/patty.webp",
        width: 1200,
        height: 630,
        alt: "High-protein halal beef patties in Islamabad",
      },
    ],
  },
};

const faqItems = [
  {
    question: "Do you deliver beef patties in Islamabad?",
    answer:
      "MEATHEAD is launching in Islamabad and nearby sectors. Join the waitlist to receive WhatsApp updates when delivery opens in your area.",
  },
  {
    question: "Are your patties halal?",
    answer:
      "Yes. MEATHEAD patties are made from premium halal beef with transparent macros and zero fillers.",
  },
  {
    question: "How much protein is in each patty?",
    answer:
      "Each 125g patty is formulated for 24g+ protein with an 85/15 lean-to-fat ratio.",
  },
];

export default function BeefPattiesIslamabadPage() {
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
          Islamabad Guide
        </p>
        <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-heading mb-6">
          Beef Patties in <span className="text-meathead-red">Islamabad</span>
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          If you are searching for beef patties in Islamabad, MEATHEAD is built
          for exactly that need: premium halal beef patties for smash burgers,
          meal prep, and high-protein routines. We focus on quality protein and
          clean ingredients, with no filler-heavy shortcuts.
        </p>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          Each patty is designed for performance nutrition with 24g+ protein in
          a 125g serving and an 85/15 ratio. Whether you train regularly or just
          want better everyday meals, the goal is simple: real food protein you
          can trust in Islamabad.
        </p>
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-heading mb-4">
          Why People Search for MEATHEAD
        </h2>
        <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-8">
          <li>Halal beef patties with transparent macros.</li>
          <li>Built for gym users and meal-prep convenience.</li>
          <li>Reliable taste for home smash burgers.</li>
          <li>Twin Cities launch focus: Islamabad + Rawalpindi.</li>
        </ul>
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-heading mb-4">
          Islamabad Areas in Focus
        </h2>
        <p className="text-gray-300 leading-relaxed mb-8">
          We are prioritizing major Islamabad sectors and nearby neighborhoods
          including F-sectors, G-sectors, DHA, Bahria Town, and surrounding
          zones. If your area is listed on the form, you can join immediately.
        </p>

        <div className="bg-meathead-charcoal border border-meathead-red/30 rounded-xl p-6 mb-8">
          <p className="text-gray-200 mb-4">
            Want launch access in Islamabad?
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
              href="/beef-patties-rawalpindi"
              className="text-meathead-red hover:text-red-300"
            >
              Beef Patties Rawalpindi
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
