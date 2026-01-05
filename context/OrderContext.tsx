"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OrderData {
  totalOrders: number;
  slotsRemaining: number;
  isSoldOut: boolean;
  totalSlots: number;
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
    slotsRemaining: 50,
    isSoldOut: false,
    totalSlots: 50,
  });
  const [isLoading, setIsLoading] = useState(true);

  const markAsSoldOut = () => {
    setOrderData(prev => ({
      ...prev,
      isSoldOut: true,
      slotsRemaining: 0,
    }));
  };

  const fetchOrderCount = async () => {
    try {
      const response = await fetch("/api/get-order-count");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
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
