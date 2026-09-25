import { hash, verify } from 'argon2'
const h = await hash('LoadTest1234!')
const t0 = process.hrtime.bigint(); const c0 = process.cpuUsage()
for (let i = 0; i < 20; i++) await verify(h, 'LoadTest1234!')
const ms = Number(process.hrtime.bigint() - t0) / 1e6 / 20
const cu = process.cpuUsage(c0)
console.log(JSON.stringify({ argon2_verify_wall_ms: +ms.toFixed(1), cpu_ms_per_verify: +(((cu.user + cu.system) / 1000) / 20).toFixed(1), rss_MB: Math.round(process.memoryUsage().rss / 1048576) }))
