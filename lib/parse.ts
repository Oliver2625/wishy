// Pure helpers (no server deps) so lib/parse.test.mjs can run them directly.

// "649 kr." → 649, "1.299 kr." → 1299, "1,299.50" → 1299.5, "" → null, garbage → NaN.
// A separator followed by exactly 3 digits is read as a thousands separator.
export function parsePrice(input: string): number | null {
  let t = input.replace(/[^\d.,]/g, '')
  if (!/\d/.test(t)) return input.trim() ? NaN : null
  const last = Math.max(t.lastIndexOf('.'), t.lastIndexOf(','))
  const decimals = t.length - last - 1
  t = last >= 0 && decimals !== 3
    ? t.slice(0, last).replace(/[.,]/g, '') + '.' + t.slice(last + 1)
    : t.replace(/[.,]/g, '')
  const n = Number(t)
  return n < 1e8 ? n : NaN
}

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()

// Name, price, store and photo from a product page's Open Graph / schema.org tags.
export function parseProduct(html: string, pageUrl: string) {
  const meta = (key: string) => {
    const tag = html.match(new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]*>`, 'i'))?.[0]
    const v = tag?.match(/content=["']([^"']*)["']/i)?.[1]
    return v ? decode(v) : undefined
  }
  const image = meta('og:image') ?? meta('twitter:image')
  const imageUrl = image ? new URL(image, pageUrl) : undefined
  return {
    title: meta('og:title') ?? decode(html.match(/<title[^>]*>([^<]*)/i)?.[1] ?? ''),
    price: meta('product:price:amount') ?? meta('og:price:amount') ?? meta('price')
      ?? html.match(/"price"\s*:\s*"?(\d[\d.,]*)/)?.[1] ?? '',
    // ISO code like "USD", or '' when the page doesn't say (then the price is taken as-is).
    currency: (meta('product:price:currency') ?? meta('og:price:currency') ?? meta('priceCurrency')
      ?? html.match(/"priceCurrency"\s*:\s*"([A-Za-z]{3})"/)?.[1] ?? '').toUpperCase(),
    store: meta('og:site_name') ?? new URL(pageUrl).hostname.replace(/^www\./, ''),
    imageUrl: imageUrl && /^https?:$/.test(imageUrl.protocol) ? imageUrl.href : '',
  }
}
