// node --test lib/fetch-page.test.mjs   (no network: DNS is faked, private addresses never connect)
import assert from 'node:assert'
import dns from 'node:dns'
import { syncBuiltinESMExports } from 'node:module'
import { mock, test } from 'node:test'

// Fake DNS before importing the module: every name resolves to a private address, like a rebinding host would at connect time.
let lookups = 0
mock.method(dns, 'lookup', (host, opts, cb) => { lookups++; cb(null, [{ address: '10.0.0.5', family: 4 }]) })
syncBuiltinESMExports()
const { fetchPublicPage } = await import('./fetch-page.ts')

const rejects = (url, msg) => assert.rejects(fetchPublicPage(url), { message: msg })

test('hostnames are checked when the socket connects', async () => {
  await rejects('http://shop.example/product', 'That address isn’t allowed.')
  assert.ok(lookups > 0, 'the connect-time lookup ran')
})

test('IP literals, odd ports and schemes are refused before connecting', async () => {
  for (const url of ['http://127.0.0.1/', 'http://169.254.169.254/latest/meta-data', 'http://[::1]/',
    'http://[::ffff:127.0.0.1]/', 'http://[fe80::1]/', 'http://0.0.0.0/'])
    await rejects(url, 'That address isn’t allowed.')
  for (const url of ['https://example.com:8443/', 'file:///etc/passwd', 'http://user@example.com/'])
    await rejects(url, 'Only normal http(s) links are supported.')
})
