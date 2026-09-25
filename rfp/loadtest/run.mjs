import autocannon from 'autocannon'
import { execSync } from 'child_process'
import jwt from 'jsonwebtoken'
import { cpu } from './cpu.mjs'
const BASE = process.env.BASE || 'http://localhost:3101'
const SECRET = 'loadtest-secret'
const admin = jwt.sign({ role: 'admin', sub: 1 }, SECRET, { expiresIn: '8h' })
const dealerTok = (id, name='LT') => jwt.sign({ role: 'dealer', sub: id, name, email: `lt-dealer-${id}@loadtest.local` }, SECRET, { expiresIn: '8h' })
const ids = JSON.parse(process.env.IDS || '[]')
const scenarios = {
  public_site_100hosts: { requests: Array.from({length:100},(_,i)=>({ path: `/api/public/site?host=stihlshoploadtown${i+1}.co.nz` })) },
  admin_dealers: { requests: [{ path: '/api/admin/dealers', headers: { authorization: `Bearer ${admin}` } }] },
  admin_change_requests: { requests: [{ path: '/api/admin/change-requests', headers: { authorization: `Bearer ${admin}` } }] },
  admin_messages: { requests: [{ path: '/api/admin/messages', headers: { authorization: `Bearer ${admin}` } }] },
  report_dealers: { requests: [{ path: '/api/report/dealers' }] },
  dealer_portal_mix: { requests: ids.flatMap(id => ['/api/dealer/me','/api/dealer/profile','/api/dealer/change-requests','/api/dealer/messages'].map(p => ({ path: p, headers: { authorization: `Bearer ${dealerTok(id)}` } }))) },
  dealer_edit_draft_write: { requests: ids.map(id => ({ method: 'POST', path: '/api/dealer/edit-draft', headers: { authorization: `Bearer ${dealerTok(id)}`, 'content-type': 'application/json' }, body: JSON.stringify({ draft: { businessEssentials: { tagline: 'load ' + Math.random() } } }) })) },
  health: { requests: [{ path: '/api/health' }] },
}
const name = process.argv[2]; const conns = Number(process.argv[3] || 20); const dur = Number(process.argv[4] || 15)
const sc = scenarios[name]; if (!sc) { console.error('unknown', name); process.exit(1) }
const before = cpu()
const r = await autocannon({ url: BASE, connections: conns, duration: dur, requests: sc.requests })
const after = cpu()
const cpuSec = after.cpu - before.cpu
console.log(JSON.stringify({ scenario: name, conns, dur, reqTotal: r.requests.total, rps: r.requests.average, lat_p50: r.latency.p50, lat_p97: r.latency.p97_5, lat_max: r.latency.max, non2xx: r.non2xx, errors: r.errors, timeouts: r.timeouts, MBps: +(r.throughput.average/1e6).toFixed(2), serverCpuSec: cpuSec, cpuMsPerReq: +((cpuSec*1000)/Math.max(1,r.requests.total)).toFixed(2), rssMB_before: before.rssMB, rssMB_after: after.rssMB }))
