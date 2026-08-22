import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { CreateBusinessPage } from "./pages/admin/CreateBusinessPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { TransactionsPage } from "./pages/transactions/TransactionsPage";
import { NewSalePage } from "./pages/pos/NewSalePage";
import { InventoryPage } from "./pages/inventory/InventoryPage";
import { ProductDetailPage } from "./pages/inventory/ProductDetailPage";
import { CustomersPage } from "./pages/customers/CustomersPage";
import { CustomerDetailPage } from "./pages/customers/CustomerDetailPage";
import { SuppliersPage } from "./pages/suppliers/SuppliersPage";
import { SupplierDetailPage } from "./pages/suppliers/SupplierDetailPage";
import { DebtsPage } from "./pages/debts/DebtsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin/create-business" element={<CreateBusinessPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/transactions/sales/new" element={<NewSalePage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/inventory/:id" element={<ProductDetailPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
                  <Route path="/debts" element={<DebtsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}
