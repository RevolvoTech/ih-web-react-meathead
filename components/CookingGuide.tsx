"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const steps = [
  {
    step: "01",
    title: "HIGH-THERMAL SEAR",
    description: "We use custom cast iron at 250°C+ to trigger the Maillard reaction. No compromises.",
    temp: "250°C+",
  },
  {
    step: "02",
    title: "THE ULTRA-SMASH",
    description: "40lbs of pressure applied to create that signature lacey, crispy edge.",
    temp: "40lbs pressure",
  },
  {
    step: "03",
    title: "PRECISION FLIP",
    description: "One flip. 120 seconds. Locking in the grass-fed juices.",
    temp: "120 sec",
  },
  {
    step: "04",
    title: "THE REST",
    description: "Every patty rests for 60 seconds before bagging to ensure maximum tenderness.",
    temp: "60 sec",
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
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-heading">
            THE SCIENCE OF <span className="text-meathead-red">THE SMASH</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            How we engineered your perfect bite.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-3xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border-2 border-meathead-red/30">
            <Image
              src="/images/product_2.webp"
              alt="Meathead patties on the grill"
              width={800}
              height={600}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-meathead-black/50 to-transparent" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.15 + index * 0.05, ease: "easeOut" }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative bg-meathead-charcoal p-6 rounded-xl border-2 border-meathead-red/20 hover:border-meathead-red/50 transition-all duration-300 group"
            >
              <div className="absolute top-0 left-0 bg-meathead-red text-white font-heading text-sm px-3 py-1 rounded-br-xl rounded-tl-xl tracking-heading">
                STEP {item.step}
              </div>

              <div className="mt-8 mb-4">
                <h3 className="font-heading text-2xl text-white mb-2 uppercase tracking-heading">
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
                  transition={{ duration: 0.5, delay: 0.25 + index * 0.05, ease: "easeOut" }}
                  className="h-full bg-meathead-red"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm italic">
            This is why your patty tastes better than any random joint in F-7. We engineered it that way.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
