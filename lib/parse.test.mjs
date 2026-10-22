// node --test lib/parse.test.mjs
import assert from 'node:assert'
import { test } from 'node:test'
import { parsePrice, parseProduct, safeNext } from './parse.ts'

test('parsePrice', () => {
  assert.strictEqual(parsePrice(''), null)
  assert.strictEqual(parsePrice('649'), 649)
  assert.strictEqual(parsePrice('649 kr.'), 649)
  assert.strictEqual(parsePrice('1.299 kr.'), 1299)
  assert.strictEqual(parsePrice('649.00'), 649)
  assert.strictEqual(parsePrice('1.299,95'), 1299.95)
  assert.strictEqual(parsePrice('1,299.50'), 1299.5)
  assert.ok(Number.isNaN(parsePrice('cheap')))
})

test('parseProduct', () => {
  const html = `<title>Fallback</title>
    <meta content="Wool blanket, grey" property="og:title">
    <meta property="og:image" content="/img/blanket.jpg">
    <meta property="product:price:amount" content="649.00">
    <meta property="og:site_name" content="Example &amp; Co">`
  assert.deepStrictEqual(parseProduct(html, 'https://www.shop.dk/p/1'), {
    title: 'Wool blanket, grey', price: '649.00', currency: '', store: 'Example & Co', imageUrl: 'https://www.shop.dk/img/blanket.jpg',
  })
  const bare = parseProduct('<title>Lamp</title><script>{"price": "299", "priceCurrency": "usd"}</script><meta property="og:image" content="javascript:alert(1)">', 'https://www.lamps.dk/x')
  assert.deepStrictEqual(bare, { title: 'Lamp', price: '299', currency: 'USD', store: 'lamps.dk', imageUrl: '' })
  assert.strictEqual(parseProduct('<meta property="product:price:currency" content="EUR">', 'https://a.de/').currency, 'EUR')
  // Shopify: product JSON in cents comes first, the JSON-LD offer has the real price.
  const shopify = parseProduct(`<script>var meta = {"product":{"variants":[{"price":10999}]}}</script>
    <script type="application/ld+json">{"@type": "Product", "offers": [{"@type" : "Offer", "price" : 109.99, "priceCurrency" : "EUR"}]}</script>`, 'https://shop.eu/p')
  assert.strictEqual(shopify.price, '109.99')
  assert.strictEqual(shopify.currency, 'EUR')
})

test('daysToGo', async () => {
  const { daysToGo } = await import('./occasions.ts')
  const today = new Date(2026, 9, 6, 23, 30) // late evening still counts as the 6th
  assert.strictEqual(daysToGo('2026-10-18', today), '12 days to go')
  assert.strictEqual(daysToGo('2026-10-07', today), 'Tomorrow')
  assert.strictEqual(daysToGo('2026-10-06', today), 'Today')
  assert.strictEqual(daysToGo('2026-10-01', today), null)
  assert.strictEqual(daysToGo(null, today), null)
})

test('parseProduct stays linear on unclosed tags', () => {
  // 1 MB of openers with no closing '>' used to make the tag regexes backtrack quadratically.
  for (const opener of ['<meta', '<title', '<script type="application/ld+json">']) {
    const start = performance.now()
    parseProduct(opener.repeat(Math.ceil(1_000_000 / opener.length)), 'https://shop.example/')
    assert.ok(performance.now() - start < 1000, `${opener} took ${Math.round(performance.now() - start)} ms`)
  }
})

test('safeNext keeps same-site paths only', () => {
  assert.equal(safeNext('/l/abc123'), '/l/abc123')
  for (const bad of ['', 'https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)']) assert.equal(safeNext(bad), '/lists')
})
