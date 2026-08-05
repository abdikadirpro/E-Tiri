import { FormEvent, useState } from "react";
import { settingsApi } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button, Card, Input, Label, Select } from "../../components/ui";

const CURRENCIES = ["USD", "SOS", "KES", "ETB", "EUR", "GBP"];

export function SettingsPage() {
  const { user, business, setBusiness, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t("settings.title")}</h1>

      <ProfileSection userName={user?.name ?? ""} userEmail={user?.email ?? ""} />

      <CompanySection business={business} onSaved={setBusiness} />

      <Card>
        <h2 className="mb-3 text-sm font-semibold">{t("settings.currency")} / {t("settings.language")}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t("settings.currency")}</Label>
            <Select
              value={business?.currency ?? "USD"}
              onChange={async (e) => {
                if (!business) return;
                const updated = await settingsApi.updateBusiness({ currency: e.target.value });
                setBusiness(updated);
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("settings.language")}</Label>
            <Select
              value={lang}
              onChange={async (e) => {
                const next = e.target.value as "so" | "en";
                setLang(next);
                if (business) {
                  const updated = await settingsApi.updateBusiness({ language: next.toUpperCase() as "SO" | "EN" });
                  setBusiness(updated);
                }
              }}
            >
              <option value="so">Soomaali</option>
              <option value="en">English</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{t("settings.darkMode")}</span>
          <button
            onClick={toggleDarkMode}
            className={`h-6 w-11 rounded-full transition ${darkMode ? "bg-dashboard" : "bg-gray-300"}`}
          >
            <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white transition ${darkMode ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </Card>

      <BackupRestoreSection />

      <Button variant="expense" outline onClick={logout} className="w-full">
        Log out
      </Button>
    </div>
  );
}

function ProfileSection({ userName, userEmail }: { userName: string; userEmail: string }) {
  const { t } = useLanguage();
  const [name, setName] = useState(userName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await settingsApi.updateProfile({
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">{t("settings.profile")}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {message && <p className="text-xs text-gray-500">{message}</p>}
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>{t("auth.email")}</Label>
          <Input value={userEmail} disabled />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Current password</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Card>
  );
}

function CompanySection({ business, onSaved }: { business: ReturnType<typeof useAuth>["business"]; onSaved: (b: NonNullable<ReturnType<typeof useAuth>["business"]>) => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState(business?.name ?? "");
  const [phone, setPhone] = useState(business?.phone ?? "");
  const [address, setAddress] = useState(business?.address ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsApi.updateBusiness({ name, phone: phone || null, address: address || null });
      onSaved(updated);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">{t("settings.company")}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>{t("auth.businessName")}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>{t("customers.phone")}</Label>
          <Input value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>{t("customers.address")}</Label>
          <Input value={address ?? ""} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <Button type="submit" disabled={saving}>
          {t("common.save")}
        </Button>
      </form>
    </Card>
  );
}

function BackupRestoreSection() {
  const { t } = useLanguage();
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRestoreFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("Restoring will replace your current products, categories, customers, suppliers, income and expenses. Continue?")) {
      e.target.value = "";
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await settingsApi.restore(payload);
      setMessage("Restore complete. Reload the page to see the updated data.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  }

  return (
    <Card>
      <h2 className="mb-3 text-sm font-semibold">{t("settings.backup")} / {t("settings.restore")}</h2>
      {message && <p className="mb-2 text-xs text-gray-500">{message}</p>}
      <div className="flex flex-wrap gap-2">
        <a href={settingsApi.backupUrl()} target="_blank" rel="noreferrer">
          <Button variant="dashboard" outline type="button">
            {t("settings.backup")}
          </Button>
        </a>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
          {restoring ? t("common.loading") : t("settings.restore")}
          <input type="file" accept="application/json" className="hidden" onChange={handleRestoreFile} disabled={restoring} />
        </label>
      </div>
    </Card>
  );
}
