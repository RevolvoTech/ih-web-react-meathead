import { getSupabaseAccessToken } from "@/lib/supabase-browser";
import type { AnalyticsSummary, Expense, ExpenseCategory, StandardCostItem, StandardCostModel } from "@/lib/cost-model-types";

export type { AnalyticsSummary, CostBasis, Expense, ExpenseCategory, StandardCostItem, StandardCostModel } from "@/lib/cost-model-types";

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
  async function send(forceRefresh = false): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    if (token) {
      const currentToken = await getSupabaseAccessToken(token, forceRefresh);
      if (currentToken) headers.set("Authorization", `Bearer ${currentToken}`);
    }
    return fetch(`${API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  }

  let response = await send();
  // A foregrounded WebView can race its first request against Supabase's
  // automatic refresh. Refresh once and replay that request transparently.
  if (token && response.status === 401) response = await send(true);

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
export type UserRole = "ADMIN" | "CHEF" | "DISPATCHER" | "RIDER";

export interface OperationsProfile {
  id: string;
  role: UserRole;
  displayName: string;
}

export interface StoreConfig {
  currency: "PKR";
  deliveryFeePaisa: number;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  unit: "PACK";
  unitPricePaisa: number;
  inventoryUnitsPerItem: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  deliveryNotes?: string;
  paymentMethod: "COD";
  items: Array<{ productId: string; quantity: number }>;
}

export interface CreatedOrder {
  orderNumber: string;
  status: OrderStatus;
  totalAmountPaisa: number;
  trackingLink: string;
}

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

export interface InventoryBatch {
  id: string;
  code: string;
  totalQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  status: "DRAFT" | "ACTIVE" | "CLOSED";
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unitWeightGrams: number;
  lowStockThreshold: number | null;
  products: Array<{
    id: string;
    sku: string;
    name: string;
    inventoryUnitsPerItem: number;
    active: boolean;
  }>;
  batches: InventoryBatch[];
}

export type SubscriptionPlan = "DAILY_2" | "DAILY_4";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "OVERDUE" | "CANCELLED";
export type SubscriptionPaymentMethod = "CASH" | "BANK_TRANSFER" | "EASYPAISA" | "JAZZCASH" | "OTHER";

export interface SubscriptionPayment {
  id: string;
  amountPaisa: number;
  method: SubscriptionPaymentMethod;
  status: "PAID" | "REFUNDED";
  reference: string | null;
  periodStart: string;
  periodEnd: string;
  receivedAt: string;
}

export interface SubscriptionSkip {
  id: string;
  serviceDate: string;
  note: string | null;
}

export interface Subscription {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  dailyPattyQuantity: 2 | 4;
  monthlyPricePaisa: number;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  deliveryAddress: string;
  area: string | null;
  latitude: string | number;
  longitude: string | number;
  deliveryWindow: string;
  deliveryNotes: string | null;
  payments: SubscriptionPayment[];
  skips: SubscriptionSkip[];
}

export interface SubscriptionOverview {
  date: string;
  activeSubscribers: number;
  pausedSubscribers: number;
  overdueSubscribers: number;
  monthlyRecurringRevenuePaisa: number;
  collectedThisMonthPaisa: number;
  projectedContributionPaisa: number;
  fulfillmentLiabilityPaisa: number;
  renewalsDueNextSevenDays: number;
  today: {
    patties: number;
    kilograms: number;
    deliveries: number;
    skipped: number;
    generatedOrders: number;
    ungeneratedOrders: number;
    byPlan: { DAILY_2: number; DAILY_4: number };
    byWindow: Array<{ window: string; deliveries: number; patties: number }>;
  };
  inventory: {
    availablePatties: number;
    committedNextSevenDays: number;
    requiredKilogramsNextSevenDays: number;
    daysRemaining: number | null;
  };
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
  storeConfig: () => request<StoreConfig>("/v1/config"),
  catalog: () => request<CatalogProduct[]>("/v1/catalog"),
  createOrder: (input: CreateOrderInput, idempotencyKey: string) => request<CreatedOrder>("/v1/orders", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(input),
  }),
  me: (token: string) => request<OperationsProfile>("/v1/me", {}, token),
  adminDashboard: (token: string) => request<AdminDashboard>("/v1/admin/dashboard", {}, token),
  adminOrders: (token: string) => request<OrderSummary[]>("/v1/admin/orders?limit=20", {}, token),
  adminInventory: (token: string) => request<InventoryItem[]>("/v1/admin/inventory", {}, token),
  createInventoryBatch: (token: string, input: {
    code: string;
    inventoryItemId: string;
    totalQuantity: number;
    status: "ACTIVE" | "DRAFT";
  }) => request<InventoryBatch>("/v1/admin/inventory/batches", {
    method: "POST",
    body: JSON.stringify(input),
  }, token),
  updateInventoryItem: (token: string, inventoryItemId: string, input: { lowStockThreshold: number | null }) =>
    request<InventoryItem>(`/v1/admin/inventory/${inventoryItemId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }, token),
  updateOrderStatus: (token: string, orderId: string, status: OrderStatus) =>
    request<OrderSummary>(`/v1/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),
  adminAnalytics: (token: string, from: string, to: string) =>
    request<AnalyticsSummary>(`/v1/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {}, token),
  adminExpenses: (token: string) => request<Expense[]>("/v1/admin/expenses?limit=20", {}, token),
  adminStandardCosts: (token: string) => request<StandardCostModel>("/v1/admin/standard-costs", {}, token),
  adminSubscriptions: (token: string) => request<Subscription[]>("/v1/admin/subscriptions", {}, token),
  subscriptionOverview: (token: string, date: string) => request<SubscriptionOverview>(
    `/v1/admin/subscriptions/overview?date=${encodeURIComponent(date)}`,
    {},
    token,
  ),
  createSubscription: (token: string, input: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    plan: SubscriptionPlan;
    monthlyPricePaisa?: number;
    startDate: string;
    deliveryAddress: string;
    area?: string;
    latitude: number;
    longitude: number;
    deliveryWindow: string;
    deliveryNotes?: string;
    payment?: { method: SubscriptionPaymentMethod; reference?: string };
  }) => request<Subscription>("/v1/admin/subscriptions", { method: "POST", body: JSON.stringify(input) }, token),
  updateSubscription: (token: string, id: string, input: Partial<{
    status: SubscriptionStatus;
    monthlyPricePaisa: number;
    deliveryWindow: string;
    deliveryNotes: string | null;
  }>) => request<Subscription>(`/v1/admin/subscriptions/${id}`, { method: "PATCH", body: JSON.stringify(input) }, token),
  recordSubscriptionPayment: (token: string, id: string, input: {
    amountPaisa?: number;
    method: SubscriptionPaymentMethod;
    reference?: string;
  }) => request<SubscriptionPayment>(`/v1/admin/subscriptions/${id}/payments`, { method: "POST", body: JSON.stringify(input) }, token),
  addSubscriptionSkip: (token: string, id: string, input: { serviceDate: string; note?: string }) =>
    request<SubscriptionSkip>(`/v1/admin/subscriptions/${id}/skips`, { method: "POST", body: JSON.stringify(input) }, token),
  removeSubscriptionSkip: (token: string, id: string, skipId: string) =>
    request<void>(`/v1/admin/subscriptions/${id}/skips/${skipId}`, { method: "DELETE" }, token),
  generateSubscriptionOrders: (token: string, serviceDate: string) => request<{
    serviceDate: string;
    generated: number;
    failed: Array<{ subscriptionId: string; error: string }>;
  }>("/v1/admin/subscriptions/generate-orders", { method: "POST", body: JSON.stringify({ serviceDate }) }, token),
  updateStandardCost: (token: string, key: string, input: { amountPaisa?: number; enabled?: boolean }) =>
    request<StandardCostItem>(`/v1/admin/standard-costs/${encodeURIComponent(key)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }, token),
  createExpense: (token: string, input: {
    category: ExpenseCategory;
    amountPaisa: number;
    incurredAt: string;
    vendor?: string;
    note?: string;
  }) => request<Expense>("/v1/admin/expenses", { method: "POST", body: JSON.stringify(input) }, token),
  riderPickups: (token: string) => request<OrderSummary[]>("/v1/rider/pickups", {}, token),
  pickupReadyOrders: (token: string) => request<DeliveryRun>("/v1/rider/pickups", { method: "POST" }, token),
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
