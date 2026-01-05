"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OrderData {
  totalOrders: number;
  pattiesUsed: number;
  pattiesRemaining: number;
  isSoldOut: boolean;
  totalPatties: number;
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
      const response = await fetch("/api/get-order-count");
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.warn("API returned error. This is normal in dev if GOOGLE_SHEET environment variables are missing.");
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setOrderData(data);
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
