import jwt from 'jsonwebtoken'
import { execSync } from 'child_process'
const BASE = 'http://localhost:3101', SECRET = 'loadtest-secret'
const ids = JSON.parse(process.env.IDS); const N = Number(process.argv[2] || 200)
const admin = jwt.sign({ role: 'admin', sub: 1 }, SECRET)
const rss = () => { const pid = execSync("pgrep -f 'tsx server/index.ts' | head -1").toString().trim(); return Math.round(+execSync(`ps -o rss= -p ${pid}`).toString().trim() / 1024) }
const rss0 = rss()
let received = 0; const t = { start: 0 }; const acs = []
let opened = 0
await Promise.all(Array.from({ length: N }, async (_, i) => {
  const id = ids[i % ids.length]; const tok = jwt.sign({ role: 'dealer', sub: id, name: 'x', email: 'x' }, SECRET)
  const ac = new AbortController(); acs.push(ac)
  const res = await fetch(`${BASE}/api/dealer/events?token=${tok}`, { signal: ac.signal }); opened++
  ;(async () => { const rd = res.body.getReader(); const dec = new TextDecoder(); while (true) { const { value, done } = await rd.read(); if (done) break; const s = dec.decode(value); if (s.includes('profile-updated')) { received++; if (received === N) t.all = performance.now() } } })().catch(() => {})
}))
await new Promise(r => setTimeout(r, 1500)); const rss1 = rss()
t.start = performance.now()
const target = ids[0]
const r = await fetch(`${BASE}/api/admin/dealers/${target}/website-toggle`, { method: 'POST', headers: { authorization: `Bearer ${admin}`, 'content-type': 'application/json' }, body: JSON.stringify({ active: true }) })
const toggleMs = performance.now() - t.start
await new Promise(r => setTimeout(r, 3000))
console.log(JSON.stringify({ sseOpened: opened, rssMB_idle: rss0, rssMB_withSSE: rss1, toggleStatus: r.status, toggleMs: +toggleMs.toFixed(0), broadcastReceived: received, fanoutMs: t.all ? +(t.all - t.start).toFixed(0) : null }))
acs.forEach(a => a.abort()); process.exit(0)
