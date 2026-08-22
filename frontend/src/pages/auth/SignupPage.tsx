import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Button, Input, Label } from "../../components/ui";

export function SignupPage() {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: "", name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(form);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-center text-lg font-semibold">{t("auth.signup")}</h2>
        {error && <p className="rounded-lg bg-expense-light px-3 py-2 text-sm text-expense">{error}</p>}
        <div>
          <Label>{t("auth.businessName")}</Label>
          <Input required value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
        </div>
        <div>
          <Label>{t("auth.yourName")}</Label>
          <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <Label>{t("auth.email")}</Label>
          <Input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <Label>{t("auth.password")}</Label>
          <Input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {t("auth.signup")}
        </Button>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-dashboard hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
