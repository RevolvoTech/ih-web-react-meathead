"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OrderData {
  totalOrders: number;
  pattiesUsed: number;
  pattiesRemaining: number;
  isSoldOut: boolean;
  totalPatties: number;
  waitlistCount?: number;
}

interface OrderContextType {
  orderData: OrderData;
  isLoading: boolean;
  refreshOrderCount: () => Promise<void>;
  markAsSoldOut: () => void;
  setOrderData: (data: OrderData) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orderData, setOrderData] = useState<OrderData>({
    totalOrders: 0,
    pattiesUsed: 0,
    pattiesRemaining: 100,
    isSoldOut: false,
    totalPatties: 100,
    waitlistCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const markAsSoldOut = () => {
    setOrderData(prev => ({
      ...prev,
      isSoldOut: true,
      pattiesRemaining: 0,
    }));
  };

  const fetchOrderCount = async () => {
    try {
      const [orderResponse, waitlistResponse] = await Promise.all([
        fetch("/api/get-order-count"),
        fetch("/api/get-launch-waitlist-count")
      ]);

      if (!orderResponse.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("API returned error. This is normal in dev if GOOGLE_SHEET environment variables are missing.");
          return;
        }
        throw new Error("Failed to fetch");
      }

      const orderData = await orderResponse.json();
      const waitlistData = waitlistResponse.ok ? await waitlistResponse.json() : { waitlistCount: 0 };

      setOrderData({
        ...orderData,
        waitlistCount: waitlistData.waitlistCount || 0
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Could not fetch order count. Using default values for development.");
        return;
      }
      console.error("Error fetching order count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderCount();
  }, []);

  return (
    <OrderContext.Provider value={{ orderData, isLoading, refreshOrderCount: fetchOrderCount, markAsSoldOut, setOrderData }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
