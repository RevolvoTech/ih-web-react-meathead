"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AREAS = [
  // Islamabad
  { value: "Bahria Town Islamabad", label: "ISLAMABAD - Bahria Town" },
  { value: "DHA Islamabad", label: "ISLAMABAD - DHA" },
  { value: "F-6", label: "ISLAMABAD - F-6" },
  { value: "F-7", label: "ISLAMABAD - F-7" },
  { value: "F-8", label: "ISLAMABAD - F-8" },
  { value: "F-10", label: "ISLAMABAD - F-10" },
  { value: "F-11", label: "ISLAMABAD - F-11" },
  { value: "G-6", label: "ISLAMABAD - G-6" },
  { value: "G-7", label: "ISLAMABAD - G-7" },
  { value: "G-8", label: "ISLAMABAD - G-8" },
  { value: "G-9", label: "ISLAMABAD - G-9" },
  { value: "G-10", label: "ISLAMABAD - G-10" },
  { value: "G-11", label: "ISLAMABAD - G-11" },
  { value: "G-13", label: "ISLAMABAD - G-13" },
  { value: "E-7", label: "ISLAMABAD - E-7" },
  { value: "E-11", label: "ISLAMABAD - E-11" },
  { value: "H-8", label: "ISLAMABAD - H-8" },
  { value: "H-9", label: "ISLAMABAD - H-9" },
  { value: "I-8", label: "ISLAMABAD - I-8" },
  { value: "I-9", label: "ISLAMABAD - I-9" },
  { value: "I-10", label: "ISLAMABAD - I-10" },
  { value: "I-11", label: "ISLAMABAD - I-11" },
  { value: "Blue Area", label: "ISLAMABAD - Blue Area" },
  { value: "Gulberg Greens", label: "ISLAMABAD - Gulberg Greens" },
  // Rawalpindi
  { value: "Bahria Town Rawalpindi", label: "RAWALPINDI - Bahria Town" },
  { value: "DHA Rawalpindi", label: "RAWALPINDI - DHA Phase 1-2" },
  { value: "Satellite Town", label: "RAWALPINDI - Satellite Town" },
  { value: "Askari", label: "RAWALPINDI - Askari" },
  { value: "PWD", label: "RAWALPINDI - PWD" },
  { value: "Saddar", label: "RAWALPINDI - Saddar" },
  { value: "Commercial Market", label: "RAWALPINDI - Commercial Market" },
  { value: "Westridge", label: "RAWALPINDI - Westridge" },
  { value: "Chaklala Scheme", label: "RAWALPINDI - Chaklala Scheme" },
  { value: "CBR Town", label: "RAWALPINDI - CBR Town" },
  // Catch-all
  { value: "Other", label: "Other" },
];

interface RecentEntry {
  name: string;
  timestamp: string;
}

export default function LaunchWaitlistForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    area: "F-7",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);

  // Fetch recent entries on component mount
  useEffect(() => {
    fetchRecentEntries();
    // Poll every 30 seconds to show new registrations
    const interval = setInterval(fetchRecentEntries, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecentEntries = async () => {
    try {
      const response = await fetch("/api/get-recent-waitlist");
      const data = await response.json();
      if (data.recentEntries) {
        setRecentEntries(data.recentEntries);
      }
    } catch (error) {
      console.error("Failed to fetch recent entries:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Get referral code from localStorage
    const referralCode = typeof window !== "undefined"
      ? localStorage.getItem("meathead_referral") || ""
      : "";

    try {
      const response = await fetch("/api/submit-launch-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          whatsapp_number: formData.phone,
          customer_name: formData.name || "Not provided",
          area: formData.area,
          status: "launch_waitlist",
          referral_code: referralCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to thank you page with user info
        const queryParams = new URLSearchParams({
          area: formData.area,
          name: formData.name || "there",
          phone: formData.phone,
          position: data.waitlistCount?.toString() || "0",
          duplicate: data.isDuplicate ? "true" : "false",
        });
        router.push(`/thank-you?${queryParams.toString()}`);
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
      className="max-w-xl mx-auto bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red rounded-2xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="inline-block bg-meathead-red text-white font-heading text-sm px-4 py-2 rounded-full mb-4 tracking-heading animate-pulse">
          LAUNCHING SOON
        </div>
        <h2 className="font-heading text-4xl md:text-5xl mb-4 uppercase tracking-heading">
          COMING TO <span className="text-meathead-red">TWIN CITY</span>
        </h2>
        <p className="text-gray-300 text-lg">
          Be the first to know when we launch in Islamabad/Rawalpindi.
          <br />
          <span className="text-meathead-red font-bold">Instant WhatsApp notifications.</span>
        </p>
      </div>

      {/* Recent Registrations Feed */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="mb-6 bg-meathead-charcoal/50 border border-meathead-red/30 rounded-lg p-4 max-h-48 overflow-y-auto"
      >
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-data">
          🔥 Recent Sign-ups
        </div>

        {recentEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6"
          >
            <div className="text-meathead-red font-heading text-lg mb-2">
              BE THE FIRST ON THIS LIST
            </div>
            <p className="text-gray-500 text-sm">
              Join the waitlist and see your name here!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {recentEntries.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={`${entry.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-2 h-2 bg-meathead-red rounded-full animate-pulse" />
                  <span className="text-white font-medium">{entry.name}</span>
                  <span className="text-gray-500">has registered</span>
                  <span className="text-gray-600 text-xs ml-auto">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
            WhatsApp Number *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            pattern="^(\+92[0-9]{10}|0[0-9]{10})$"
            className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-4 text-white text-lg focus:border-meathead-red outline-none transition-colors"
            placeholder="+923XXXXXXXXX or 03XXXXXXXXX"
          />
          <p className="text-gray-500 text-xs mt-2">
            Format: +923XXXXXXXXX (13 digits) or 03XXXXXXXXX (11 digits)
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
            Name (Optional)
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-4 text-white text-lg focus:border-meathead-red outline-none transition-colors"
            placeholder="Your name (helps us personalize messages)"
          />
        </div>

        <div>
          <label htmlFor="area" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
            Your Area *
          </label>
          <select
            id="area"
            required
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-4 text-white text-lg focus:border-meathead-red outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
          >
            {AREAS.map((area) => (
              <option key={area.value} value={area.value} className="bg-meathead-charcoal text-white">
                {area.label}
              </option>
            ))}
          </select>
          <p className="text-gray-500 text-xs mt-2">
            We'll notify you when we launch in your area
          </p>
        </div>

        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            y: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.08 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.92 }}
            animate={{
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 5px 25px rgba(239, 68, 68, 0.4)",
                "0 8px 35px rgba(239, 68, 68, 0.7)",
                "0 5px 25px rgba(239, 68, 68, 0.4)",
              ],
            }}
            transition={{
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              boxShadow: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="w-full bg-meathead-red hover:bg-red-700 disabled:bg-gray-600 text-white font-heading text-2xl py-5 rounded-lg transition-all duration-300 uppercase tracking-heading shadow-xl hover:shadow-meathead-red/50 relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isSubmitting && (
                <svg
                  className="animate-spin h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isSubmitting ? "JOINING..." : "NOTIFY ME ON LAUNCH"}
            </span>
            {!isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-200%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 0.5,
                }}
              />
            )}
          </motion.button>
        </motion.div>
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
        Zero spam. Just a heads up when we're ready to deliver premium beef to your door.
      </p>
    </motion.div>
  );
}
