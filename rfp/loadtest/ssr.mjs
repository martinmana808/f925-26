import autocannon from 'autocannon'
import { execSync } from 'child_process'
function cpu(port) { const pid = execSync(`lsof -iTCP:${port} -sTCP:LISTEN -t`).toString().trim().split(/\s+/)[0]; const out = execSync(`ps -o cputime=,rss= -p ${pid}`).toString().trim().split(/\s+/); const p = out[0].split(':').map(Number); return { cpu: p.length === 3 ? p[0]*3600+p[1]*60+p[2] : p[0]*60+p[1], rssMB: Math.round(out[1]/1024) } }
const [,, path = '/', c = '20', d = '20', nhosts = '100'] = process.argv
const requests = Array.from({ length: Number(nhosts) }, (_, i) => ({ path, headers: { host: `stihlshoploadtown${i + 1}.co.nz`, accept: 'text/html' } }))
const b = cpu(3200); const bp = cpu(3101)
const r = await autocannon({ url: 'http://localhost:3200', connections: Number(c), duration: Number(d), requests, timeout: 30 })
const a = cpu(3200); const ap = cpu(3101)
console.log(JSON.stringify({ path, conns: +c, hosts: +nhosts, reqTotal: r.requests.total, rps: +r.requests.average.toFixed(1), lat_p50: r.latency.p50, lat_p97: r.latency.p97_5, lat_max: r.latency.max, non2xx: r.non2xx, errors: r.errors, codes: r.statusCodeStats, MBps: +(r.throughput.average/1e6).toFixed(2), siteCpuMsPerReq: +(((a.cpu-b.cpu)*1000)/Math.max(1,r.requests.total)).toFixed(2), siteRssMB: a.rssMB, platformCpuSecDuringRun: +(ap.cpu-bp.cpu).toFixed(2) }))
