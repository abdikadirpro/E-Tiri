import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { suppliersApi } from "../../api/endpoints";
import { useLanguage } from "../../context/LanguageContext";
import { Button, Card, DataTable, Input, Label, Modal, SearchInput } from "../../components/ui";
import type { Supplier } from "../../types";

export function SuppliersPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(searchParams.get("add") === "supplier");

  function load() {
    suppliersApi.list({ search }).then((res) => setItems(res.items));
  }

  useEffect(load, [search]);

  function closeModal() {
    setModalOpen(false);
    searchParams.delete("add");
    setSearchParams(searchParams, { replace: true });
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">{t("suppliers.title")}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder={t("common.search")} />
        <Button onClick={() => setModalOpen(true)}>{t("suppliers.add")}</Button>
      </div>

      <Card>
        <DataTable
          columns={[t("inventory.name"), t("customers.phone"), ""]}
          rows={items}
          emptyMessage={t("common.noData")}
          renderRow={(s) => (
            <tr key={s.id}>
              <td className="px-3 py-2">
                <Link to={`/suppliers/${s.id}`} className="font-medium hover:underline">
                  {s.name}
                </Link>
              </td>
              <td className="px-3 py-2">{s.phone ?? "-"}</td>
              <td className="px-3 py-2 text-right">
                <Link to={`/suppliers/${s.id}`} className="text-xs text-dashboard">
                  View
                </Link>
              </td>
            </tr>
          )}
        />
      </Card>

      <SupplierFormModal
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

export function SupplierFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial?: Supplier | null;
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
      if (initial) await suppliersApi.update(initial.id, payload);
      else await suppliersApi.create(payload);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("suppliers.add")}>
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
