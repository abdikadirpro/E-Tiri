import { FormEvent, useState } from "react";
import { AuthLayout } from "../../layouts/AuthLayout";
import { adminApi } from "../../api/endpoints";
import { Button, Input, Label } from "../../components/ui";

// Not linked from anywhere in the public UI. Only reachable by someone who knows
// this URL and holds the ADMIN_KEY configured on the backend — used to provision
// a new business + owner account (registration is intentionally not self-service).
export function CreateBusinessPage() {
  const [adminKey, setAdminKey] = useState("");
  const [form, setForm] = useState({ businessName: "", name: "", email: "", password: "", currency: "USD" });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ businessName: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await adminApi.createBusiness(adminKey, form);
      setResult({ businessName: form.businessName, email: form.email });
      setForm({ businessName: "", name: "", email: "", password: "", currency: "USD" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="mb-4 text-center text-lg font-semibold">Create Business (admin only)</h2>

      {result && (
        <p className="mb-4 rounded-lg bg-income-light px-3 py-2 text-sm text-income">
          Created "{result.businessName}". Give the owner these login details: <strong>{result.email}</strong> and the password you set.
        </p>
      )}
      {error && <p className="mb-4 rounded-lg bg-expense-light px-3 py-2 text-sm text-expense">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label>Admin key</Label>
          <Input type="password" required value={adminKey} onChange={(e) => setAdminKey(e.target.value)} />
        </div>
        <div>
          <Label>Business name</Label>
          <Input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
        </div>
        <div>
          <Label>Owner name</Label>
          <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <Label>Owner email</Label>
          <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <Label>Owner password</Label>
          <Input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <div>
          <Label>Currency</Label>
          <Input value={form.currency} onChange={(e) => update("currency", e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          Create business
        </Button>
      </form>
    </AuthLayout>
  );
}
