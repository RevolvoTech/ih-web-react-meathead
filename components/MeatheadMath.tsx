"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function MeatheadMath() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-black">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-meathead-charcoal to-meathead-gray border-2 border-meathead-red/30 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="font-heading text-5xl md:text-6xl text-white mb-4 uppercase tracking-tighter">
              MEATHEAD <span className="text-meathead-red">MATH</span>
            </h2>
            <p className="text-gray-400">The ROI on real protein</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-meathead-black/50 backdrop-blur-sm p-6 rounded-xl border border-meathead-red/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-data text-sm text-gray-400 mb-1">PER 125G PATTY</p>
                  <p className="font-data text-4xl font-bold text-meathead-red">24g+</p>
                </div>
                <div className="bg-meathead-red/10 px-3 py-1 rounded-full">
                  <p className="font-data text-xs font-bold text-meathead-red">BIOAVAILABLE</p>
                </div>
              </div>
              <p className="text-white font-bold mb-2">Premium Protein</p>
              <p className="text-gray-400 text-sm">
                Complete amino acid profile. No soy isolate, no pea protein, no fake meat.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-meathead-black/50 backdrop-blur-sm p-6 rounded-xl border border-meathead-red/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-data text-sm text-gray-400 mb-1">INFLAMMATORY OILS</p>
                  <p className="font-data text-4xl font-bold text-meathead-red">0g</p>
                </div>
                <div className="bg-meathead-red/10 px-3 py-1 rounded-full">
                  <p className="font-data text-xs font-bold text-meathead-red">ZERO</p>
                </div>
              </div>
              <p className="text-white font-bold mb-2">Seed Oil Free</p>
              <p className="text-gray-400 text-sm">
                No canola, soybean, or vegetable oils. Cooked in pure beef tallow.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 pt-8 border-t border-meathead-red/20 text-center"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="font-data text-2xl md:text-3xl font-bold text-white mb-1">₨300</p>
                <p className="text-gray-400 text-xs md:text-sm">Total Cost</p>
              </div>
              <div>
                <p className="font-data text-2xl md:text-3xl font-bold text-meathead-red mb-1">₨12.50</p>
                <p className="text-gray-400 text-xs md:text-sm">Per Gram Protein</p>
              </div>
              <div>
                <p className="font-data text-2xl md:text-3xl font-bold text-white mb-1">100%</p>
                <p className="text-gray-400 text-xs md:text-sm">Real Beef</p>
              </div>
            </div>

            <div className="bg-meathead-red/10 border border-meathead-red/30 rounded-lg p-4">
              <p className="text-white font-bold mb-1 font-data">THE BOTTOM LINE:</p>
              <p className="text-gray-300 text-sm italic">
                Cheaper than a protein bar. Better than a supplement. Cleaner than 99% of restaurants.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
