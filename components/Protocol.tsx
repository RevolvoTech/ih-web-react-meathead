"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const protocols = [
  {
    number: "01",
    title: "ELITE SOURCES",
    description: "100% grass-fed beef from elite local suppliers. Same-day sourcing for maximum freshness.",
  },
  {
    number: "02",
    title: "SAME DAY COOK",
    description: "Get it Friday morning. Cook it Friday. Zero freezing, zero aging, zero compromises.",
  },
  {
    number: "03",
    title: "PURE BEEF TALLOW",
    description: "Cooked in ancestral fats. Zero seed oils, zero vegetable oils.",
  },
  {
    number: "04",
    title: "FRIDAY DELIVERY",
    description: "Delivered fresh in insulated bags. Friday 6-8 PM. Bahria 7, 8 | DHA 1, 2, 4 only.",
  },
];

export default function Protocol() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-charcoal">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-tighter">
            THE <span className="text-meathead-red">PROTOCOL</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Transparency isn't optional. Here's exactly how we operate.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {protocols.map((protocol, index) => (
            <motion.div
              key={protocol.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="relative bg-meathead-gray/50 backdrop-blur-sm p-8 rounded-xl border border-meathead-red/20 hover:border-meathead-red/50 transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 font-heading text-9xl text-meathead-red/5 leading-none -mr-4 -mt-4">
                {protocol.number}
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-heading text-4xl text-meathead-red">
                    {protocol.number}
                  </span>
                  <h3 className="font-heading font-bold text-2xl text-white uppercase tracking-tighter">
                    {protocol.title}
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {protocol.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-meathead-gray/80 px-6 py-4 rounded-lg border border-meathead-red/30">
            <svg className="w-5 h-5 text-meathead-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-white font-bold text-sm md:text-base">
              Seed Oil Free Certified | Animal-Based Approved
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
