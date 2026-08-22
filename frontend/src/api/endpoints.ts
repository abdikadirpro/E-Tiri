import { client } from "./client";
import type {
  Business,
  Category,
  Customer,
  DashboardSummary,
  Debt,
  Expense,
  Income,
  Paginated,
  Product,
  Sale,
  StockMovement,
  Supplier,
  User,
} from "../types";

// ---------- auth ----------
export const authApi = {
  signup: (data: { businessName: string; name: string; email: string; password: string; currency?: string }) =>
    client.post<{ user: User; business: Business }>("/auth/signup", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    client.post<{ user: User; business: Business }>("/auth/login", data).then((r) => r.data),
  me: () => client.get<{ user: User; business: Business }>("/auth/me").then((r) => r.data),
  logout: () => client.post("/auth/logout"),
};

// ---------- categories ----------
export const categoriesApi = {
  list: (type?: "PRODUCT" | "EXPENSE") =>
    client.get<Category[]>("/categories", { params: { type } }).then((r) => r.data),
  create: (data: { name: string; type: "PRODUCT" | "EXPENSE" }) =>
    client.post<Category>("/categories", data).then((r) => r.data),
  remove: (id: string) => client.delete(`/categories/${id}`),
};

// ---------- products ----------
export const productsApi = {
  list: (params: { search?: string; categoryId?: string; lowStock?: boolean; page?: number } = {}) =>
    client.get<Paginated<Product>>("/products", { params }).then((r) => r.data),
  get: (id: string) => client.get<Product>(`/products/${id}`).then((r) => r.data),
  byBarcode: (code: string) => client.get<Product>(`/products/barcode/${code}`).then((r) => r.data),
  create: (data: Partial<Product>) => client.post<Product>("/products", data).then((r) => r.data),
  update: (id: string, data: Partial<Product>) => client.patch<Product>(`/products/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/products/${id}`),
  lowStock: () => client.get<Product[]>("/products/low-stock").then((r) => r.data),
  movements: (id: string) => client.get<StockMovement[]>(`/products/${id}/movements`).then((r) => r.data),
  stockIn: (id: string, data: { quantity: number; note?: string | null }) =>
    client.post<Product>(`/products/${id}/stock-in`, data).then((r) => r.data),
  stockOut: (id: string, data: { quantity: number; note?: string | null }) =>
    client.post<Product>(`/products/${id}/stock-out`, data).then((r) => r.data),
  stockAdjustment: (id: string, data: { quantity: number; note?: string | null }) =>
    client.post<Product>(`/products/${id}/stock-adjustment`, data).then((r) => r.data),
};

// ---------- customers ----------
export const customersApi = {
  list: (params: { search?: string; page?: number } = {}) =>
    client.get<Paginated<Customer>>("/customers", { params }).then((r) => r.data),
  get: (id: string) =>
    client
      .get<{ customer: Customer; sales: Sale[]; debts: Debt[]; debtBalance: number }>(`/customers/${id}`)
      .then((r) => r.data),
  create: (data: Partial<Customer>) => client.post<Customer>("/customers", data).then((r) => r.data),
  update: (id: string, data: Partial<Customer>) => client.patch<Customer>(`/customers/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/customers/${id}`),
};

// ---------- suppliers ----------
export const suppliersApi = {
  list: (params: { search?: string; page?: number } = {}) =>
    client.get<Paginated<Supplier>>("/suppliers", { params }).then((r) => r.data),
  get: (id: string) =>
    client.get<{ supplier: Supplier; debts: Debt[]; owedBalance: number }>(`/suppliers/${id}`).then((r) => r.data),
  create: (data: Partial<Supplier>) => client.post<Supplier>("/suppliers", data).then((r) => r.data),
  update: (id: string, data: Partial<Supplier>) => client.patch<Supplier>(`/suppliers/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/suppliers/${id}`),
};

// ---------- income ----------
export const incomeApi = {
  list: (params: { search?: string; from?: string; to?: string; page?: number } = {}) =>
    client.get<Paginated<Income> & { totalAmount: number }>("/income", { params }).then((r) => r.data),
  create: (data: { source: string; amount: number; description?: string; date?: string }) =>
    client.post<Income>("/income", data).then((r) => r.data),
  update: (id: string, data: Partial<Income>) => client.patch<Income>(`/income/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/income/${id}`),
};

// ---------- expenses ----------
export const expensesApi = {
  list: (params: { search?: string; categoryId?: string; from?: string; to?: string; page?: number } = {}) =>
    client.get<Paginated<Expense> & { totalAmount: number }>("/expenses", { params }).then((r) => r.data),
  create: (data: { categoryId?: string | null; amount: number; description?: string; date?: string }) =>
    client.post<Expense>("/expenses", data).then((r) => r.data),
  update: (id: string, data: Partial<Expense>) => client.patch<Expense>(`/expenses/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/expenses/${id}`),
};

// ---------- sales ----------
export const salesApi = {
  list: (params: { customerId?: string; from?: string; to?: string; page?: number } = {}) =>
    client.get<Paginated<Sale>>("/sales", { params }).then((r) => r.data),
  get: (id: string) => client.get<Sale>(`/sales/${id}`).then((r) => r.data),
  create: (data: {
    customerId?: string | null;
    items: { productId: string; quantity: number; unitPrice: number }[];
    discount: number;
    vatAmount: number;
    amountPaid: number;
  }) => client.post<Sale>("/sales", data).then((r) => r.data),
  receiptUrl: (id: string) => `${import.meta.env.VITE_API_BASE_URL}/sales/${id}/receipt`,
};

// ---------- debts ----------
export const debtsApi = {
  list: (params: { direction?: "RECEIVABLE" | "PAYABLE"; status?: string } = {}) =>
    client.get<Debt[]>("/debts", { params }).then((r) => r.data),
  get: (id: string) => client.get<Debt>(`/debts/${id}`).then((r) => r.data),
  create: (data: {
    direction: "RECEIVABLE" | "PAYABLE";
    customerId?: string | null;
    supplierId?: string | null;
    originalAmount: number;
    dueDate?: string | null;
    notes?: string | null;
  }) => client.post<Debt>("/debts", data).then((r) => r.data),
  pay: (id: string, data: { amount: number; note?: string }) =>
    client.post<Debt>(`/debts/${id}/payments`, data).then((r) => r.data),
};

// ---------- dashboard ----------
export const dashboardApi = {
  summary: (params: { from?: string; to?: string } = {}) =>
    client.get<DashboardSummary>("/dashboard/summary", { params }).then((r) => r.data),
  lowStock: () => client.get<Product[]>("/dashboard/low-stock").then((r) => r.data),
};

// ---------- reports ----------
export type ReportType = "income" | "expenses" | "profit-loss" | "sales" | "inventory";

export interface ReportData {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  summary: { label: string; value: string | number }[];
}

export const reportsApi = {
  get: (type: ReportType, params: { from?: string; to?: string } = {}) =>
    client.get<ReportData>("/reports", { params: { type, ...params } }).then((r) => r.data),
  exportUrl: (type: ReportType, format: "excel" | "pdf", params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams({ type, ...(params.from ? { from: params.from } : {}), ...(params.to ? { to: params.to } : {}) });
    return `${import.meta.env.VITE_API_BASE_URL}/reports/export/${format}?${query.toString()}`;
  },
};

// ---------- analytics ----------
export interface TopProduct {
  productId: string;
  name: string;
  unit?: string | null;
  quantitySold: number;
  revenue: number;
}

export interface TopCustomer {
  customerId: string | null;
  name: string;
  orderCount: number;
  totalSpent: number;
}

export interface CashFlowPoint {
  date: string;
  cashIn: number;
  cashOut: number;
  net: number;
}

export interface MonthFigures {
  income: number;
  expenses: number;
  profit: number;
  salesCount: number;
  salesRevenue: number;
}

export interface MonthlyComparison {
  current: MonthFigures;
  previous: MonthFigures;
  change: { income: number | null; expenses: number | null; profit: number | null; salesCount: number | null };
}

export const analyticsApi = {
  topProducts: (params: { from?: string; to?: string; limit?: number } = {}) =>
    client.get<TopProduct[]>("/reports/analytics/top-products", { params }).then((r) => r.data),
  topCustomers: (params: { from?: string; to?: string; limit?: number } = {}) =>
    client.get<TopCustomer[]>("/reports/analytics/top-customers", { params }).then((r) => r.data),
  cashFlow: (params: { from?: string; to?: string } = {}) =>
    client.get<CashFlowPoint[]>("/reports/analytics/cash-flow", { params }).then((r) => r.data),
  monthlyComparison: () => client.get<MonthlyComparison>("/reports/analytics/monthly-comparison").then((r) => r.data),
};

// ---------- settings ----------
export const settingsApi = {
  getBusiness: () => client.get<Business>("/settings/business").then((r) => r.data),
  updateBusiness: (data: Partial<Business>) => client.patch<Business>("/settings/business", data).then((r) => r.data),
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) =>
    client.patch<User>("/settings/profile", data).then((r) => r.data),
  backupUrl: () => `${import.meta.env.VITE_API_BASE_URL}/settings/backup`,
  restore: (payload: unknown) => client.post("/settings/restore", payload).then((r) => r.data),
};

// ---------- users (staff) ----------
export const usersApi = {
  list: () => client.get<User[]>("/users").then((r) => r.data),
  create: (data: { name: string; email: string; password: string; role: "ADMIN" | "STAFF" }) =>
    client.post<User>("/users", data).then((r) => r.data),
  update: (id: string, data: Partial<User> & { isActive?: boolean }) =>
    client.patch<User>(`/users/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/users/${id}`),
};

// ---------- admin (business provisioning, gated by admin key) ----------
export const adminApi = {
  createBusiness: (
    adminKey: string,
    data: { businessName: string; name: string; email: string; password: string; currency?: string },
  ) =>
    client
      .post<{ business: Business; owner: Pick<User, "id" | "name" | "email" | "role"> }>("/admin/businesses", data, {
        headers: { "x-admin-key": adminKey },
      })
      .then((r) => r.data),
};
