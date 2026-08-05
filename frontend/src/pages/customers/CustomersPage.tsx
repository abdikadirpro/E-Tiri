import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { customersApi } from "../../api/endpoints";
import { useLanguage } from "../../context/LanguageContext";
import { Button, Card, DataTable, Input, Label, Modal, SearchInput } from "../../components/ui";
import type { Customer } from "../../types";

export function CustomersPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(searchParams.get("add") === "customer");

  function load() {
    customersApi.list({ search }).then((res) => setItems(res.items));
  }

  useEffect(load, [search]);

  function closeModal() {
    setModalOpen(false);
    searchParams.delete("add");
    setSearchParams(searchParams, { replace: true });
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">{t("customers.title")}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t("common.search")} />
        <Button onClick={() => setModalOpen(true)}>{t("customers.add")}</Button>
      </div>

      <Card>
        <DataTable
          columns={[t("inventory.name"), t("customers.phone"), ""]}
          rows={items}
          emptyMessage={t("common.noData")}
          renderRow={(c) => (
            <tr key={c.id}>
              <td className="px-3 py-2">
                <Link to={`/customers/${c.id}`} className="font-medium hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="px-3 py-2">{c.phone ?? "-"}</td>
              <td className="px-3 py-2 text-right">
                <Link to={`/customers/${c.id}`} className="text-xs text-dashboard">
                  View
                </Link>
              </td>
            </tr>
          )}
        />
      </Card>

      <CustomerFormModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={() => {
          closeModal();
          load();
        }}
      />
    </div>
  );
}

export function CustomerFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial?: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name ?? "");
    setPhone(initial?.phone ?? "");
    setAddress(initial?.address ?? "");
  }, [initial, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, phone: phone || null, address: address || null };
      if (initial) await customersApi.update(initial.id, payload);
      else await customersApi.create(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("customers.add")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>{t("inventory.name")}</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>{t("customers.phone")}</Label>
          <Input value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>{t("customers.address")}</Label>
          <Input value={address ?? ""} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}
