import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { categoriesApi, productsApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate, formatMoney } from "../../lib/format";
import { Badge, Button, Card } from "../../components/ui";
import { ProductFormModal, StockMovementModal } from "./InventoryPage";
import type { Category, Product, StockMovement, StockMovementType } from "../../types";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { business } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [editing, setEditing] = useState(false);
  const [stockMode, setStockMode] = useState<StockMovementType | null>(null);

  function load() {
    if (!id) return;
    productsApi.get(id).then(setProduct);
    productsApi.movements(id).then(setMovements);
  }

  useEffect(load, [id]);
  useEffect(() => {
    categoriesApi.list("PRODUCT").then(setCategories);
  }, []);

  if (!product) return <p className="py-10 text-center text-gray-400">{t("common.loading")}</p>;

  async function handleDelete() {
    if (!id || !confirm("Delete this product?")) return;
    await productsApi.remove(id);
    navigate("/inventory");
  }

  return (
    <div className="space-y-3">
      <Link to="/inventory" className="text-sm text-dashboard">
        ← {t("inventory.title")}
      </Link>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold">{product.name}</h1>
            {product.barcode && <p className="text-xs text-gray-400">{product.barcode}</p>}
            <p className="text-sm text-gray-500">{product.category?.name ?? "-"}</p>
          </div>
          {product.stockQty <= product.lowStockThreshold && <Badge variant="expense">{t("dashboard.lowStock")}</Badge>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">{t("inventory.sellingPrice")}</p>
            <p className="font-semibold">{formatMoney(product.sellingPrice, business?.currency)}</p>
          </div>
          <div>
            <p className="text-gray-400">{t("inventory.costPrice")}</p>
            <p className="font-semibold">{formatMoney(product.costPrice, business?.currency)}</p>
          </div>
          <div>
            <p className="text-gray-400">{t("inventory.stock")}</p>
            <p className="font-semibold">
              {product.stockQty} {product.unit ?? ""}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="dashboard" outline onClick={() => setEditing(true)}>
            {t("common.edit")}
          </Button>
          <Button variant="expense" outline onClick={handleDelete}>
            {t("common.delete")}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setStockMode("IN")} className="rounded-lg bg-income py-2 text-center text-xs font-semibold text-white">
          📦 {t("inventory.stockIn")}
        </button>
        <button onClick={() => setStockMode("OUT")} className="rounded-lg bg-expense py-2 text-center text-xs font-semibold text-white">
          📤 {t("inventory.stockOut")}
        </button>
        <button onClick={() => setStockMode("ADJUSTMENT")} className="rounded-lg bg-reports py-2 text-center text-xs font-semibold text-white">
          🔄 {t("inventory.stockAdjustment")}
        </button>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">{t("inventory.history")}</h2>
        {movements.length === 0 && <p className="text-sm text-gray-400">{t("common.noData")}</p>}
        <ul className="space-y-2 text-sm">
          {movements.map((m) => (
            <li key={m.id} className="flex justify-between border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
              <span>
                {m.type === "IN" ? "📦" : m.type === "OUT" ? "📤" : "🔄"}{" "}
                {m.type === "IN" ? t("inventory.stockIn") : m.type === "OUT" ? t("inventory.stockOut") : t("inventory.stockAdjustment")}
                {m.note && <span className="text-gray-400"> — {m.note}</span>}
                <p className="text-xs text-gray-400">{formatDate(m.createdAt)}</p>
              </span>
              <span className={`font-medium ${m.type === "OUT" || m.quantity < 0 ? "text-expense" : "text-income"}`}>
                {m.type === "ADJUSTMENT" ? (m.quantity >= 0 ? `+${m.quantity}` : m.quantity) : m.type === "OUT" ? `-${m.quantity}` : `+${m.quantity}`}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <ProductFormModal
        open={editing}
        initial={product}
        categories={categories}
        onCategoryCreated={(c) => setCategories((prev) => [...prev, c])}
        onClose={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          load();
        }}
      />

      <StockMovementModal
        open={!!stockMode}
        mode={stockMode ?? "IN"}
        preselectedProduct={product}
        onClose={() => setStockMode(null)}
        onSaved={() => {
          setStockMode(null);
          load();
        }}
      />
    </div>
  );
}
