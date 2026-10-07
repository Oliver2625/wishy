// Currencies a profile can pick. All are on the ECB list, so toCurrency can convert between any two.
export const CURRENCIES = { DKK: 'Danish krone (kr.)', SEK: 'Swedish krona', NOK: 'Norwegian krone', EUR: 'Euro (€)', GBP: 'British pound (£)', USD: 'US dollar ($)' }
export type Currency = keyof typeof CURRENCIES
export const isCurrency = (c: unknown): c is Currency => typeof c === 'string' && Object.hasOwn(CURRENCIES, c)

export const formatPrice = (p: string | number | null, currency = 'DKK') =>
  p === null || p === '' || Number.isNaN(Number(p))
    ? ''
    : new Intl.NumberFormat('da-DK', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(p))

// Today's ECB rate via Frankfurter (free, no key). Whole units, like the rest of the app. null if it can't convert.
export async function toCurrency(amount: number, from: string, to: string) {
  if (from === to) return amount
  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) return null
  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`, { signal: AbortSignal.timeout(4000) })
    const rate = res.ok ? (await res.json()).rates?.[to] : undefined
    return typeof rate === 'number' ? Math.round(amount * rate) : null
  } catch {
    return null
  }
}
