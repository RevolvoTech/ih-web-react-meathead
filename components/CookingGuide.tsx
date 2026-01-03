"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    step: "01",
    title: "HEAT THE IRON",
    description: "Cast iron at 100% heat. No compromises. Let it smoke.",
    temp: "250°C+",
  },
  {
    step: "02",
    title: "THE SMASH",
    description: "Drop the patty. Smash HARD with a spatula. Maillard crust = flavor.",
    temp: "2-3 min",
  },
  {
    step: "03",
    title: "FLIP ONCE",
    description: "When edges crisp up, flip. Cook other side til crust forms.",
    temp: "2 min",
  },
  {
    step: "04",
    title: "OPTIONAL ADD-ON",
    description: "Want Sea Salt or Masala? We'll add it on the patty. FREE. Let rest 30 seconds. Devour.",
    temp: "30 sec",
  },
];

export default function CookingGuide() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-tighter">
            3-MINUTE <span className="text-meathead-red">MASTERCLASS</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            How to cook a perfect patty. No fluff, just results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="relative bg-meathead-charcoal p-6 rounded-xl border-2 border-meathead-red/20 hover:border-meathead-red/50 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 bg-meathead-red text-white font-heading text-sm px-3 py-1 rounded-br-xl rounded-tl-xl">
                STEP {item.step}
              </div>

              <div className="mt-8 mb-4">
                <h3 className="font-heading font-bold text-2xl text-white mb-2 uppercase tracking-tighter">
                  {item.title}
                </h3>
                <div className="inline-block bg-meathead-red/20 text-meathead-red font-bold text-xs px-3 py-1 rounded-full">
                  {item.temp}
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 h-1 bg-meathead-red/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={isInView ? { width: "100%" } : {}}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  className="h-full bg-meathead-red"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm italic">
            Pro tip: That dry-aged funk and grass-fed richness? That's what you paid for. Don't overcook it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
