const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency"
})

export function amountToCents(amount) {
  return Math.round(amount * 100)
}

export function centsToAmount(amountCents) {
  return amountCents / 100
}

export function formatCurrency(amount) {
  return currencyFormatter.format(amount)
}