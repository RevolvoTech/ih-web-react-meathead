"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

const faqs = [
  {
    question: "Is MEATHEAD a better alternative to protein powder?",
    answer: "Absolutely! While protein powder and whey supplements offer isolated protein, MEATHEAD beef patties provide complete whole food nutrition with 24g+ protein, essential fats, vitamins, and minerals. No artificial sweeteners, no fillers, no questionable ingredients - just pure beef. Plus, real food is more satiating and better absorbed than protein shakes."
  },
  {
    question: "How do MEATHEAD beef patties compare to meal replacement bars and energy bars?",
    answer: "MEATHEAD beef patties are superior to meal replacement bars and energy bars in every way. We provide real protein from quality beef (24g+), while most protein bars contain processed proteins, sugar, and fillers. Our patties have zero carbs, no artificial ingredients, and deliver sustained energy - not the sugar crash you get from energy bars."
  },
  {
    question: "Can I use MEATHEAD beef patties for smash burgers?",
    answer: "Yes! Our 125g beef patties are perfect for smash burgers. With an 85/15 lean-to-fat ratio, they create restaurant-quality smash burgers with amazing crust and juice. Pre-cooked for convenience, you can make gourmet smash burgers at home in minutes. The best burger patties in Islamabad for homemade burgers."
  },
  {
    question: "Do you deliver beef patties in Islamabad and Rawalpindi?",
    answer: "Yes, we deliver premium beef patties across Islamabad and Rawalpindi (twin cities). Join our waitlist now to get priority access when we launch delivery in your area. We're committed to bringing high-protein, convenient nutrition to gym enthusiasts throughout the capital region."
  },
  {
    question: "How much protein do I get compared to protein shakes?",
    answer: "Each MEATHEAD 125g beef patty contains 24g+ of complete protein - similar to a standard protein shake but from real food sources. Unlike protein shakes that digest quickly, our beef patties provide sustained protein release, keeping you fuller longer and supporting muscle growth throughout the day."
  },
  {
    question: "Are MEATHEAD beef patties halal?",
    answer: "Yes, all MEATHEAD beef patties are 100% halal. We source premium quality halal beef and maintain strict halal standards throughout our preparation process. You can trust that every burger patty meets Islamic dietary requirements."
  },
  {
    question: "What makes MEATHEAD better than chicken breast for protein?",
    answer: "While chicken breast is lean, MEATHEAD beef patties offer more flavor, better satiety, and essential fats your body needs. Our 85/15 ratio provides optimal nutrition for muscle building - not too lean, not too fatty. Plus, our patties are pre-cooked, saving you meal prep time compared to cooking chicken breast daily."
  },
  {
    question: "Can I bulk order beef patties for meal prep?",
    answer: "Yes! We offer bulk pricing for athletes and gym enthusiasts doing meal prep. Buying wholesale beef patties is more economical than buying protein powder or meal replacement bars weekly. Check our bulk pricing section for the best deals on high-protein meals in Pakistan."
  },
  {
    question: "How are MEATHEAD patties better than regular frozen burger patties?",
    answer: "Unlike frozen burger patties from supermarkets, MEATHEAD patties are pre-cooked, precision-ground to 85/15, and optimized for protein content (24g+). Regular frozen patties often have lower protein, more fat, and unknown quality. We're transparent about macros and use only premium beef."
  },
  {
    question: "What's the cost per serving compared to protein powder?",
    answer: "Starting at Rs 325 per patty (24g+ protein), MEATHEAD is competitively priced with premium protein powder - but you get real food nutrition, not just isolated whey. When you factor in satiety, complete nutrition, and convenience, MEATHEAD offers better value than protein supplements."
  },
  {
    question: "Are these good for post-workout meals?",
    answer: "Perfect for post-workout nutrition! MEATHEAD beef patties provide fast-absorbing protein to kickstart recovery, plus essential fats for hormone production and sustained energy. Better than protein shakes that only offer protein - you get complete nutrition to maximize muscle growth and recovery."
  },
  {
    question: "Can I use MEATHEAD for cutting or bulking?",
    answer: "Absolutely! For cutting, our patties provide high protein with controlled macros (24g protein, 20g fat, 0g carbs). For bulking, add our beef patties to your meals for extra calories and protein. The clean macros make it easy to track whether you're cutting or bulking."
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-black">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-heading">
            GOT <span className="text-meathead-red">QUESTIONS?</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            Everything you need to know about MEATHEAD beef patties
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-meathead-gray rounded-lg border border-meathead-red/20 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-meathead-red/5 transition-all"
              >
                <h3 className="font-data font-bold text-lg text-white pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-meathead-red text-2xl flex-shrink-0"
                >
                  ↓
                </motion.div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Schema markup for FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
      </div>
    </section>
  );
}
