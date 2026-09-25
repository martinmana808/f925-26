import autocannon from 'autocannon'
const [,, url, c = '50', d = '30', hostsSpec = ''] = process.argv
const hosts = hostsSpec ? hostsSpec.split(',') : []
const requests = hosts.length ? hosts.map(h => ({ path: new URL(url).pathname, headers: { host: h } })) : undefined
const r = await autocannon({ url, connections: Number(c), duration: Number(d), requests, timeout: 30 })
console.log(JSON.stringify({ url, conns: +c, dur: +d, reqTotal: r.requests.total, rps: +r.requests.average.toFixed(1), lat_p50: r.latency.p50, lat_p97: r.latency.p97_5, lat_p99: r.latency.p99, lat_max: r.latency.max, non2xx: r.non2xx, errors: r.errors, timeouts: r.timeouts, codes: r.statusCodeStats, MBps: +(r.throughput.average/1e6).toFixed(2) }))
