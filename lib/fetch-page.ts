// Server-only by nature (node:http/dns). Not marked 'server-only' so lib/fetch-page.test.mjs can import it.
import { lookup as dnsLookup, type LookupAddress } from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import { BlockList, isIP, type LookupFunction } from 'node:net'

// The server fetches user-supplied URLs, so refuse anything that isn't the public internet (SSRF).
// IPv4-mapped IPv6 (::ffff:a.b.c.d) is matched against the IPv4 rules by BlockList itself.
const blocked = new BlockList()
for (const [net, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 3]] as const) blocked.addSubnet(net, bits, 'ipv4')
for (const [net, bits] of [['::', 127], ['64:ff9b::', 96], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]] as const)
  blocked.addSubnet(net, bits, 'ipv6')

const isBlocked = (address: string) => blocked.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4')
const notAllowed = () => new Error('That address isn’t allowed.')

// Runs when the socket connects, so the address checked is the address used (no DNS-rebinding window).
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (err, addrs: LookupAddress[]) => {
    if (err) return callback(err, '', 0)
    if (!addrs.length || addrs.some((a) => isBlocked(a.address))) return callback(notAllowed(), '', 0)
    if (options.all) callback(null, addrs)
    else callback(null, addrs[0].address, addrs[0].family)
  })
}

const MAX_BYTES = 1_000_000
const TIMEOUT_MS = 6000

type Res = { status: number; location: string | null; body: AsyncIterable<Uint8Array>; close: () => void }
const headers = { 'user-agent': 'Mozilla/5.0 (compatible; Wishy/1.0)', accept: 'text/html', 'accept-encoding': 'identity' }

// Node (next dev, self-hosting): connect-time address check via safeLookup.
function getNode(url: URL): Promise<Res> {
  return new Promise((resolve, reject) => {
    const req = (url.protocol === 'https:' ? https : http).get(url, { lookup: safeLookup, timeout: TIMEOUT_MS, headers }, (res) =>
      resolve({ status: res.statusCode ?? 0, location: res.headers.location ?? null, body: res, close: () => res.destroy() }))
    req.on('timeout', () => req.destroy(Object.assign(new Error('Timed out'), { code: 'ETIMEDOUT' })))
    req.on('error', reject)
  })
}

// Cloudflare Workers: no `lookup` hook, and no private network or metadata endpoint behind a Worker
// to reach, so plain fetch. Scheme, port, IP-literal and redirect checks still run on every hop.
async function getWorkers(url: URL): Promise<Res> {
  const res = await fetch(url, { redirect: 'manual', headers, signal: AbortSignal.timeout(TIMEOUT_MS) })
  return { status: res.status, location: res.headers.get('location'), body: read(res.body), close: () => void res.body?.cancel().catch(() => {}) }
}

async function* read(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return
  const reader = stream.getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) return
    yield value
  }
}

const onWorkers = typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers'
const get = onWorkers ? getWorkers : getNode

export async function fetchPublicPage(raw: string): Promise<{ html: string; url: string }> {
  let url = new URL(raw)
  for (let hop = 0; hop < 4; hop++) {
    if (!/^https?:$/.test(url.protocol) || (url.port && !['80', '443'].includes(url.port)) || url.username)
      throw new Error('Only normal http(s) links are supported.')
    // IP literals skip DNS, so safeLookup never sees them: check here.
    const host = url.hostname.replace(/^\[|\]$/g, '')
    if (isIP(host) && isBlocked(host)) throw notAllowed()

    const res = await get(url)
    if (res.status >= 300 && res.status < 400 && res.location) {
      res.close()
      url = new URL(res.location, url)
      continue
    }
    if (res.status < 200 || res.status >= 300) { res.close(); throw new Error(`The shop answered ${res.status}.`) }

    // Read at most MAX_BYTES; product meta tags live in <head>.
    const chunks: Uint8Array[] = []
    let size = 0
    for await (const chunk of res.body) {
      chunks.push(chunk)
      size += chunk.length
      if (size >= MAX_BYTES) break
    }
    res.close()
    return { html: new TextDecoder().decode(Buffer.concat(chunks)), url: url.href }
  }
  throw new Error('Too many redirects.')
}
