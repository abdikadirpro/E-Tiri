export function formatMoney(amount: number, currency = "USD") {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString();
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
