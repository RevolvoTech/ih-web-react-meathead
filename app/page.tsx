"use client";

import { useEffect } from "react";
import Link from "next/link";
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
      const refCode = (params.get("ref") || params.get("") || "").trim().toUpperCase();

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
      <section className="bg-meathead-black border-b border-meathead-red/20 px-4 py-5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-heading mb-2">
            Halal High-Protein Beef Patties in Twin Cities
          </h2>
          <p className="text-gray-300 text-sm md:text-base">
            MEATHEAD delivers premium halal beef patties in Islamabad and
            Rawalpindi for meal prep, smash burgers, and protein-focused diets.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              href="/beef-patties-islamabad/"
              className="text-meathead-red hover:text-red-300"
            >
              Beef Patties Islamabad
            </Link>
            <Link
              href="/beef-patties-rawalpindi/"
              className="text-meathead-red hover:text-red-300"
            >
              Beef Patties Rawalpindi
            </Link>
          </div>
        </div>
      </section>
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
