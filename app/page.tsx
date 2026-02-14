"use client";

import { useEffect } from "react";
import StatusBar from "@/components/StatusBar";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import Comparison from "@/components/Comparison";
import Protocol from "@/components/Protocol";
import WhyMeathead from "@/components/WhyMeathead";
import MeatheadMath from "@/components/MeatheadMath";
import CookingGuide from "@/components/CookingGuide";
import FoundersNote from "@/components/FoundersNote";
import Reviews from "@/components/Reviews";
import BulkPricing from "@/components/BulkPricing";
// import OrderCTA from "@/components/OrderCTA"; // Hidden - will use for actual launch
import LaunchWaitlistForm from "@/components/LaunchWaitlistForm";
import Footer from "@/components/Footer";
// import WhatsAppButton from "@/components/WhatsAppButton"; // Hidden for launch waitlist phase
import MobileNav from "@/components/MobileNav";
import FAQ from "@/components/FAQ";
import StructuredData from "@/components/StructuredData";

export default function Home() {
  // Capture referral code from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get("ref");

      if (refCode) {
        // Store referral code in localStorage
        localStorage.setItem("meathead_referral", refCode);
        console.log("Referral code captured:", refCode);
      }
    }
  }, []);

  return (
    <main className="min-h-screen">
      <StructuredData />
      <StatusBar />
      <div id="hero">
        <Hero />
      </div>
      <div id="showcase">
        <ProductShowcase />
      </div>
      <div id="comparison">
        <Comparison />
      </div>
      <div id="protocol">
        <Protocol />
      </div>
      <div id="why">
        <WhyMeathead />
      </div>
      <div id="math">
        <MeatheadMath />
      </div>
      <div id="cooking">
        <CookingGuide />
      </div>
      <div id="founders">
        <FoundersNote />
      </div>
      <div id="reviews">
        <Reviews />
      </div>
      <div id="pricing">
        <BulkPricing />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <div id="order">
        <section className="py-20 px-4 bg-meathead-charcoal relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-meathead-red/10 via-transparent to-meathead-red/10" />
          <div className="relative z-10">
            <LaunchWaitlistForm />
          </div>
        </section>
      </div>
      <Footer />
      {/* <WhatsAppButton /> */}
      <MobileNav />
    </main>
  );
}
