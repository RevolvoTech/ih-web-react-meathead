import StatusBar from "@/components/StatusBar";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import Comparison from "@/components/Comparison";
import Protocol from "@/components/Protocol";
import WhyMeathead from "@/components/WhyMeathead";
import MeatheadMath from "@/components/MeatheadMath";
import CookingGuide from "@/components/CookingGuide";
import FoundersNote from "@/components/FoundersNote";
import BulkPricing from "@/components/BulkPricing";
import OrderCTA from "@/components/OrderCTA";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen">
      <StatusBar />
      <Hero />
      <ProductShowcase />
      <Comparison />
      <Protocol />
      <WhyMeathead />
      <MeatheadMath />
      <CookingGuide />
      <FoundersNote />
      <BulkPricing />
      <OrderCTA />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
