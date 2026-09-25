import { execSync } from 'child_process'
export function cpu() {
  try {
    const pids = execSync('lsof -iTCP:3101 -sTCP:LISTEN -t').toString().trim().split(/\s+/)
    let best = { cpu: 0, rssMB: 0 }
    for (const pid of pids) {
      const out = execSync(`ps -o cputime=,rss= -p ${pid}`).toString().trim().split(/\s+/)
      if (out.length < 2) continue
      const parts = out[0].split(':').map(Number)
      const secs = parts.length === 3 ? parts[0]*3600+parts[1]*60+parts[2] : parts[0]*60+parts[1]
      const rssMB = Math.round(out[1]/1024)
      if (rssMB > best.rssMB) best = { cpu: secs, rssMB }
    }
    return best
  } catch { return { cpu: 0, rssMB: 0 } }
}
