"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function PriorityListForm() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Format number to 92XXXXXXXXXX
    const formattedNumber = whatsappNumber.replace(/\D/g, "");
    const finalNumber = formattedNumber.startsWith("92")
      ? formattedNumber
      : formattedNumber.startsWith("0")
      ? "92" + formattedNumber.substring(1)
      : "92" + formattedNumber;

    try {
      const response = await fetch("/api/submit-priority-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: finalNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "You're on the priority list for Batch 02!" });
        setWhatsappNumber("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red rounded-2xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="inline-block bg-meathead-red text-white font-heading text-sm px-4 py-2 rounded-full mb-4 tracking-heading">
          BATCH 01 - SOLD OUT
        </div>
        <h2 className="font-heading text-4xl md:text-5xl mb-4 uppercase tracking-heading">
          GET PRIORITY ACCESS <span className="text-meathead-red">FOR BATCH 02</span>
        </h2>
        <p className="text-gray-300 text-lg">
          We drop Batch 02 next Friday. People on this list get the link{" "}
          <span className="text-meathead-red font-bold">30 minutes before Instagram.</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="whatsapp" className="block text-gray-400 text-sm mb-2 font-data">
            WHATSAPP NUMBER
          </label>
          <input
            type="tel"
            id="whatsapp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="03XX XXXXXXX"
            className="w-full bg-meathead-black border-2 border-meathead-red/30 focus:border-meathead-red rounded-lg px-4 py-3 text-white text-lg font-data outline-none transition-all"
            required
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-meathead-red hover:bg-red-700 disabled:bg-gray-600 text-white font-heading text-xl py-4 rounded-lg transition-all duration-300 uppercase tracking-heading"
        >
          {isSubmitting ? "SUBMITTING..." : "JOIN PRIORITY LIST"}
        </motion.button>
      </form>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-lg text-center ${
            message.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <p className="text-gray-500 text-sm mt-8 text-center italic">
        By joining, you agree to receive order notifications via WhatsApp for Batch 02.
      </p>
    </motion.div>
  );
}
