import sharp from 'sharp'
import { generateAndUploadDerivatives } from '../server/imageDerivatives'
// Mock S3 client: swallows puts, counts bytes, no network.
let putBytes = 0, puts = 0
const client: any = { send: async (cmd: any) => { const b = cmd.input?.Body; if (b) { putBytes += b.length; puts++ } return {} } }
async function makePhoto(w: number, h: number) {
  // noisy photo-like JPEG so it doesn't compress to nothing
  const raw = Buffer.alloc(w * h * 3); for (let i = 0; i < raw.length; i++) raw[i] = (i * 7919 + (i >> 9) * 31) & 255
  return sharp(raw, { raw: { width: w, height: h, channels: 3 } }).jpeg({ quality: 92 }).toBuffer()
}
const conc = Number(process.env.CONC || 1)
const src = await makePhoto(Number(process.env.W||4000), Number(process.env.H||3000))
console.log('source bytes', src.length)
let peak = 0; const mon = setInterval(() => { peak = Math.max(peak, process.memoryUsage().rss) }, 50)
const t0 = process.hrtime.bigint(); const c0 = process.cpuUsage()
await Promise.all(Array.from({ length: conc }, (_, i) => generateAndUploadDerivatives({ client, bucket: 'x', originalKey: `dealers/1-x/hero/${i}.jpg`, sourceBuffer: src, mime: 'image/jpeg' })))
const wall = Number(process.hrtime.bigint() - t0) / 1e6; const cu = process.cpuUsage(c0); clearInterval(mon)
console.log(JSON.stringify({ concurrentUploads: conc, wall_s: +(wall / 1000).toFixed(1), cpu_s: +((cu.user + cu.system) / 1e6).toFixed(1), cpu_s_per_upload: +((cu.user + cu.system) / 1e6 / conc).toFixed(1), derivativesWritten: puts, derivativeMB: +(putBytes / 1048576).toFixed(1), peakRssMB: Math.round(peak / 1048576), threads: sharp.concurrency() }))
process.exit(0)
