import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { authMiddleware } from "./middleware/auth.middleware";
import { adminAuthMiddleware } from "./middleware/adminAuth.middleware";
import { serializeDecimalsMiddleware } from "./middleware/serializeDecimals.middleware";

import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import userRoutes from "./modules/users/users.routes";
import categoryRoutes from "./modules/categories/categories.routes";
import productRoutes from "./modules/products/products.routes";
import customerRoutes from "./modules/customers/customers.routes";
import supplierRoutes from "./modules/suppliers/suppliers.routes";
import incomeRoutes from "./modules/income/income.routes";
import expenseRoutes from "./modules/expenses/expenses.routes";
import saleRoutes from "./modules/sales/sales.routes";
import debtRoutes from "./modules/debts/debts.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import reportRoutes from "./modules/reports/reports.routes";
import settingsRoutes from "./modules/settings/settings.routes";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(serializeDecimalsMiddleware);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthMiddleware, adminRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/customers", authMiddleware, customerRoutes);
app.use("/api/suppliers", authMiddleware, supplierRoutes);
app.use("/api/income", authMiddleware, incomeRoutes);
app.use("/api/expenses", authMiddleware, expenseRoutes);
app.use("/api/sales", authMiddleware, saleRoutes);
app.use("/api/debts", authMiddleware, debtRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/settings", authMiddleware, settingsRoutes);

if (env.isProduction) {
  const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
