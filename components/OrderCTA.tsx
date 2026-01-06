"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useOrder } from "@/context/OrderContext";

const DELIVERY_CHARGE = 100;

const packages = [
  { name: "Little Boy", qty: 1, price: 350 },
  { name: "Double", qty: 2, price: 650 },
  { name: "Big Man", qty: 4, price: 1200 },
];

export default function OrderCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const { orderData, refreshOrderCount, markAsSoldOut, setOrderData } = useOrder();
  // const [orderData, setOrderData] = useState({ isSoldOut: false }); // Removed local state

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    package: "Double",
    address: "",
    addon: "Original",
    location: "",
    area: "DHA",
    phase: "1",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate GPS location is captured
    if (!formData.location) {
      alert("Please allow location access to continue. We need your GPS coordinates for accurate delivery.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const selectedPkg = packages.find(p => p.name === formData.package);

      // Concatenate area, phase, and address for delivery_address
      const fullAddress = `${formData.address}, ${formData.area} Phase ${formData.phase}`;

      const response = await fetch("/api/submit-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          whatsapp_number: formData.phone,
          order_type: formData.package,
          quantity: selectedPkg?.qty,
          batch_number: "BATCH 01",
          status: "pending",
          customer_name: formData.name,
          delivery_address: fullAddress,
          location: formData.location,
          total_amount: selectedPkg ? selectedPkg.price + DELIVERY_CHARGE : 0,
          addon: formData.addon,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.error === 'SOLD_OUT') {
          markAsSoldOut();
          alert("Batch 01 just sold out! You are being redirected to the priority list.");
          return;
        }
        throw new Error(data.error || 'Submission failed');
      }

      setSubmitStatus("success");
      
      // Update with fresh count from the submission response
      if (data.orderCount) {
        setOrderData(data.orderCount);
      }
      
      setFormData({
        name: "",
        phone: "",
        package: "Double",
        address: "",
        addon: "Original",
        location: "",
        area: "DHA",
        phase: "1",
      });
      setShowMap(false);
      setMapCoords(null);

      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Order submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch order count handled by context
  /*
  const fetchOrderCount = async () => {
    try {
      const response = await fetch("/api/get-order-count");
      const data = await response.json();
      setOrderData({ isSoldOut: data.isSoldOut });
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  // Fetch order count to check if sold out
  useEffect(() => {
    fetchOrderCount();
  }, []);
  */

  // Initialize map when coords are set
  useEffect(() => {
    if (!showMap || !mapCoords || !mapContainerRef.current) return;
    if (typeof window === 'undefined') return; // Only run on client side

    // Cleanup existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current) return;

      // Create map without attribution control
      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
      }).setView([mapCoords.lat, mapCoords.lng], 17);
      mapRef.current = map;

      // Add OpenStreetMap tiles (colorful, detailed)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Custom red marker icon
      const redIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      // Add draggable marker
      const marker = L.marker([mapCoords.lat, mapCoords.lng], {
        draggable: true,
        icon: redIcon,
      }).addTo(map);
      markerRef.current = marker;

      // Update coordinates when marker is dragged
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setMapCoords({ lat: position.lat, lng: position.lng });
        setFormData((prev) => ({
          ...prev,
          location: `Lat: ${position.lat.toFixed(7)}, Lng: ${position.lng.toFixed(7)}`
        }));
      });
    };

    initMap();

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, mapCoords?.lat, mapCoords?.lng]);

  const scrollToPriorityList = () => {
    const foundersSection = document.getElementById("founders");
    foundersSection?.scrollIntoView({ behavior: "smooth" });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const locationString = `Lat: ${latitude.toFixed(7)}, Lng: ${longitude.toFixed(7)}`;
          setFormData({ ...formData, location: locationString });
          setMapCoords({ lat: latitude, lng: longitude });
          setShowMap(true);
        } catch (error) {
          console.error("Error getting location:", error);
          const locationString = `Lat: ${latitude.toFixed(7)}, Lng: ${longitude.toFixed(7)}`;
          setFormData({ ...formData, location: locationString });
          setMapCoords({ lat: latitude, lng: longitude });
          setShowMap(true);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to get your location. Please allow location access and ensure GPS is enabled for best accuracy.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  };

  if (orderData.isSoldOut) {
    return (
      <section ref={ref} className="py-20 px-4 bg-meathead-charcoal relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-meathead-red/20 via-transparent to-meathead-red/20 animate-pulse" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-meathead-gray/90 backdrop-blur-sm border-2 border-meathead-red rounded-2xl p-12 md:p-16 relative"
          >
            {/* Humorous SOLD OUT Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block bg-meathead-red text-white font-heading text-sm md:text-base px-6 py-2 rounded-full mb-6 tracking-heading animate-pulse"
            >
              YOU MISSED IT
            </motion.div>

            <h2 className="font-heading text-4xl md:text-6xl mb-4 uppercase tracking-heading">
              BATCH 01 <span className="text-meathead-red">PRE-ORDERS FULL</span>
            </h2>

            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              All 100 patties pre-ordered for Friday's launch.
              <br className="mb-4" />
              Don't miss the next drop. Join the priority list for instant restock alerts.
            </p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              onClick={scrollToPriorityList}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-meathead-red hover:bg-red-700 text-white font-heading py-6 px-12 rounded-lg text-xl md:text-2xl transition-all duration-300 transform shadow-2xl hover:shadow-meathead-red/50 uppercase tracking-heading"
            >
              JOIN PRIORITY LIST
            </motion.button>

            <p className="text-meathead-red text-sm md:text-base mt-6 font-bold font-data">
              Get instant restock alerts + pre-order access <span className="text-white">30 MINUTES BEFORE</span> Instagram
            </p>

            <p className="text-gray-500 text-xs mt-4 italic">
              Never miss a drop again.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20 px-4 bg-meathead-charcoal relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-meathead-red/10 via-transparent to-meathead-red/10" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-meathead-gray/80 backdrop-blur-sm border-2 border-meathead-red rounded-2xl p-8 md:p-12"
        >
          <h2 className="font-heading text-4xl md:text-6xl mb-4 uppercase tracking-heading text-center">
            READY TO <span className="text-meathead-red">PRE-ORDER?</span>
          </h2>

          <p className="text-gray-300 text-lg mb-8 text-center max-w-2xl mx-auto">
            Launching Friday 3pm. Pre-order now. Pure beef. Pure gains. Pure simplicity.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  pattern="^(\+92[0-9]{10}|0[0-9]{10})$"
                  className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors"
                  placeholder="+923XXXXXXXXX or 03XXXXXXXXX"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Format: +923XXXXXXXXX (13 digits) or 03XXXXXXXXX (11 digits)
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="package" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                Package *
              </label>
              <select
                id="package"
                required
                value={formData.package}
                onChange={(e) => {
                  const newPackage = e.target.value;
                  setFormData({
                    ...formData,
                    package: newPackage,
                    addon: newPackage === "Little Boy" && formData.addon === "Hybrid" ? "Original" : formData.addon
                  });
                }}
                className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {packages.map((pkg) => {
                  const isAvailable = orderData.pattiesRemaining >= pkg.qty;
                  return (
                    <option
                      key={pkg.name}
                      value={pkg.name}
                      className="bg-meathead-charcoal text-white"
                      disabled={!isAvailable}
                    >
                      {pkg.name} - {pkg.qty} {pkg.qty === 1 ? 'patty' : 'patties'} (₨{pkg.price + DELIVERY_CHARGE}){!isAvailable ? ' - SOLD OUT' : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-gray-500 text-xs mt-2">
                {(() => {
                  const selectedPkg = packages.find(p => p.name === formData.package);
                  return selectedPkg ? `₨${selectedPkg.price} + ₨${DELIVERY_CHARGE} delivery = ₨${selectedPkg.price + DELIVERY_CHARGE}` : '';
                })()}
              </p>
            </div>

            <div>
              <label htmlFor="addon" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                Add-On
              </label>
              <select
                id="addon"
                required
                value={formData.addon}
                onChange={(e) => setFormData({ ...formData, addon: e.target.value })}
                className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="Original" className="bg-meathead-charcoal text-white">Original</option>
                <option value="Sea Salt" className="bg-meathead-charcoal text-white">Sea Salt</option>
                <option value="Spiced" className="bg-meathead-charcoal text-white">Spiced</option>
                {formData.package === "Double" && (
                  <option value="Hybrid" className="bg-meathead-charcoal text-white">Hybrid (1 Sea Salt / 1 Spiced)</option>
                )}
                {formData.package === "Big Man" && (
                  <option value="Hybrid" className="bg-meathead-charcoal text-white">Hybrid (2 Sea Salt / 2 Spiced)</option>
                )}
              </select>
              <p className="text-gray-500 text-xs mt-2">
                {formData.package === "Little Boy"
                  ? "Hybrid only available for packs of 2 and 4"
                  : formData.addon === "Original"
                  ? "No seasoning (Just the beef)."
                  : formData.addon === "Sea Salt"
                  ? "Precision mineral finish."
                  : formData.addon === "Spiced"
                  ? "Our custom spice blend finish."
                  : formData.addon === "Hybrid"
                  ? formData.package === "Double"
                    ? "The Hybrid: 1 Sea Salt / 1 Spiced."
                    : "The Hybrid: 2 Sea Salt / 2 Spiced."
                  : "Choose your seasoning preference"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="area" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                  Area *
                </label>
                <select
                  id="area"
                  required
                  value={formData.area}
                  onChange={(e) => {
                    const newArea = e.target.value;
                    setFormData({
                      ...formData,
                      area: newArea,
                      phase: newArea === "DHA" ? "1" : "7"
                    });
                  }}
                  className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="DHA" className="bg-meathead-charcoal text-white">DHA</option>
                  <option value="Bahria" className="bg-meathead-charcoal text-white">Bahria Town</option>
                </select>
              </div>

              <div>
                <label htmlFor="phase" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                  Phase *
                </label>
                <select
                  id="phase"
                  required
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ef4444' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  {formData.area === "DHA" ? (
                    <>
                      <option value="1" className="bg-meathead-charcoal text-white">Phase 1</option>
                      <option value="2" className="bg-meathead-charcoal text-white">Phase 2</option>
                    </>
                  ) : (
                    <>
                      <option value="7" className="bg-meathead-charcoal text-white">Phase 7</option>
                      <option value="8" className="bg-meathead-charcoal text-white">Phase 8</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                Delivery Address *
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-meathead-charcoal border-2 border-meathead-red/30 rounded-lg px-4 py-3 text-white focus:border-meathead-red outline-none transition-colors resize-none"
                placeholder="Sector, Street/Lane, House/Apartment"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-data mb-2 uppercase tracking-wider">
                GPS Location (Required for accurate delivery) *
              </label>
              {formData.location ? (
                <div className="space-y-3">
                  {showMap && (
                    <div className="space-y-3">
                      <div
                        ref={mapContainerRef}
                        className="w-full h-80 rounded-lg overflow-hidden border-2 border-meathead-red/30"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs">
                          <span className="text-meathead-red font-bold">Drag the red pin</span> to adjust your exact location
                        </p>
                        <button
                          type="button"
                          onClick={getLocation}
                          disabled={isGettingLocation}
                          className="text-meathead-red hover:text-red-600 text-sm font-data uppercase tracking-wider transition-colors font-bold"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  whileHover={{ scale: isGettingLocation ? 1 : 1.02 }}
                  whileTap={{ scale: isGettingLocation ? 1 : 0.98 }}
                  className="w-full bg-meathead-red hover:bg-red-700 rounded-lg px-6 py-5 text-white transition-all duration-300 shadow-lg hover:shadow-meathead-red/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className={`w-7 h-7 ${isGettingLocation ? 'animate-pulse' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-heading text-xl uppercase tracking-heading">
                      {isGettingLocation ? "Getting Location..." : "Allow Location Access"}
                    </span>
                  </div>
                </motion.button>
              )}
              <p className="text-gray-500 text-xs mt-2">
                {formData.location ? "" : "We need your exact GPS coordinates for precise delivery"}
              </p>
            </div>

            <div className="bg-meathead-black/50 border border-meathead-red/20 rounded-lg p-4">
              <p className="text-gray-400 text-xs leading-relaxed">
                By submitting this pre-order, you consent to us contacting you on WhatsApp for order confirmation and delivery updates for the Friday 3pm launch.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              className={`w-full text-white font-heading text-2xl md:text-3xl py-5 rounded-lg transition-all duration-300 shadow-xl uppercase tracking-heading ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-meathead-red hover:bg-red-700 hover:shadow-meathead-red/50"
              }`}
            >
              {isSubmitting ? "SUBMITTING..." : "PLACE ORDER"}
            </motion.button>

            {submitStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center"
              >
                <p className="text-green-500 font-bold">Order submitted successfully!</p>
                <p className="text-gray-300 text-sm mt-1">We'll contact you shortly on WhatsApp.</p>
              </motion.div>
            )}

            {submitStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center"
              >
                <p className="text-red-500 font-bold">Submission failed. Please try again.</p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
