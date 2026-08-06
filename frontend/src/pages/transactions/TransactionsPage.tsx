import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { expensesApi, incomeApi, salesApi, categoriesApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate, formatMoney, todayIso } from "../../lib/format";
import { Badge, Button, Card, DataTable, DateRangePicker, Input, Label, Modal, Select, SearchInput } from "../../components/ui";
import { AddCategoryModal } from "../../components/AddCategoryModal";
import type { Category, Expense, Income, Sale } from "../../types";

type Tab = "income" | "expense" | "sales";

export function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("income");
  const [incomeModalOpen, setIncomeModalOpen] = useState(searchParams.get("add") === "income");
  const [expenseModalOpen, setExpenseModalOpen] = useState(searchParams.get("add") === "expense");

  useEffect(() => {
    const add = searchParams.get("add");
    if (add === "income") {
      setTab("income");
      setIncomeModalOpen(true);
    } else if (add === "expense") {
      setTab("expense");
      setExpenseModalOpen(true);
    }
  }, [searchParams]);

  function closeModals() {
    setIncomeModalOpen(false);
    setExpenseModalOpen(false);
    searchParams.delete("add");
    setSearchParams(searchParams, { replace: true });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t("nav.transactions")}</h1>

      <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {(["income", "expense", "sales"] as Tab[]).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              tab === key ? "bg-white text-dashboard shadow dark:bg-gray-900" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {key === "income" ? t("income.title") : key === "expense" ? t("expense.title") : t("sales.title")}
          </button>
        ))}
      </div>

      {tab === "income" && <IncomeSection modalOpen={incomeModalOpen} onOpenModal={() => setIncomeModalOpen(true)} onCloseModal={closeModals} />}
      {tab === "expense" && <ExpenseSection modalOpen={expenseModalOpen} onOpenModal={() => setExpenseModalOpen(true)} onCloseModal={closeModals} />}
      {tab === "sales" && <SalesSection />}
    </div>
  );
}

// ---------------- Income ----------------

function IncomeSection({ modalOpen, onOpenModal, onCloseModal }: { modalOpen: boolean; onOpenModal: () => void; onCloseModal: () => void }) {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Income[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [editing, setEditing] = useState<Income | null>(null);

  function load() {
    incomeApi.list({ search, from: range.from || undefined, to: range.to || undefined }).then((res) => {
      setItems(res.items);
      setTotal(res.totalAmount);
    });
  }

  useEffect(load, [search, range]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this income entry?")) return;
    await incomeApi.remove(id);
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t("common.search")} />
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
        <Button variant="income" onClick={onOpenModal}>
          {t("income.add")}
        </Button>
      </div>

      <Card>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500">{t("common.total")}</span>
          <span className="font-semibold text-income">{formatMoney(total, business?.currency)}</span>
        </div>
        <DataTable
          columns={[t("income.date"), t("income.source"), t("income.amount"), ""]}
          rows={items}
          emptyMessage={t("common.noData")}
          renderRow={(item) => (
            <tr key={item.id}>
              <td className="px-3 py-2">{formatDate(item.date)}</td>
              <td className="px-3 py-2">
                {item.source}
                {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
              </td>
              <td className="px-3 py-2 font-medium text-income">{formatMoney(item.amount, business?.currency)}</td>
              <td className="px-3 py-2 text-right">
                <button className="mr-2 text-xs text-dashboard" onClick={() => setEditing(item)}>
                  {t("common.edit")}
                </button>
                <button className="text-xs text-expense" onClick={() => handleDelete(item.id)}>
                  {t("common.delete")}
                </button>
              </td>
            </tr>
          )}
        />
      </Card>

      <IncomeFormModal
        open={modalOpen || !!editing}
        initial={editing}
        onClose={() => {
          setEditing(null);
          onCloseModal();
        }}
        onSaved={() => {
          setEditing(null);
          onCloseModal();
          load();
        }}
      />
    </div>
  );
}

function IncomeFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Income | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [source, setSource] = useState(initial?.source ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date?.slice(0, 10) ?? todayIso());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSource(initial?.source ?? "");
    setAmount(String(initial?.amount ?? ""));
    setDescription(initial?.description ?? "");
    setDate(initial?.date?.slice(0, 10) ?? todayIso());
  }, [initial, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { source, amount: Number(amount), description: description || undefined, date };
      if (initial) await incomeApi.update(initial.id, payload);
      else await incomeApi.create(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("income.add")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>{t("income.source")}</Label>
          <Input required value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div>
          <Label>{t("income.amount")}</Label>
          <Input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>{t("income.date")}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>{t("income.description")}</Label>
          <Input value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button variant="income" type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}

// ---------------- Expense ----------------

function ExpenseSection({ modalOpen, onOpenModal, onCloseModal }: { modalOpen: boolean; onOpenModal: () => void; onCloseModal: () => void }) {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [editing, setEditing] = useState<Expense | null>(null);

  function load() {
    expensesApi.list({ search, from: range.from || undefined, to: range.to || undefined }).then((res) => {
      setItems(res.items);
      setTotal(res.totalAmount);
    });
  }

  useEffect(load, [search, range]);
  useEffect(() => {
    categoriesApi.list("EXPENSE").then(setCategories);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense entry?")) return;
    await expensesApi.remove(id);
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t("common.search")} />
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
        <Button variant="expense" onClick={onOpenModal}>
          {t("expense.add")}
        </Button>
      </div>

      <Card>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500">{t("common.total")}</span>
          <span className="font-semibold text-expense">{formatMoney(total, business?.currency)}</span>
        </div>
        <DataTable
          columns={[t("income.date"), t("expense.category"), t("expense.amount"), ""]}
          rows={items}
          emptyMessage={t("common.noData")}
          renderRow={(item) => (
            <tr key={item.id}>
              <td className="px-3 py-2">{formatDate(item.date)}</td>
              <td className="px-3 py-2">
                {item.category?.name ?? "-"}
                {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
              </td>
              <td className="px-3 py-2 font-medium text-expense">{formatMoney(item.amount, business?.currency)}</td>
              <td className="px-3 py-2 text-right">
                <button className="mr-2 text-xs text-dashboard" onClick={() => setEditing(item)}>
                  {t("common.edit")}
                </button>
                <button className="text-xs text-expense" onClick={() => handleDelete(item.id)}>
                  {t("common.delete")}
                </button>
              </td>
            </tr>
          )}
        />
      </Card>

      <ExpenseFormModal
        open={modalOpen || !!editing}
        initial={editing}
        categories={categories}
        onCategoryCreated={(c) => setCategories((prev) => [...prev, c])}
        onClose={() => {
          setEditing(null);
          onCloseModal();
        }}
        onSaved={() => {
          setEditing(null);
          onCloseModal();
          load();
        }}
      />
    </div>
  );
}

function ExpenseFormModal({
  open,
  initial,
  categories,
  onCategoryCreated,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Expense | null;
  categories: Category[];
  onCategoryCreated?: (category: Category) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date?.slice(0, 10) ?? todayIso());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategoryId(initial?.categoryId ?? "");
    setAmount(String(initial?.amount ?? ""));
    setDescription(initial?.description ?? "");
    setDate(initial?.date?.slice(0, 10) ?? todayIso());
  }, [initial, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { categoryId: categoryId || null, amount: Number(amount), description: description || undefined, date };
      if (initial) await expensesApi.update(initial.id, payload);
      else await expensesApi.create(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("expense.add")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>{t("expense.category")}</Label>
          <div className="flex gap-2">
            <Select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">-</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Button type="button" variant="expense" outline onClick={() => setAddCategoryOpen(true)}>
              +
            </Button>
          </div>
        </div>
        <div>
          <Label>{t("expense.amount")}</Label>
          <Input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>{t("income.date")}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>{t("expense.description")}</Label>
          <Input value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button variant="expense" type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>

      <AddCategoryModal
        open={addCategoryOpen}
        type="EXPENSE"
        onClose={() => setAddCategoryOpen(false)}
        onCreated={(category) => {
          setAddCategoryOpen(false);
          setCategoryId(category.id);
          onCategoryCreated?.(category);
        }}
      />
    </Modal>
  );
}

// ---------------- Sales ----------------

function SalesSection() {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<Sale[]>([]);
  const [range, setRange] = useState({ from: "", to: "" });

  useEffect(() => {
    salesApi.list({ from: range.from || undefined, to: range.to || undefined }).then((res) => setItems(res.items));
  }, [range]);

  return (
    <div className="space-y-3">
      <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      <Card>
        <DataTable
          columns={["#", t("income.date"), t("customers.title"), t("common.total"), t("common.status"), ""]}
          rows={items}
          emptyMessage={t("common.noData")}
          renderRow={(sale) => (
            <tr key={sale.id}>
              <td className="px-3 py-2">{sale.saleNumber}</td>
              <td className="px-3 py-2">{formatDate(sale.createdAt)}</td>
              <td className="px-3 py-2">{sale.customer?.name ?? "Walk-in"}</td>
              <td className="px-3 py-2 font-medium text-dashboard">{formatMoney(sale.total, business?.currency)}</td>
              <td className="px-3 py-2">
                <Badge variant={sale.paymentStatus === "PAID" ? "income" : sale.paymentStatus === "PARTIAL" ? "reports" : "expense"}>
                  {sale.paymentStatus}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right">
                <a className="text-xs text-dashboard" href={salesApi.receiptUrl(sale.id)} target="_blank" rel="noreferrer">
                  {t("sales.printReceipt")}
                </a>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
}
