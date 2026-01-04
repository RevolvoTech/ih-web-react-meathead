"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import PriorityListForm from "./PriorityListForm";

export default function FoundersNote() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const [orderData, setOrderData] = useState({
    totalOrders: 0,
    slotsRemaining: 50,
    isSoldOut: false,
  });

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const response = await fetch("/.netlify/functions/get-order-count");
        const data = await response.json();
        setOrderData({
          totalOrders: data.totalOrders,
          slotsRemaining: data.slotsRemaining,
          isSoldOut: data.isSoldOut,
        });
      } catch (error) {
        console.error("Error fetching order count:", error);
        // Keep fallback values on error
      }
    };

    fetchOrderCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrderCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="founders" ref={ref} className="py-20 px-4 bg-meathead-charcoal relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-meathead-black/50 via-transparent to-meathead-black/50" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-5xl md:text-6xl mb-4 uppercase tracking-heading">
            FROM THE <span className="text-meathead-red">FOUNDERS</span>
          </h2>
          <p className="text-gray-400 text-lg">Why Meathead exists</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red/30 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-meathead-red rounded-full flex items-center justify-center">
                  <span className="font-heading text-2xl text-white tracking-heading">SA</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">Saad Asghar</p>
                <p className="text-gray-400 text-sm font-data">Co-Founder</p>
              </div>
            </div>

            <blockquote className="text-gray-300 leading-relaxed italic">
              "I didn't actually want to start a burger spot. I just wanted to eat clean beef without the prep work. Every time I looked for a quick meal in Isloo, I was met with seed oils, mystery fillers, and grain-fed trash.
              <br /><br />
              Honestly? <span className="text-white font-bold not-italic">Gosht khana hai yaar.</span>
              <br /><br />
              So I built this for myself. <span className="text-white font-bold not-italic">If I won't fuel my own body with it, I won't sell it to you.</span>"
            </blockquote>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red/30 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-meathead-red rounded-full flex items-center justify-center">
                  <span className="font-heading text-2xl text-white tracking-heading">KK</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">Khizer Khan</p>
                <p className="text-gray-400 text-sm font-data">Co-Founder</p>
              </div>
            </div>

            <blockquote className="text-gray-300 leading-relaxed italic">
              "If the vegans aren't complaining, we aren't doing it right.
              <br /><br />
              <span className="text-white font-bold not-italic">Asli Australian Verhay ka gosht khao, chass aye gi, aur rona band karo.</span> 💪
              <br /><br />
              Most burgers feel like a chemistry project - ours feels like a reward. No fillers, no seed oils, just heavy protein that actually tastes like it's supposed to.
              <br /><br />
              <span className="text-white font-bold not-italic">Eat like a king, train like a beast.</span>"
            </blockquote>
          </motion.div>
        </div>

        {orderData.isSoldOut ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <PriorityListForm />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-meathead-black/50 backdrop-blur-sm border-2 border-meathead-red/30 rounded-xl p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 flex-1">
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1 font-data">ORDERS OPEN</p>
                  <p className="font-heading text-xl text-meathead-red uppercase tracking-heading">
                    NOW
                  </p>
                </div>
                <div className="hidden md:block w-px h-12 bg-meathead-red/30"></div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1 font-data">ORDERS CLOSE</p>
                  <p className="font-heading text-xl text-white uppercase tracking-heading">
                    Thursday Midnight
                  </p>
                </div>
                <div className="hidden md:block w-px h-12 bg-meathead-red/30"></div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-1 font-data">OR WHEN</p>
                  <p className="font-heading text-xl text-meathead-red uppercase tracking-heading">
                    50 SLOTS HIT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-meathead-gray/50 px-6 py-4 rounded-lg border border-meathead-red/20">
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-3 w-3 animate-ping bg-meathead-red rounded-full opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 bg-meathead-red rounded-full"></span>
                </div>
                <div className="text-left">
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-data">BATCH 01</p>
                  <p className="font-data font-bold text-2xl text-white">
                    <span className="text-meathead-red">{orderData.slotsRemaining}</span>
                    /50
                  </p>
                  <p className="text-gray-400 text-xs font-data">Slots Remaining</p>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-6 text-center italic">
              Zero exceptions. First come, first served.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
