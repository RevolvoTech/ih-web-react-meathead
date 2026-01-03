"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const comparisons = [
  { category: "Protein Source", them: "Mystery cuts, grain-fed", us: "100% Grass-fed Beef" },
  { category: "Fillers", them: "Soy, breadcrumbs, grains", us: "ZERO. Just beef." },
  { category: "Cooking Fat", them: "Vegetable oils, seed oils", us: "Pure Beef Tallow" },
  { category: "Processing", them: "Factory ground, weeks old", us: "Fresh ground Friday" },
  { category: "Ingredients", them: "15+ mystery additives", us: "Beef, Salt, Pepper. Done." },
];

export default function Comparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-heading">
            US VS <span className="text-meathead-red">THEM</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Most patties are processed garbage. We're not.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border-2 border-meathead-red/30"
        >
          <div className="grid grid-cols-3 bg-meathead-charcoal border-b-2 border-meathead-red/30">
            <div className="p-4 md:p-6"></div>
            <div className="p-4 md:p-6 text-center border-x border-meathead-red/20">
              <p className="text-gray-500 font-bold text-sm md:text-base line-through">THEM</p>
            </div>
            <div className="p-4 md:p-6 text-center bg-meathead-red/10">
              <p className="text-meathead-red font-heading text-lg md:text-xl uppercase tracking-heading">
                MEATHEAD
              </p>
            </div>
          </div>

          {comparisons.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="grid grid-cols-3 border-b border-meathead-gray/50 hover:bg-meathead-charcoal/30 transition-colors"
            >
              <div className="p-4 md:p-6">
                <p className="font-bold text-sm md:text-base text-white">{item.category}</p>
              </div>
              <div className="p-4 md:p-6 text-center border-x border-meathead-gray/20">
                <p className="text-gray-500 text-xs md:text-sm">{item.them}</p>
              </div>
              <div className="p-4 md:p-6 text-center bg-meathead-red/5">
                <p className="text-white font-semibold text-xs md:text-sm">{item.us}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400 text-sm italic">
            More bioavailable protein than 5 eggs. 0% of the bloating.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
