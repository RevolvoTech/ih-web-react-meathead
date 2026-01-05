"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useOrder } from "@/context/OrderContext";

const WHATSAPP_NUMBER = "923354818171";
const getWhatsAppMessage = () => {
  return "Yo Meathead! I want to order beef patties for the Friday Drop. Let's go!";
};

export default function Hero() {
  const { orderData } = useOrder();

  const scrollToOrderForm = () => {
    const orderSection = document.getElementById("order");
    orderSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden px-4 pt-2 lg:pt-8 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-meathead-black via-meathead-charcoal to-meathead-black opacity-90" />

      <div className="absolute inset-0 bg-[url('/images/product_1.webp')] bg-cover bg-center opacity-10 blur-sm" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            className="mb-0 lg:mb-2"
          >
            <Image
              src="/images/logo.webp"
              alt="Meathead Logo"
              width={300}
              height={300}
              className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 mx-auto lg:mx-0"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl md:text-7xl lg:text-9xl leading-none mb-2 uppercase tracking-heading -mt-8 lg:-mt-12"
          >
            JUST BEEF.
            <br />
            <span className="text-meathead-red">NO BULLSH*T.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
            className="text-gray-300 text-lg md:text-xl lg:text-2xl mb-4 max-w-2xl"
          >
            Grass-fed beef. Cooked & smashed. Seared in tallow. FRESH, never frozen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="grid grid-cols-3 gap-4 mb-4"
          >
            <div className="bg-meathead-gray px-4 py-4 rounded-lg border-2 border-meathead-red/30 hover:border-meathead-red/60 transition-all">
              <div className="text-meathead-red font-data font-bold text-2xl lg:text-3xl mb-1">24G+</div>
              <div className="text-gray-400 font-data text-xs lg:text-sm">PROTEIN</div>
            </div>
            <div className="bg-meathead-gray px-4 py-4 rounded-lg border-2 border-meathead-red/30 hover:border-meathead-red/60 transition-all">
              <div className="text-meathead-red font-data font-bold text-2xl lg:text-3xl mb-1">80/20</div>
              <div className="text-gray-400 font-data text-xs lg:text-sm">PRECISION</div>
            </div>
            <div className="bg-meathead-gray px-4 py-4 rounded-lg border-2 border-meathead-red/30 hover:border-meathead-red/60 transition-all">
              <div className="text-meathead-red font-data font-bold text-2xl lg:text-3xl mb-1">125G</div>
              <div className="text-gray-400 font-data text-xs lg:text-sm">PATTY</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
            className="mb-3"
          >
            <p className="text-gray-400 text-sm mb-2 font-data">Oh Bhai 🤦🏻‍♂️ PACK</p>
            <p className="font-data font-bold text-5xl md:text-6xl text-white mb-1">
              ₨1,200
            </p>
            <p className="text-gray-400 text-base font-data">
              4 Patties | ₨300 each
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToOrderForm}
            className="bg-meathead-red hover:bg-red-700 text-white font-heading text-xl md:text-2xl lg:text-3xl py-5 px-16 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-meathead-red/50 uppercase tracking-heading"
          >
            {orderData.isSoldOut ? "JOIN PRIORITY LIST" : "SECURE YOUR BATCH"}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative self-center mt-12"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/patty.webp"
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
