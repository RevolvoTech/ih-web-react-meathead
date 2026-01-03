"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const nutritionFacts = [
  { label: "Protein", value: "24g+", description: "Premium muscle fuel" },
  { label: "Weight", value: "125g", description: "Perfect portion size" },
  { label: "Fat", value: "20g", description: "80/20 lean-to-fat ratio" },
  { label: "Carbs", value: "0g", description: "Zero fillers" },
];

const features = [
  {
    title: "PRECISION GROUND",
    description: "80/20 lean-to-fat ratio for optimal taste and nutrition",
  },
  {
    title: "100% BEEF",
    description: "No soy, no fillers, no compromises",
  },
  {
    title: "HIGH PROTEIN",
    description: "24g+ of quality protein per 125g patty",
  },
  {
    title: "READY TO COOK",
    description: "Pre-portioned for convenience",
  },
];

export default function ProductShowcase() {
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
            FUEL YOUR <span className="text-meathead-red">GAINS</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Premium beef patties engineered for serious athletes who demand real protein
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {nutritionFacts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-meathead-gray p-6 rounded-xl border border-meathead-red/20 hover:border-meathead-red/50 transition-all duration-300"
            >
              <div className="text-meathead-red font-data font-bold text-4xl mb-2">
                {fact.value}
              </div>
              <div className="text-white font-bold mb-1 font-data text-sm">{fact.label}</div>
              <div className="text-gray-400 text-sm">{fact.description}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="w-2 h-2 bg-meathead-red rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-heading font-bold text-2xl text-meathead-red mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
