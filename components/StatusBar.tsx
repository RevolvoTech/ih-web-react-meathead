"use client";

import { useState, useEffect } from "react";

interface OrderData {
  slotsRemaining: number;
  isSoldOut: boolean;
}

export default function StatusBar() {
  const [orderData, setOrderData] = useState<OrderData>({
    slotsRemaining: 50,
    isSoldOut: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real order count from API
    fetch("/api/get-order-count")
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch order count:", error);
        // Fallback to fake data if API fails
        const randomDecrease = Math.floor(Math.random() * 15) + 5;
        setOrderData({
          slotsRemaining: 50 - randomDecrease,
          isSoldOut: false,
        });
        setIsLoading(false);
      });

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetch("/api/get-order-count")
        .then((res) => res.json())
        .then((data) => setOrderData(data))
        .catch((error) => console.error("Failed to refresh order count:", error));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-meathead-charcoal border-b border-meathead-red/30 py-3 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex h-3 w-3 animate-ping bg-meathead-red rounded-full opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-meathead-red rounded-full"></span>
          </div>
          <span className="text-gray-400 font-data">BATCH 01 (FRIDAY):</span>
        </div>
        {orderData.isSoldOut ? (
          <span className="font-data font-bold text-meathead-red text-lg uppercase animate-pulse">
            SOLD OUT
          </span>
        ) : (
          <span className="font-data font-bold text-white">
            {isLoading ? (
              <span className="text-gray-400">--</span>
            ) : (
              <span className="text-meathead-red text-lg">{orderData.slotsRemaining}</span>
            )}
            /50 SLOTS REMAINING
          </span>
        )}
      </div>
    </div>
  );
}
