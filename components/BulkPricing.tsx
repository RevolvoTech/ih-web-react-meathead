"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const WHATSAPP_NUMBER = "923354818171";

interface OrderData {
  isSoldOut: boolean;
}

const pricingTiers = [
  {
    name: "SINGLE",
    patties: 1,
    price: 350,
    perPatty: 350,
    label: "Try it",
    popular: false,
  },
  {
    name: "WEEKLY FUEL",
    patties: 4,
    price: 1200,
    perPatty: 300,
    label: "Most Popular",
    popular: true,
  },
  {
    name: "BULK PREP",
    patties: 12,
    price: 3300,
    perPatty: 275,
    label: "Meal Prep King",
    popular: false,
  },
];

export default function BulkPricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [orderData, setOrderData] = useState<OrderData>({ isSoldOut: false });

  useEffect(() => {
    // Initial fetch
    const fetchOrderStatus = () => {
      fetch("/api/get-order-count")
        .then((res) => {
          if (!res.ok) throw new Error("API not available");
          return res.json();
        })
        .then((data) => setOrderData(data))
        .catch(() => setOrderData({ isSoldOut: false }));
    };

    fetchOrderStatus();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrderStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleOrder = (tier: typeof pricingTiers[0]) => {
    const message = `Yo Meathead! I want to order ${tier.patties} patties (${tier.name}) for the Friday Drop. Total: ₨${tier.price}. Let's go!`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const scrollToPriorityList = () => {
    const foundersSection = document.getElementById("founders");
    foundersSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-charcoal">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-heading">
            CHOOSE YOUR <span className="text-meathead-red">PACK</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            More patties = better pricing. Stock up and save.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className={`relative bg-meathead-gray rounded-2xl p-8 ${
                tier.popular
                  ? "border-2 border-meathead-red shadow-xl shadow-meathead-red/20 scale-105"
                  : "border border-meathead-gray"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-meathead-red text-white font-heading text-sm px-4 py-1 rounded-full tracking-heading">
                    {tier.label}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-heading text-2xl text-white mb-2 uppercase tracking-heading">
                  {tier.name}
                </h3>
                <p className="text-gray-400 text-sm">{!tier.popular && tier.label}</p>
              </div>

              <div className="text-center mb-6">
                <p className="font-heading text-5xl text-white mb-2 tracking-heading">
                  ₨{tier.price}
                </p>
                <p className="text-gray-400">
                  {tier.patties} {tier.patties === 1 ? "Patty" : "Patties"}
                </p>
                <p className="text-meathead-red font-bold text-sm mt-2">
                  ₨{tier.perPatty} per patty
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={orderData.isSoldOut ? scrollToPriorityList : () => handleOrder(tier)}
                className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                  orderData.isSoldOut
                    ? "bg-gray-600 hover:bg-gray-700 text-white cursor-pointer"
                    : tier.popular
                    ? "bg-meathead-red hover:bg-red-700 text-white"
                    : "bg-meathead-charcoal hover:bg-meathead-black text-white border border-meathead-red/30"
                }`}
              >
                {orderData.isSoldOut ? "SOLD OUT - JOIN LIST" : "ORDER NOW"}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-meathead-black/50 backdrop-blur-sm border border-meathead-red/20 rounded-xl p-8 max-w-3xl mx-auto">
            <h3 className="font-heading text-2xl text-white mb-4 uppercase tracking-heading">
              DELIVERY INFO
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-400 mb-1">AREAS</p>
                <p className="text-white font-bold">Bahria 7, 8 | DHA 1, 2, 4</p>
                <p className="text-gray-500 text-xs mt-1">Freshness requires tight radius</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">TIMING</p>
                <p className="text-white font-bold">Friday 6-8 PM</p>
                <p className="text-gray-500 text-xs mt-1">No exceptions</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">PAYMENT</p>
                <p className="text-white font-bold">Both on Delivery</p>
                <p className="text-gray-500 text-xs mt-1">Digital preferred</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
