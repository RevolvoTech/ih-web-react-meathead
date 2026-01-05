"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const DELIVERY_CHARGE = 100;

const packages = [
  { name: "SINGLE", qty: 1, price: 350 },
  { name: "WEEKLY FUEL", qty: 4, price: 1200 },
  { name: "BULK PREP", qty: 12, price: 3300 },
];

export default function PriorityListForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    package: "WEEKLY FUEL",
    address: "",
    addon: "Original",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize map when coords are set
  useEffect(() => {
    if (!showMap || !mapCoords || !mapContainerRef.current) return;
    if (typeof window === 'undefined') return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
      }).setView([mapCoords.lat, mapCoords.lng], 17);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const redIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([mapCoords.lat, mapCoords.lng], {
        draggable: true,
        icon: redIcon,
      }).addTo(map);
      markerRef.current = marker;

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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, mapCoords?.lat, mapCoords?.lng]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate GPS location is captured
    if (!formData.location) {
      alert("Please allow location access to continue. We need your GPS coordinates for accurate delivery.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const selectedPkg = packages.find(p => p.name === formData.package);

      const response = await fetch("/.netlify/functions/submit-priority-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          whatsapp_number: formData.phone,
          order_type: formData.package,
          quantity: selectedPkg?.qty,
          batch_number: "BATCH 02",
          status: "priority_list",
          customer_name: formData.name,
          delivery_address: formData.address,
          location: formData.location,
          total_amount: selectedPkg ? selectedPkg.price + DELIVERY_CHARGE : 0,
          addon: formData.addon,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "You're on the priority list for Batch 02!" });
        setFormData({
          name: "",
          phone: "",
          package: "WEEKLY FUEL",
          address: "",
          addon: "Original",
          location: "",
        });
        setShowMap(false);
        setMapCoords(null);
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
                addon: newPackage === "SINGLE" && formData.addon === "Hybrid" ? "Original" : formData.addon
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
            {packages.map((pkg) => (
              <option key={pkg.name} value={pkg.name} className="bg-meathead-charcoal text-white">
                {pkg.name} - {pkg.qty} {pkg.qty === 1 ? 'patty' : 'patties'} (₨{pkg.price + DELIVERY_CHARGE})
              </option>
            ))}
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
            {formData.package === "WEEKLY FUEL" && (
              <option value="Hybrid" className="bg-meathead-charcoal text-white">Hybrid (2 Sea Salt / 2 Spiced)</option>
            )}
            {formData.package === "BULK PREP" && (
              <option value="Hybrid" className="bg-meathead-charcoal text-white">Hybrid (6 Sea Salt / 6 Spiced)</option>
            )}
          </select>
          <p className="text-gray-500 text-xs mt-2">
            {formData.package === "SINGLE"
              ? "Hybrid only available for packs of 4 and 12"
              : formData.addon === "Original"
              ? "No seasoning (Just the beef)."
              : formData.addon === "Sea Salt"
              ? "Precision mineral finish."
              : formData.addon === "Spiced"
              ? "Our custom spice blend finish."
              : formData.addon === "Hybrid"
              ? formData.package === "WEEKLY FUEL"
                ? "The Hybrid: 2 Sea Salt / 2 Spiced."
                : "The Hybrid: 6 Sea Salt / 6 Spiced."
              : "Choose your seasoning preference"}
          </p>
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
            placeholder="House/Apt, Street, Area, City"
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

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
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
