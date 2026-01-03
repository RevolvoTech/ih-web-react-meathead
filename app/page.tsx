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
import OrderCTA from "@/components/OrderCTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileNav from "@/components/MobileNav";

export default function Home() {
  return (
    <main className="min-h-screen">
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
      <OrderCTA />
      <Footer />
      <WhatsAppButton />
      <MobileNav />
    </main>
  );
}
