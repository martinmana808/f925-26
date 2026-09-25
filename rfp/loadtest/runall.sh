#!/bin/bash
export IDS=$(psql -d stihl_lt -tAc "select json_agg(id) from platform_dealer_users where email like 'lt-dealer-%'")
while read -r name c d; do node run.mjs "$name" "$c" "$d" 2>&1 | tail -1; sleep 2; done <<LIST
health 50 10
public_site_100hosts 20 20
public_site_100hosts 100 20
admin_dealers 20 15
admin_change_requests 20 15
admin_messages 20 15
report_dealers 20 15
dealer_portal_mix 50 20
dealer_portal_mix 200 20
dealer_edit_draft_write 50 15
LIST
echo "-- SSE fan-out 200 / 500 --"
node sse.mjs 200; sleep 2; node sse.mjs 500
