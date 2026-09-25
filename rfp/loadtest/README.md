# Unify load-test kit

Scripts used for the 10 Sep 2026 capacity test of the Unify platform (`f925-limited/multi-tenancy`)
and the dealer site (`f925-limited/stihl-dealers-website-template`). Everything here is
re-runnable by the team. The full write-up (results, cost model, runbook) is the
"Unify at 100 Dealers" artifact.

## 1. Read-only test against production (safe, GET only)

```bash
cd rfp/loadtest && npm install            # installs autocannon + jsonwebtoken
# platform API that every dealer site calls (50 / 150 / 300 connections, 30 s)
node prod.mjs "https://stihlshop-platform.f925.works/api/public/site?host=stihlshoptauranga.co.nz" 50 30
node prod.mjs "https://stihlshop-platform.f925.works/api/public/site?host=stihlshoptauranga.co.nz" 150 30
# a dealer homepage (this is the one that saturates first)
node prod.mjs "https://stihlshoptauranga.co.nz/" 50 30
node prod.mjs "https://stihlshoptauranga.co.nz/" 150 30
```

Watch `non2xx`, `timeouts`, `lat_p97`. Pass = zero non-2xx and p97 under 3 s at 50
connections. Keep the DigitalOcean app Insights tab open in another window to see CPU
and memory of the instance during the run. Run outside NZ business hours.

## 2. Local test with 100 seeded dealers (writes, uploads, realtime)

```bash
# in a clone of multi-tenancy/platform, with local Postgres running
createdb -T stihl_mt_leo stihl_lt                       # copy of the dev DB
cp ../../f925-26/rfp/loadtest/seedLoadTest.ts scripts/  # seeds 100 dealers + domains + requests
cat > .env <<EOF
DATABASE_URL=postgresql://localhost:5432/stihl_lt
JWT_SECRET=loadtest-secret
PLATFORM_URL=http://localhost:3101
ADMIN_INITIAL_PASSWORD=root
PORT=3101
NODE_ENV=production
EOF
npx tsx scripts/seedLoadTest.ts
NODE_OPTIONS=--max-old-space-size=800 npx tsx server/index.ts &   # 1 GB cap like the DO instance

cd ../../f925-26/rfp/loadtest && bash runall.sh   # every scenario + SSE fan-out (200 and 500 tabs)
```

`run.mjs` mints admin/dealer JWTs with the `loadtest-secret` key, so no OTP emails are
sent. It reports CPU milliseconds per request of the server process. Multiply local
(Apple Silicon) CPU by about 4.6 to estimate a DigitalOcean shared vCPU (that factor was
cross-checked against the production run: 5.4 ms local ≈ 35 req/s measured on DO).

## 3. Dealer-site SSR cost across 100 hosts

```bash
# in a clone of stihl-dealers-website-template/frontend, platform running on :3101
npm install && npm run build
PLATFORM_API_URL=http://localhost:3101 PORT=3200 NODE_ENV=production node build/index.js &
cd ../../f925-26/rfp/loadtest && node ssr.mjs / 20 20 100 && node ssr.mjs /products 20 20 100
```

## 4. Image upload cost (the platform's biggest CPU/memory hit)

```bash
# in multi-tenancy/platform
cp ../../f925-26/rfp/loadtest/sharpBench.ts scripts/
CONC=1 npx tsx scripts/sharpBench.ts        # one dealer uploading one 5 MB photo
CONC=3 npx tsx scripts/sharpBench.ts        # three dealers at once → watch peakRssMB
UV_THREADPOOL_SIZE=1 VIPS_CONCURRENCY=1 CONC=1 npx tsx scripts/sharpBench.ts   # ~1 vCPU
```

Uses a mock S3 client, so nothing is written to Spaces.

## 5. Password hashing cost

```bash
cp ../../f925-26/rfp/loadtest/argonBench.mjs scripts/ && node scripts/argonBench.mjs
```
