import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { categoriesApi, productsApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatMoney } from "../../lib/format";
import { Badge, Button, Card, DataTable, Input, Label, Modal, Select, SearchInput } from "../../components/ui";
import type { Category, Product, StockMovementType } from "../../types";

export function InventoryPage() {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(searchParams.get("lowStock") === "true");
  const [modalOpen, setModalOpen] = useState(searchParams.get("add") === "product");
  const [editing, setEditing] = useState<Product | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [stockMode, setStockMode] = useState<StockMovementType | null>(null);

  function load() {
    productsApi.list({ search, lowStock: lowStockOnly || undefined }).then((res) => setItems(res.items));
  }

  useEffect(load, [search, lowStockOnly]);
  useEffect(() => {
    categoriesApi.list("PRODUCT").then(setCategories);
  }, []);
  useEffect(() => {
    productsApi.lowStock().then((items) => setLowStockCount(items.length));
  }, [items]);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    searchParams.delete("add");
    setSearchParams(searchParams, { replace: true });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await productsApi.remove(id);
    load();
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">{t("inventory.title")}</h1>

      {lowStockCount > 0 && (
        <button
          onClick={() => setLowStockOnly(true)}
          className="block w-full rounded-lg bg-expense-light px-4 py-3 text-left text-sm font-medium text-expense"
        >
          ⚠️ {lowStockCount} {t("inventory.lowStockAlert")}
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setStockMode("IN")}
          className="rounded-lg bg-income py-2 text-center text-xs font-semibold text-white"
        >
          📦 {t("inventory.stockIn")}
        </button>
        <button
          onClick={() => setStockMode("OUT")}
          className="rounded-lg bg-expense py-2 text-center text-xs font-semibold text-white"
        >
          📤 {t("inventory.stockOut")}
        </button>
        <button
          onClick={() => setStockMode("ADJUSTMENT")}
          className="rounded-lg bg-reports py-2 text-center text-xs font-semibold text-white"
        >
          🔄 {t("inventory.stockAdjustment")}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t("common.search")} />
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          {t("dashboard.lowStock")}
        </label>
        <Button variant="reports" onClick={() => setModalOpen(true)}>
          {t("inventory.add")}
        </Button>
      </div>

      <Card>
        <DataTable
          columns={[t("inventory.name"), t("inventory.category"), t("inventory.sellingPrice"), t("inventory.stock"), ""]}
          rows={items}
          emptyMessage={t("common.noData")}
          renderRow={(p) => (
            <tr key={p.id}>
              <td className="px-3 py-2">
                <Link to={`/inventory/${p.id}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                {p.barcode && <p className="text-xs text-gray-400">{p.barcode}</p>}
              </td>
              <td className="px-3 py-2">{p.category?.name ?? "-"}</td>
              <td className="px-3 py-2">{formatMoney(p.sellingPrice, business?.currency)}</td>
              <td className="px-3 py-2">
                {p.stockQty} {p.unit ?? ""}
                {p.stockQty <= p.lowStockThreshold && (
                  <Badge variant="expense">{t("dashboard.lowStock")}</Badge>
                )}
              </td>
              <td className="px-3 py-2 text-right">
                <button className="mr-2 text-xs text-dashboard" onClick={() => setEditing(p)}>
                  {t("common.edit")}
                </button>
                <button className="text-xs text-expense" onClick={() => handleDelete(p.id)}>
                  {t("common.delete")}
                </button>
              </td>
            </tr>
          )}
        />
      </Card>

      <ProductFormModal
        open={modalOpen || !!editing}
        initial={editing}
        categories={categories}
        onClose={closeModal}
        onSaved={() => {
          closeModal();
          load();
        }}
      />

      <StockMovementModal
        open={!!stockMode}
        mode={stockMode ?? "IN"}
        products={items}
        onClose={() => setStockMode(null)}
        onSaved={() => {
          setStockMode(null);
          load();
        }}
      />
    </div>
  );
}

export function StockMovementModal({
  open,
  mode,
  products,
  preselectedProduct,
  onClose,
  onSaved,
}: {
  open: boolean;
  mode: StockMovementType;
  products?: Product[];
  preselectedProduct?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [productId, setProductId] = useState(preselectedProduct?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setProductId(preselectedProduct?.id ?? "");
    setQuantity("");
    setNote("");
    setError(null);
  }, [open, preselectedProduct, mode]);

  const titleKey = mode === "IN" ? "inventory.stockIn" : mode === "OUT" ? "inventory.stockOut" : "inventory.stockAdjustment";
  const variant = mode === "IN" ? "income" : mode === "OUT" ? "expense" : "reports";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!productId) {
      setError(t("inventory.selectProduct"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { quantity: Number(quantity), note: note || null };
      if (mode === "IN") await productsApi.stockIn(productId, payload);
      else if (mode === "OUT") await productsApi.stockOut(productId, payload);
      else await productsApi.stockAdjustment(productId, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t(titleKey)}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="rounded-lg bg-expense-light px-3 py-2 text-sm text-expense">{error}</p>}
        {!preselectedProduct && (
          <div>
            <Label>{t("inventory.selectProduct")}</Label>
            <Select value={productId} onChange={(e) => setProductId(e.target.value)} required>
              <option value="">-</option>
              {(products ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stockQty} {p.unit})
                </option>
              ))}
            </Select>
          </div>
        )}
        <div>
          <Label>{mode === "ADJUSTMENT" ? t("inventory.newQuantity") : t("inventory.quantity")}</Label>
          <Input
            type="number"
            min={mode === "ADJUSTMENT" ? "0" : "1"}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <Label>{t("inventory.note")}</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button variant={variant} type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}

export function ProductFormModal({
  open,
  initial,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    barcode: initial?.barcode ?? "",
    categoryId: initial?.categoryId ?? "",
    sellingPrice: String(initial?.sellingPrice ?? ""),
    costPrice: String(initial?.costPrice ?? ""),
    stockQty: String(initial?.stockQty ?? "0"),
    lowStockThreshold: String(initial?.lowStockThreshold ?? "5"),
    unit: initial?.unit ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: initial?.name ?? "",
      barcode: initial?.barcode ?? "",
      categoryId: initial?.categoryId ?? "",
      sellingPrice: String(initial?.sellingPrice ?? ""),
      costPrice: String(initial?.costPrice ?? ""),
      stockQty: String(initial?.stockQty ?? "0"),
      lowStockThreshold: String(initial?.lowStockThreshold ?? "5"),
      unit: initial?.unit ?? "",
    });
  }, [initial, open]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        barcode: form.barcode || null,
        categoryId: form.categoryId || null,
        sellingPrice: Number(form.sellingPrice),
        costPrice: Number(form.costPrice),
        stockQty: Number(form.stockQty),
        lowStockThreshold: Number(form.lowStockThreshold),
        unit: form.unit || null,
      };
      if (initial) await productsApi.update(initial.id, payload);
      else await productsApi.create(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("inventory.add")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>{t("inventory.name")}</Label>
          <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <Label>{t("inventory.barcode")}</Label>
          <Input value={form.barcode ?? ""} onChange={(e) => update("barcode", e.target.value)} />
        </div>
        <div>
          <Label>{t("inventory.category")}</Label>
          <Select value={form.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value)}>
            <option value="">-</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("inventory.sellingPrice")}</Label>
            <Input type="number" step="0.01" min="0" required value={form.sellingPrice} onChange={(e) => update("sellingPrice", e.target.value)} />
          </div>
          <div>
            <Label>{t("inventory.costPrice")}</Label>
            <Input type="number" step="0.01" min="0" required value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("inventory.stock")}</Label>
            <Input type="number" min="0" required value={form.stockQty} onChange={(e) => update("stockQty", e.target.value)} />
          </div>
          <div>
            <Label>Unit</Label>
            <Input value={form.unit ?? ""} onChange={(e) => update("unit", e.target.value)} placeholder="pcs, kg..." />
          </div>
        </div>
        <div>
          <Label>Low stock threshold</Label>
          <Input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} />
        </div>
        <Button variant="reports" type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}
