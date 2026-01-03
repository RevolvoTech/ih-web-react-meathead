"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const reasons = [
  {
    title: "ZERO SOY",
    description: "No soy fillers, no fake meat, no plant protein. Just 100% grass-fed beef from real animals.",
  },
  {
    title: "ZERO SEED OILS",
    description: "Cooked in pure beef tallow. No canola, no sunflower, no inflammatory garbage.",
  },
  {
    title: "ZERO EXCUSES",
    description: "24g bioavailable protein, 0g carbs. Your macros are already calculated. Just eat and grow.",
  },
  {
    title: "ZERO BS",
    description: "No marketing fluff. No fake reviews. Just premium beef that actually fuels your gains.",
  },
];

export default function WhyMeathead() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-meathead-charcoal via-meathead-black to-meathead-charcoal opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-6 uppercase tracking-tighter">
            WHY <span className="text-meathead-red">MEATHEAD?</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
            Tired of processed protein sources with sketchy ingredients?
            <br />
            <span className="text-white font-bold">We are too.</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="bg-meathead-gray/50 backdrop-blur-sm p-8 rounded-xl border border-meathead-red/10 hover:border-meathead-red/30 transition-all duration-300 group"
            >
              <h3 className="font-heading font-bold text-3xl text-meathead-red mb-4 group-hover:scale-105 transition-transform uppercase tracking-tighter">
                {reason.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-meathead-charcoal border-2 border-meathead-red px-8 py-6 rounded-xl">
            <p className="text-gray-400 mb-2">THE MEATHEAD PROMISE</p>
            <p className="font-heading text-3xl md:text-4xl text-white uppercase tracking-tighter">
              REAL PROTEIN. <span className="text-meathead-red">REAL GAINS.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
