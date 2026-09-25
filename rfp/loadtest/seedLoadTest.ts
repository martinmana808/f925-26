import 'dotenv/config'
import { hash } from 'argon2'
import { sql } from '../server/db.js'
const N = Number(process.env.SEED_N || 100)
async function main() {
  const src = await sql`SELECT p.profile_data FROM platform_dealer_profiles p JOIN platform_dealer_users u ON u.id=p.dealer_user_id WHERE u.email='f925.limited@gmail.com' LIMIT 1`
  const template = src[0]?.profile_data || {}
  const pw = await hash('LoadTest1234!')
  for (let i = 1; i <= N; i++) {
    const email = `lt-dealer-${i}@loadtest.local`
    const name = `STIHL SHOP LoadTown ${i}`
    const rows = await sql`INSERT INTO platform_dealer_users (email,name,password_hash,status,website_active,website_activated_at)
      VALUES (${email},${name},${pw},'active',true,NOW()) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`
    const id = rows[0].id
    const prof = JSON.parse(JSON.stringify(template))
    if (prof.businessEssentials) { prof.businessEssentials.name = name; prof.businessEssentials.city = `LoadTown ${i}` }
    await sql`INSERT INTO platform_dealer_profiles (dealer_user_id, profile_data) VALUES (${id}, ${sql.json(prof)}) ON CONFLICT (dealer_user_id) DO UPDATE SET profile_data=EXCLUDED.profile_data`
    await sql`INSERT INTO platform_dealer_domains (dealer_user_id, domain, is_primary) VALUES (${id}, ${`stihlshoploadtown${i}.co.nz`}, true) ON CONFLICT (domain) DO NOTHING`
    for (let r = 0; r < 5; r++) {
      await sql`INSERT INTO platform_change_requests (dealer_user_id,status,profile_snapshot,changes) VALUES (${id}, ${r % 2 ? 'done' : 'pending'}, ${sql.json(prof)}, ${sql.json([{id:'businessEssentials.tagline',section:'Business Essentials',field:'Tagline',oldValue:'a',newValue:'b'}])})`
      await sql`INSERT INTO platform_change_request_messages (dealer_user_id,sender_type,sender_label,body,admin_unread) VALUES (${id},'dealer',${name},${'Hello from '+name+' #'+r}, true)`
    }
  }
  const c = await sql`SELECT count(*) FROM platform_dealer_users`
  console.log('dealers now', c[0].count)
  await sql.end()
}
main().catch(e => { console.error(e); process.exit(1) })
