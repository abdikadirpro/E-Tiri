import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { customersApi, debtsApi, suppliersApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { formatDate, formatMoney } from "../../lib/format";
import { Badge, Button, Card, DataTable, Input, Label, Modal, Select } from "../../components/ui";
import type { Customer, Debt, DebtDirection, Supplier } from "../../types";

export function DebtsPage() {
  const { business } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [direction, setDirection] = useState<DebtDirection>("RECEIVABLE");
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(searchParams.get("add") === "debt");

  function load() {
    debtsApi.list({ direction }).then(setDebts);
  }

  useEffect(load, [direction]);

  function closeCreateModal() {
    setCreateModalOpen(false);
    searchParams.delete("add");
    setSearchParams(searchParams, { replace: true });
  }

  const totalOutstanding = debts.reduce((sum, d) => sum + Number(d.balance), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("debts.title")}</h1>
        <Button variant="expense" onClick={() => setCreateModalOpen(true)}>
          {t("debts.add")}
        </Button>
      </div>

      <div className="flex gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setDirection("RECEIVABLE")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            direction === "RECEIVABLE" ? "bg-white text-income shadow dark:bg-gray-900" : "text-gray-500"
          }`}
        >
          {t("debts.receivable")}
        </button>
        <button
          onClick={() => setDirection("PAYABLE")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            direction === "PAYABLE" ? "bg-white text-expense shadow dark:bg-gray-900" : "text-gray-500"
          }`}
        >
          {t("debts.payable")}
        </button>
      </div>

      <Card>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500">{t("common.total")}</span>
          <span className={`font-semibold ${direction === "RECEIVABLE" ? "text-income" : "text-expense"}`}>
            {formatMoney(totalOutstanding, business?.currency)}
          </span>
        </div>
        <DataTable
          columns={[direction === "RECEIVABLE" ? t("customers.title") : t("suppliers.title"), t("common.total"), t("common.status"), ""]}
          rows={debts}
          emptyMessage={t("common.noData")}
          renderRow={(d) => (
            <tr key={d.id}>
              <td className="px-3 py-2">
                {d.customer?.name ?? d.supplier?.name ?? "-"}
                {d.dueDate && <p className="text-xs text-gray-400">Due {formatDate(d.dueDate)}</p>}
              </td>
              <td className="px-3 py-2 font-medium">{formatMoney(d.balance, business?.currency)}</td>
              <td className="px-3 py-2">
                <Badge variant={d.status === "PAID" ? "income" : d.status === "PARTIAL" ? "reports" : "expense"}>{d.status}</Badge>
              </td>
              <td className="px-3 py-2 text-right">
                {d.status !== "PAID" && (
                  <button className="text-xs text-dashboard" onClick={() => setPayingDebt(d)}>
                    {t("debts.pay")}
                  </button>
                )}
              </td>
            </tr>
          )}
        />
      </Card>

      <RecordPaymentModal
        debt={payingDebt}
        onClose={() => setPayingDebt(null)}
        onSaved={() => {
          setPayingDebt(null);
          load();
        }}
      />

      <CreateDebtModal
        open={createModalOpen}
        defaultDirection={direction}
        onClose={closeCreateModal}
        onSaved={() => {
          closeCreateModal();
          load();
        }}
      />
    </div>
  );
}

function RecordPaymentModal({ debt, onClose, onSaved }: { debt: Debt | null; onClose: () => void; onSaved: () => void }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount("");
    setNote("");
  }, [debt]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!debt) return;
    setSaving(true);
    try {
      await debtsApi.pay(debt.id, { amount: Number(amount), note: note || undefined });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={!!debt} onClose={onClose} title={t("debts.pay")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm text-gray-500">Remaining balance: {debt && formatMoney(debt.balance)}</p>
        <div>
          <Label>Amount</Label>
          <Input type="number" min="0" step="0.01" max={debt?.balance} required value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>Note</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}

function CreateDebtModal({
  open,
  defaultDirection,
  onClose,
  onSaved,
}: {
  open: boolean;
  defaultDirection: DebtDirection;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [direction, setDirection] = useState<DebtDirection>(defaultDirection);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [partyId, setPartyId] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDirection(defaultDirection);
    setPartyId("");
    setOriginalAmount("");
    setDueDate("");
    setNotes("");
    setError(null);
    customersApi.list({}).then((res) => setCustomers(res.items));
    suppliersApi.list({}).then((res) => setSuppliers(res.items));
  }, [open, defaultDirection]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!partyId) {
      setError(direction === "RECEIVABLE" ? "Select a customer" : "Select a supplier");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await debtsApi.create({
        direction,
        customerId: direction === "RECEIVABLE" ? partyId : null,
        supplierId: direction === "PAYABLE" ? partyId : null,
        originalAmount: Number(originalAmount),
        dueDate: dueDate || null,
        notes: notes || null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const parties = direction === "RECEIVABLE" ? customers : suppliers;

  return (
    <Modal open={open} onClose={onClose} title={t("debts.add")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="rounded-lg bg-expense-light px-3 py-2 text-sm text-expense">{error}</p>}
        <div>
          <Label>{t("debts.direction")}</Label>
          <Select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value as DebtDirection);
              setPartyId("");
            }}
          >
            <option value="RECEIVABLE">{t("debts.receivable")}</option>
            <option value="PAYABLE">{t("debts.payable")}</option>
          </Select>
        </div>
        <div>
          <Label>{direction === "RECEIVABLE" ? t("customers.title") : t("suppliers.title")}</Label>
          <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
            <option value="">-</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{t("debts.originalAmount")}</Label>
          <Input type="number" min="0.01" step="0.01" required value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)} />
        </div>
        <div>
          <Label>{t("debts.dueDate")}</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div>
          <Label>{t("debts.notes")}</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button variant="expense" type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}
