import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SVGProps } from "react";

type Variant = "income" | "expense" | "dashboard" | "reports";

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

const variantSolid: Record<Variant, string> = {
  income: "bg-income text-white hover:bg-income/90 shadow-sm shadow-income/20",
  expense: "bg-expense text-white hover:bg-expense/90 shadow-sm shadow-expense/20",
  dashboard: "bg-dashboard text-white hover:bg-dashboard/90 shadow-sm shadow-dashboard/20",
  reports: "bg-reports text-white hover:bg-reports/90 shadow-sm shadow-reports/20",
};

export function Button({
  variant = "dashboard",
  outline = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; outline?: boolean }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed";
  const style = outline
    ? "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
    : variantSolid[variant];
  return <button className={`${base} ${style} ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  variant = "dashboard",
}: {
  label: string;
  value: ReactNode;
  variant?: Variant;
}) {
  const colorClasses: Record<Variant, string> = {
    income: "from-income-light/80 to-income-light/30 text-income dark:from-income-dark/30 dark:to-income-dark/10 dark:text-green-300",
    expense: "from-expense-light/80 to-expense-light/30 text-expense dark:from-expense-dark/30 dark:to-expense-dark/10 dark:text-red-300",
    dashboard:
      "from-dashboard-light/80 to-dashboard-light/30 text-dashboard dark:from-dashboard-dark/30 dark:to-dashboard-dark/10 dark:text-blue-300",
    reports: "from-reports-light/80 to-reports-light/30 text-reports dark:from-reports-dark/30 dark:to-reports-dark/10 dark:text-orange-300",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br p-4 shadow-sm ${colorClasses[variant]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

export function Badge({ children, variant = "dashboard" }: { children: ReactNode; variant?: Variant | "neutral" }) {
  const colorClasses: Record<string, string> = {
    income: "bg-income-light text-income",
    expense: "bg-expense-light text-expense",
    dashboard: "bg-dashboard-light text-dashboard",
    reports: "bg-reports-light text-reports",
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClasses[variant]}`}>{children}</span>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-dashboard focus:ring-2 focus:ring-dashboard/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">{children}</label>;
}

export function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-dashboard focus:ring-2 focus:ring-dashboard/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Search..."} />
  );
}

export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input type="date" value={from} onChange={(e) => onChange({ from: e.target.value, to })} />
      <span className="text-gray-400">-</span>
      <Input type="date" value={to} onChange={(e) => onChange({ from, to: e.target.value })} />
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="py-10 text-center text-sm text-gray-400">{message}</div>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  headerClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: "md" | "lg";
  headerClassName?: string;
}) {
  if (!open) return null;
  const maxWidth = size === "lg" ? "max-w-3xl" : "max-w-md";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10 sm:rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between gap-3 rounded-t-2xl px-5 py-4 ${headerClassName}`}>
          <div className="flex-1">
            {typeof title === "string" ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : title}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 pb-5 pt-1">{children}</div>
      </div>
    </div>
  );
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  renderRow,
  emptyMessage = "No data found",
}: {
  columns: string[];
  rows: T[];
  renderRow: (row: T) => ReactNode;
  emptyMessage?: string;
}) {
  if (!rows.length) return <EmptyState message={emptyMessage} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-800">
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{rows.map((row) => renderRow(row))}</tbody>
      </table>
    </div>
  );
}
