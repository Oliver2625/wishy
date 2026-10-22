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
  // Tags are cut out with indexOf, not by regexes over the whole page: on a page of unclosed "<meta"
  // those regexes backtrack over the rest of the input from every opener (quadratic CPU on 1 MB).
  // Each search resumes after the previous tag, so the pieces never overlap and total at most the page.
  const lower = html.toLowerCase()
  const tags = (open: string, close: string) => {
    const out: string[] = []
    for (let i = lower.indexOf(open); i >= 0; ) {
      const end = lower.indexOf(close, i)
      if (end < 0) break
      out.push(html.slice(i, end + close.length))
      i = lower.indexOf(open, end + close.length)
    }
    return out
  }
  const metas = tags('<meta', '>')
  const meta = (key: string) => {
    const attr = new RegExp(`(?:property|name|itemprop)=["']${key}["']`, 'i')
    const v = metas.find((t) => attr.test(t))?.match(/content=["']([^"']*)["']/i)?.[1]
    return v ? decode(v) : undefined
  }
  // schema.org JSON-LD carries the shop's real price (109.99). Other inline JSON can be in cents
  // (Shopify's product object says 10999), so the page-wide match is only the last resort.
  const ld = tags('<script', '</script>')
    .map((s) => ({ open: s.slice(0, s.indexOf('>') + 1), body: s.slice(s.indexOf('>') + 1, -'</script>'.length) }))
    .filter((s) => /application\/ld\+json/i.test(s.open))
    .map((s) => s.body).join('\n')
  const titleOpen = lower.indexOf('<title')
  const titleStart = titleOpen < 0 ? -1 : lower.indexOf('>', titleOpen)
  const titleEnd = titleStart < 0 ? -1 : html.indexOf('<', titleStart + 1)
  const titleText = titleStart < 0 ? '' : html.slice(titleStart + 1, titleEnd < 0 ? undefined : titleEnd)
  // Separators only between digits, so JSON's trailing comma ("price": 109.99,) isn't read as a decimal mark.
  const jsonPrice = (s: string) => s.match(/"price"\s*:\s*"?(\d+(?:[.,]\d+)*)/)?.[1]
  const image = meta('og:image') ?? meta('twitter:image')
  const imageUrl = image ? new URL(image, pageUrl) : undefined
  return {
    title: meta('og:title') ?? decode(titleText),
    price: meta('product:price:amount') ?? meta('og:price:amount') ?? meta('price') ?? jsonPrice(ld) ?? jsonPrice(html) ?? '',
    // ISO code like "USD", or '' when the page doesn't say (then the price is taken as-is).
    currency: (meta('product:price:currency') ?? meta('og:price:currency') ?? meta('priceCurrency')
      ?? html.match(/"priceCurrency"\s*:\s*"([A-Za-z]{3})"/)?.[1] ?? '').toUpperCase(),
    store: meta('og:site_name') ?? new URL(pageUrl).hostname.replace(/^www\./, ''),
    imageUrl: imageUrl && /^https?:$/.test(imageUrl.protocol) ? imageUrl.href : '',
  }
}

// Where to go after sign-in: only a path on this site ("/l/abc"), never "//evil.com" or "/\evil.com".
export const safeNext = (next: string) => /^\/(?![/\\])/.test(next) ? next : '/lists'
