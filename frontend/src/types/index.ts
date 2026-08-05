export type Role = "OWNER" | "ADMIN" | "STAFF";
export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID";
export type DebtDirection = "RECEIVABLE" | "PAYABLE";
export type Language = "SO" | "EN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  businessId: string;
}

export interface Business {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  currency: string;
  language: Language;
  logoUrl?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: "PRODUCT" | "EXPENSE";
}

export interface Product {
  id: string;
  name: string;
  barcode?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  lowStockThreshold: number;
  unit?: string | null;
  isActive: boolean;
}

export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  note?: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  description?: string | null;
  date: string;
}

export interface Expense {
  id: string;
  categoryId?: string | null;
  category?: Category | null;
  amount: number;
  description?: string | null;
  date: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  saleNumber: number;
  customerId?: string | null;
  customer?: Customer | null;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  note?: string | null;
}

export interface Debt {
  id: string;
  direction: DebtDirection;
  customerId?: string | null;
  customer?: Customer | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  saleId?: string | null;
  originalAmount: number;
  balance: number;
  dueDate?: string | null;
  status: PaymentStatus;
  notes?: string | null;
  payments: Payment[];
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  loss: number;
  cashBalance: number;
  stockOnHand: number;
  stockValue: number;
  lowStockCount: number;
  recentActivity: {
    income: Income[];
    expenses: Expense[];
    sales: Sale[];
  };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
