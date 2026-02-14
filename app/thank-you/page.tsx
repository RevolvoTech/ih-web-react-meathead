"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [totalWaitlist, setTotalWaitlist] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState<string>("");
  const area = searchParams.get("area") || "your area";
  const name = searchParams.get("name") || "there";
  const phone = searchParams.get("phone") || "";

  // Generate deterministic referral code from phone number
  const generateReferralCode = (phoneNumber: string): string => {
    if (!phoneNumber) return "MEATHEAD001";

    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, "");

    // Take last 4 digits of phone number
    const last4 = digits.slice(-4);

    // Create code: MEAT + last 4 digits
    return `MEAT${last4}`;
  };

  useEffect(() => {
    // Generate referral code
    const code = generateReferralCode(phone);
    setReferralCode(code);

    // Fetch waitlist count
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch("/api/get-launch-waitlist-count");
        const data = await response.json();
        if (data.count) {
          setTotalWaitlist(data.count);
          // If position was passed via URL
          const position = searchParams.get("position");
          if (position) {
            setWaitlistPosition(parseInt(position));
          } else {
            setWaitlistPosition(data.count);
          }
        }
      } catch (error) {
        console.error("Failed to fetch waitlist count:", error);
      }
    };

    fetchWaitlistCount();

    // Conversion tracking (ready for Google Analytics/Facebook Pixel)
    if (typeof window !== "undefined") {
      // Google Analytics Event (if GA is set up)
      if (window.gtag) {
        window.gtag("event", "conversion", {
          event_category: "Waitlist",
          event_label: "Launch Waitlist Signup",
          value: 1,
        });
      }

      // Facebook Pixel Event (if FB Pixel is set up)
      if (window.fbq) {
        window.fbq("track", "Lead", {
          content_name: "Launch Waitlist",
          content_category: "Signup",
        });
      }
    }
  }, [searchParams]);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://meathead.pk";

  const shareMessage = `Just joined the MEATHEAD waitlist!\n\nPremium beef patties with 24g+ protein - better than protein powder!\n\nDitch the supplements, get real food protein.\n\nJoin the waitlist: ${shareUrl}`;

  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have direct share API, so we'll copy to clipboard and prompt user
    navigator.clipboard.writeText(shareMessage);
    alert("Message copied! Open Instagram and paste in your story or post 📸");
  };

  return (
    <main className="min-h-screen bg-meathead-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-meathead-charcoal via-meathead-black to-meathead-charcoal opacity-50" />
      <div className="absolute inset-0 bg-[url('/images/patty.webp')] bg-cover bg-center opacity-5" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-2xl shadow-green-500/50">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-heading text-5xl md:text-7xl mb-4 uppercase tracking-heading"
          >
            YOU'RE <span className="text-meathead-red">IN!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300 text-xl md:text-2xl mb-2"
          >
            Welcome to MEATHEAD, {name}! 💪
          </motion.p>
        </motion.div>

        {/* Waitlist Position Card */}
        {waitlistPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-meathead-red/20 to-meathead-red/5 border-2 border-meathead-red rounded-2xl p-8 mb-8 text-center"
          >
            <div className="text-gray-400 text-sm uppercase tracking-wider mb-2 font-data">
              Your Waitlist Position
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", bounce: 0.6 }}
              className="font-heading text-7xl md:text-9xl text-meathead-red mb-2"
            >
              #{waitlistPosition}
            </motion.div>
            <div className="text-gray-300 text-lg">
              Out of {totalWaitlist} total gym bros on the waitlist
            </div>
            <div className="mt-4 text-yellow-400 font-bold">
              🔥 You'll get priority access when we launch in {area}!
            </div>
          </motion.div>
        )}

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red/30 rounded-2xl p-8 mb-8"
        >
          <h2 className="font-heading text-3xl md:text-4xl mb-6 uppercase tracking-heading text-center">
            WHAT'S <span className="text-meathead-red">NEXT?</span>
          </h2>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-meathead-red rounded-full flex items-center justify-center text-white font-heading text-xl">
                1
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">We'll WhatsApp You</h3>
                <p className="text-gray-400">
                  Get instant notification on WhatsApp when we launch in {area}. No spam, just the good stuff.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-meathead-red rounded-full flex items-center justify-center text-white font-heading text-xl">
                2
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Launch Timeline</h3>
                <p className="text-gray-400 mb-3">
                  We launch when we hit <span className="text-meathead-red font-bold">1,000+ waitlist signups</span>!
                  Want us to launch faster? Share with your gym buddies!
                </p>
                {totalWaitlist && (
                  <div className="bg-meathead-charcoal/50 rounded-lg p-3 border border-meathead-red/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm font-data">CURRENT PROGRESS</span>
                      <span className="text-meathead-red font-bold font-data">{totalWaitlist}/1000</span>
                    </div>
                    <div className="w-full bg-meathead-black rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(totalWaitlist / 1000) * 100}%` }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="bg-gradient-to-r from-meathead-red to-red-600 h-full rounded-full"
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-2 text-center">
                      {1000 - totalWaitlist} more signups until launch! 🚀
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-meathead-red rounded-full flex items-center justify-center text-white font-heading text-xl">
                3
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">First to Order</h3>
                <p className="text-gray-400">
                  As a waitlist member, you'll have <span className="text-meathead-red font-bold">24-hour early access</span> before we open to the public!
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Share with Friends */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-green-900/20 to-green-900/5 border-2 border-green-500/30 rounded-2xl p-8 mb-8"
        >
          <h2 className="font-heading text-3xl md:text-4xl mb-4 uppercase tracking-heading text-center">
            SHARE WITH <span className="text-green-400">GYM BUDDIES</span>
          </h2>
          <p className="text-gray-300 text-center mb-6">
            Help your gym bros ditch the protein powder! Share MEATHEAD and build the movement 💪
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Share on WhatsApp
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstagramShare}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Share on Instagram
            </motion.button>
          </div>
        </motion.div>

        {/* Follow on Instagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red/30 rounded-2xl p-8 mb-8 text-center"
        >
          <h2 className="font-heading text-3xl md:text-4xl mb-4 uppercase tracking-heading">
            FOLLOW US ON <span className="text-meathead-red">INSTAGRAM</span>
          </h2>
          <p className="text-gray-300 mb-6">
            Get exclusive launch updates, nutrition tips, gym meal ideas, and behind-the-scenes content!
          </p>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://instagram.com/meathead.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 px-12 rounded-lg transition-all shadow-lg hover:shadow-purple-500/50 text-lg"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow @meathead.pk
          </motion.a>

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Join our growing community of gym enthusiasts!</span>
          </div>
        </motion.div>

        {/* Referral Bonus */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-br from-meathead-red/20 to-meathead-red/5 border-2 border-meathead-red/50 rounded-2xl p-8 mb-8 text-center"
        >
          <div className="text-5xl mb-3">💪</div>
          <h2 className="font-heading text-3xl md:text-4xl mb-4 uppercase tracking-heading">
            REFER & <span className="text-meathead-red">EARN</span>
          </h2>
          <div className="bg-meathead-red/20 border-2 border-meathead-red rounded-lg p-6 mb-6 inline-block">
            <p className="text-5xl md:text-6xl font-heading text-meathead-red mb-2">25% OFF</p>
            <p className="text-gray-300 text-lg">YOUR FIRST ORDER</p>
          </div>
          <p className="text-gray-300 text-lg mb-6">
            Share your referral link with 3 gym buddies. When they join the waitlist, you get <span className="text-meathead-red font-bold">25% OFF</span> your first order!
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-meathead-charcoal/80 border-2 border-meathead-red/30 rounded-lg p-6 max-w-md mx-auto cursor-pointer hover:border-meathead-red transition-all"
            onClick={() => {
              const refUrl = `https://meatheadpakistan.vercel.app?ref=${referralCode}`;
              navigator.clipboard.writeText(refUrl);
              alert("Link copied! Share with 3 gym buddies to unlock 25% OFF");
            }}
          >
            <p className="text-gray-400 text-sm mb-3 uppercase tracking-wider font-data text-center">
              Your Referral Link
            </p>
            <div className="bg-meathead-black border-2 border-meathead-red/50 rounded-lg p-4 mb-3">
              <p className="text-meathead-red font-mono text-xs md:text-sm break-all text-center">
                https://meatheadpakistan.vercel.app?ref={referralCode}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="font-bold">Click to Copy Link</span>
            </div>
          </motion.div>
          <p className="text-gray-500 text-sm mt-6 italic">
            Track your referrals - when 3 friends join with your code, we'll WhatsApp you the discount!
          </p>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-block bg-meathead-charcoal hover:bg-meathead-gray border-2 border-meathead-red/30 hover:border-meathead-red text-white font-bold py-4 px-8 rounded-lg transition-all"
          >
            ← Back to Home
          </Link>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-gray-500 text-sm text-center mt-12 italic"
        >
          Questions? We're here to help! DM us on Instagram @meathead.pk
        </motion.p>
      </div>

      {/* Confetti Effect (Optional - can be removed if too much) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)`
        }}
      />
    </main>
  );
}

// Type declarations for tracking scripts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}
