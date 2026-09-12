const API_BASE = (process.env.NEXT_PUBLIC_MEATHEAD_API_URL ?? "https://api.revolvo.tech/meathead").replace(/\/$/, "");

export class MeatheadApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "MeatheadApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  const payload = await response.json().catch(() => null) as {
    data?: T;
    error?: { code?: string; message?: string };
  } | null;

  if (!response.ok) {
    throw new MeatheadApiError(
      payload?.error?.message ?? "The Meathead API could not complete this request.",
      response.status,
      payload?.error?.code,
    );
  }

  return (payload?.data ?? payload) as T;
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_DISPATCH"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "CANCELLED";

export type DeliveryStopStatus = "PENDING" | "ARRIVED" | "DELIVERED" | "FAILED" | "SKIPPED";

export interface AdminDashboard {
  statusCounts: Array<{ status: OrderStatus; _count: { _all: number } }>;
  activeRuns: number;
  inventory: { totalQuantity: number | null; reservedQuantity: number | null; soldQuantity: number | null };
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  totalAmountPaisa: number;
  placedAt: string;
  items: Array<{ id: string; productName: string; quantity: number }>;
}

export interface AnalyticsSummary {
  deliveredOrders: number;
  deliveredSalesPaisa: number;
  collectedRevenuePaisa: number;
  outstandingRevenuePaisa: number;
  expenseTotalPaisa: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
  operatingContributionPaisa: number;
}

export type ExpenseCategory = "MEAT" | "PACKAGING" | "RIDER_FUEL";

export interface Expense {
  id: string;
  category: ExpenseCategory | "OTHER";
  amountPaisa: number;
  incurredAt: string;
  vendor: string | null;
  note: string | null;
  createdBy?: { displayName: string };
}

export interface DeliveryStop {
  id: string;
  sequence: number;
  status: DeliveryStopStatus;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryNotes: string | null;
    latitude: string | number;
    longitude: string | number;
    paymentMethod: "COD" | "ONLINE";
    paymentStatus: string;
    totalAmountPaisa: number;
  };
}

export interface DeliveryRun {
  id: string;
  runNumber: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  distanceMeters: number | null;
  durationSeconds: number | null;
  stops: DeliveryStop[];
  rider: { displayName: string; phone: string | null };
}

export interface TrackingOrder {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  deliveryAddress: string;
  placedAt: string;
  deliveredAt: string | null;
  statusEvents: Array<{ toStatus: OrderStatus; createdAt: string }>;
  destination: { latitude: number; longitude: number };
  delivery: {
    runStatus: string;
    stopSequence: number;
    riderLocation: {
      latitude: number;
      longitude: number;
      accuracyMeters: number | null;
      recordedAt: string;
      stale: boolean;
    } | null;
  } | null;
}

export const meatheadApi = {
  adminDashboard: (token: string) => request<AdminDashboard>("/v1/admin/dashboard", {}, token),
  adminOrders: (token: string) => request<OrderSummary[]>("/v1/admin/orders?limit=20", {}, token),
  adminAnalytics: (token: string, from: string, to: string) =>
    request<AnalyticsSummary>(`/v1/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {}, token),
  adminExpenses: (token: string) => request<Expense[]>("/v1/admin/expenses?limit=20", {}, token),
  createExpense: (token: string, input: {
    category: ExpenseCategory;
    amountPaisa: number;
    incurredAt: string;
    vendor?: string;
    note?: string;
  }) => request<Expense>("/v1/admin/expenses", { method: "POST", body: JSON.stringify(input) }, token),
  riderRuns: (token: string) => request<DeliveryRun[]>("/v1/rider/runs?active=true", {}, token),
  startRun: (token: string, runId: string) =>
    request<DeliveryRun>(`/v1/rider/runs/${runId}/start`, { method: "POST" }, token),
  updateStop: (token: string, runId: string, stopId: string, input: {
    status: "ARRIVED" | "DELIVERED";
    cashCollected: boolean;
  }) => request<DeliveryStop>(`/v1/rider/runs/${runId}/stops/${stopId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  }, token),
  recordLocation: (token: string, runId: string, input: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    headingDegrees?: number;
    speedMetersPerSecond?: number;
    recordedAt: string;
  }) => request(`/v1/rider/runs/${runId}/location`, { method: "POST", body: JSON.stringify(input) }, token),
  trackOrder: (orderNumber: string, trackingToken: string) => request<TrackingOrder>(
    `/v1/orders/${encodeURIComponent(orderNumber)}/track`,
    { headers: { "X-Tracking-Token": trackingToken } },
  ),
};
