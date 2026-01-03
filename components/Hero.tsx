"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const WHATSAPP_NUMBER = "923366957572";
const getWhatsAppMessage = () => {
  return "Yo Meathead! I want to order beef patties for the Friday Drop. Let's go!";
};

export default function Hero() {
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(getWhatsAppMessage())}`;
    window.open(url, "_blank");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-meathead-black via-meathead-charcoal to-meathead-black opacity-90" />

      <div className="absolute inset-0 bg-[url('/images/product.jpeg')] bg-cover bg-center opacity-10 blur-sm" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <Image
              src="/images/logo.jpg"
              alt="Meathead Logo"
              width={120}
              height={120}
              className="mx-auto lg:mx-0 rounded-full"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl leading-none mb-6 uppercase tracking-tighter"
          >
            FUEL LIKE AN
            <br />
            <span className="text-meathead-red">APEX PREDATOR.</span>
            <br />
            <span className="text-white text-4xl md:text-6xl lg:text-7xl">ZERO SEED OILS.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8 text-sm md:text-base"
          >
            <div className="bg-meathead-gray px-6 py-3 rounded-lg border border-meathead-red/20">
              <span className="text-meathead-red font-data font-bold text-2xl">24G+</span>
              <span className="text-gray-400 ml-2 font-data text-sm">PROTEIN</span>
            </div>
            <div className="bg-meathead-gray px-6 py-3 rounded-lg border border-meathead-red/20">
              <span className="text-meathead-red font-data font-bold text-2xl">80/20</span>
              <span className="text-gray-400 ml-2 font-data text-sm">PRECISION</span>
            </div>
            <div className="bg-meathead-gray px-6 py-3 rounded-lg border border-meathead-red/20">
              <span className="text-meathead-red font-data font-bold text-2xl">125G</span>
              <span className="text-gray-400 ml-2 font-data text-sm">PATTY</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-6"
          >
            <p className="text-gray-400 text-sm mb-2 font-data">WEEKLY FUEL PACK</p>
            <p className="font-data font-bold text-5xl md:text-6xl text-white mb-1">
              ₨1,200
            </p>
            <p className="text-gray-400 text-base font-data">
              4 Patties | ₨300 each
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onClick={handleWhatsAppClick}
            className="bg-meathead-red hover:bg-red-700 text-white font-heading text-lg md:text-xl py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-meathead-red/50 uppercase tracking-wider"
          >
            CLAIM YOUR MACROS
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/product.jpeg"
              alt="Meathead Premium Beef Patty"
              width={800}
              height={800}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-meathead-black/60 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
