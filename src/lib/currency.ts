/**
 * Formatea un monto numérico como moneda. `currency` es un código ISO 4217
 * (ej. "USD", "MXN") tomado de store_settings.currency.
 */
export function formatCurrency(amount: number, currency: string, locale = "es"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
