import { FormEvent, useEffect, useState } from "react";
import { categoriesApi } from "../api/endpoints";
import { useLanguage } from "../context/LanguageContext";
import { Button, Input, Label, Modal } from "./ui";
import type { Category } from "../types";

export function AddCategoryModal({
  open,
  type,
  onClose,
  onCreated,
}: {
  open: boolean;
  type: "PRODUCT" | "EXPENSE";
  onClose: () => void;
  onCreated: (category: Category) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const category = await categoriesApi.create({ name, type });
      onCreated(category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("category.add")}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <p className="rounded-lg bg-expense-light px-3 py-2 text-sm text-expense">{error}</p>}
        <div>
          <Label>{t("category.name")}</Label>
          <Input required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Modal>
  );
}
