import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { customersApi, productsApi, salesApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatMoney } from "../../lib/format";
import { Button, Card, Input, Label, Select } from "../../components/ui";
import { CustomerFormModal } from "../customers/CustomersPage";
import type { Customer, Product } from "../../types";

interface CartLine {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export function NewSalePage() {
  const { business } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const [discount, setDiscount] = useState("0");
  const [vatAmount, setVatAmount] = useState("0");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedSaleId, setCompletedSaleId] = useState<string | null>(null);

  useEffect(() => {
    productsApi.list({ search: productSearch }).then((res) => setProducts(res.items));
  }, [productSearch]);

  function loadCustomers() {
    customersApi.list({}).then((res) => setCustomers(res.items));
  }
  useEffect(loadCustomers, []);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((l) => l.product.id !== productId));
      return;
    }
    setCart((prev) => prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)));
  }

  const subtotal = cart.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const total = Math.max(0, subtotal - Number(discount || 0) + Number(vatAmount || 0));
  const paid = Number(amountPaid || 0);
  const willCreateDebt = paid < total;

  async function handleSubmit() {
    setError(null);
    if (!cart.length) {
      setError("Add at least one product");
      return;
    }
    if (willCreateDebt && !customerId) {
      setError("A customer is required for a partial or unpaid sale");
      return;
    }
    setSubmitting(true);
    try {
      const sale = await salesApi.create({
        customerId: customerId || null,
        items: cart.map((l) => ({ productId: l.product.id, quantity: l.quantity, unitPrice: l.unitPrice })),
        discount: Number(discount || 0),
        vatAmount: Number(vatAmount || 0),
        amountPaid: paid,
      });
      setCompletedSaleId(sale.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sale");
    } finally {
      setSubmitting(false);
    }
  }

  if (completedSaleId) {
    return (
      <div className="space-y-4 py-10 text-center">
        <div className="text-4xl">✅</div>
        <h1 className="text-lg font-bold">Sale completed</h1>
        <div className="flex justify-center gap-2">
          <a href={salesApi.receiptUrl(completedSaleId)} target="_blank" rel="noreferrer">
            <Button variant="dashboard">{t("sales.printReceipt")}</Button>
          </a>
          <Button variant="dashboard" outline onClick={() => navigate("/transactions")}>
            {t("nav.transactions")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/transactions" className="text-sm text-dashboard">
        ← {t("nav.transactions")}
      </Link>
      <h1 className="text-xl font-bold">{t("sales.new")}</h1>

      {error && <p className="rounded-lg bg-expense-light px-3 py-2 text-sm text-expense">{error}</p>}

      <Card>
        <Label>{t("sales.customer")}</Label>
        <div className="flex gap-2">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button type="button" variant="dashboard" outline onClick={() => setCustomerModalOpen(true)}>
            +
          </Button>
        </div>
      </Card>

      <Card>
        <Label>{t("sales.product")}</Label>
        <Input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder={t("common.search")} />
        <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stockQty <= 0}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800"
            >
              <span>
                {p.name} <span className="text-xs text-gray-400">({p.stockQty} {p.unit})</span>
              </span>
              <span className="font-medium">{formatMoney(p.sellingPrice, business?.currency)}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">Cart</h2>
        {cart.length === 0 && <p className="text-sm text-gray-400">No items yet</p>}
        <div className="space-y-2">
          {cart.map((line) => (
            <div key={line.product.id} className="flex items-center justify-between text-sm">
              <span className="flex-1">{line.product.name}</span>
              <div className="flex items-center gap-1">
                <button
                  className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800"
                  onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                >
                  -
                </button>
                <span className="w-6 text-center">{line.quantity}</span>
                <button
                  className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800"
                  onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right font-medium">{formatMoney(line.quantity * line.unitPrice, business?.currency)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <Label>{t("sales.discount")}</Label>
            <Input type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div>
            <Label>{t("sales.vat")}</Label>
            <Input type="number" min="0" step="0.01" value={vatAmount} onChange={(e) => setVatAmount(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatMoney(subtotal, business?.currency)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>{t("common.total")}</span>
            <span>{formatMoney(total, business?.currency)}</span>
          </div>
        </div>

        <div className="mt-3">
          <Label>Amount paid</Label>
          <Input type="number" min="0" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
          {willCreateDebt && amountPaid !== "" && (
            <p className="mt-1 text-xs text-reports">
              Balance of {formatMoney(total - paid, business?.currency)} will be recorded as a debt for the selected customer.
            </p>
          )}
        </div>

        <Button variant="dashboard" className="mt-4 w-full" onClick={handleSubmit} disabled={submitting}>
          {t("sales.new")}
        </Button>
      </Card>

      <CustomerFormModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={() => {
          setCustomerModalOpen(false);
          loadCustomers();
        }}
      />
    </div>
  );
}
