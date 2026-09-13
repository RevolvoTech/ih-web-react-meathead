export type ExpenseCategory =
  | "MEAT"
  | "SEASONING"
  | "PACKAGING"
  | "RIDER_FUEL"
  | "RIDER_OPERATIONS"
  | "LABOR"
  | "RENT"
  | "UTILITIES"
  | "HYGIENE_CLEANING"
  | "MAINTENANCE"
  | "MARKETING"
  | "COMPLIANCE_ADMIN"
  | "EQUIPMENT_SETUP"
  | "WASTE_REFUNDS"
  | "OTHER";

export type CostBasis = "PER_PATTY" | "PER_ORDER" | "PER_DELIVERY" | "MONTHLY_FIXED" | "STARTUP_ONE_TIME";

export interface AnalyticsSummary {
  deliveredOrders: number;
  deliveredPatties: number;
  deliveredSalesPaisa: number;
  collectedRevenuePaisa: number;
  outstandingRevenuePaisa: number;
  expenseTotalPaisa: number;
  expensesByCategory: Partial<Record<ExpenseCategory, number>>;
  operatingContributionPaisa: number;
  standardVariablePaisa: number;
  actualVariableSpendPaisa: number;
  variableSpendVariancePaisa: number;
  standardFixedPaisa: number;
  standardOperatingCostPaisa: number;
  standardOperatingProfitPaisa: number;
}

export interface StandardCostItem {
  key: string;
  name: string;
  category: ExpenseCategory;
  basis: CostBasis;
  amountPaisa: number;
  enabled: boolean;
  note: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  sortOrder: number;
  updatedAt: string;
}

export interface StandardCostModel {
  items: StandardCostItem[];
  summary: {
    perPattyPaisa: number;
    perOrderPaisa: number;
    perDeliveryPaisa: number;
    monthlyFixedPaisa: number;
    startupOneTimePaisa: number;
  };
  deliveryFeePaisa: number;
  products: Array<{
    id: string;
    sku: string;
    name: string;
    unitPricePaisa: number;
    inventoryUnitsPerItem: number;
    deliveredRevenuePaisa: number;
    variableCostPaisa: number;
    contributionPaisa: number;
    contributionMarginPercent: number;
    breakEvenOrdersPerMonth: number | null;
  }>;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amountPaisa: number;
  incurredAt: string;
  vendor: string | null;
  note: string | null;
  createdBy?: { displayName: string };
}
