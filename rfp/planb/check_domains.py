#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check availability of the stihlshop<town>.co.nz convention domain for every dealer.

Queries the official .nz WHOIS (whois.irs.net.nz) once per name, rate limited.
Writes convention_domains.json: one record per dealer with the convention name,
whether it is registered, and (when it is) who is holding the DNS.

Usage:  python3 check_domains.py            # check every dealer
        python3 check_domains.py --limit 5  # smoke test
"""
import json, re, subprocess, sys, time, os

HERE = os.path.dirname(os.path.abspath(__file__))
WHOIS_HOST = "whois.irs.net.nz"
DELAY = 2.0          # be polite: the .nz terms prohibit bulk/high-volume querying
TIMEOUT = 25


def convention_name(dealer):
    """stihlshop<town>.co.nz, derived the way the network already does it."""
    base = dealer.get("shortName") or dealer.get("town") or dealer["slug"]
    return "stihlshop%s.co.nz" % re.sub(r"[^a-z0-9]", "", base.lower())


def whois(domain):
    try:
        out = subprocess.run(
            ["whois", "-h", WHOIS_HOST, domain],
            capture_output=True, text=True, timeout=TIMEOUT,
        ).stdout
    except subprocess.TimeoutExpired:
        return {"status": "error", "error": "timeout"}

    if re.search(r"^\s*Not found:", out, re.M):
        return {"status": "available"}
    if not re.search(r"(?im)^Domain Name:", out):
        return {"status": "error", "error": "unrecognised response"}

    def field(name):
        m = re.search(r"(?im)^%s:\s*(.+)$" % name, out)
        return m.group(1).strip() if m else None

    ns = [m.strip().lower() for m in re.findall(r"(?im)^Name Server:\s*(.+)$", out)]
    return {
        "status": "registered",
        "created": (field("Creation Date") or "")[:10] or None,
        "updated": (field("Updated Date") or "")[:10] or None,
        "registrar": field("Registrar"),
        "nameServers": ns,
        "dnsHost": dns_host(ns),
    }


def dns_host(nameservers):
    """Rough 'who is holding this' read from the nameservers."""
    joined = " ".join(nameservers)
    for needle, label in [
        ("digitalocean", "DigitalOcean (us)"),
        ("cloudflare", "Cloudflare"),
        ("wixdns", "Wix"), ("wix.com", "Wix"),
        ("squarespace", "Squarespace"),
        ("shopify", "Shopify"),
        ("webflow", "Webflow"),
        ("awsdns", "AWS Route 53"),
        ("azure", "Azure"),
        ("googledomains", "Google Domains"),
        ("domaincontrol", "GoDaddy"),
        ("registrar-servers", "Namecheap"),
        ("sitehost", "SiteHost (NZ)"),
        ("umbrellar", "Umbrellar (NZ)"),
        ("webfarm", "Webfarm (NZ)"),
        ("iwantmyname", "iwantmyname (NZ)"),
        ("freeparking", "Freeparking (NZ)"),
        ("discountdomain", "Discount Domains (NZ)"),
        ("crazydomains", "Crazy Domains"),
        ("hostpapa", "HostPapa"),
        ("wordpress", "WordPress.com"),
    ]:
        if needle in joined:
            return label
    if not nameservers:
        return "no nameservers (parked or inactive)"
    parts = nameservers[0].split(".")
    return ".".join(parts[-3:]) if len(parts) >= 3 else nameservers[0]


def main():
    limit = None
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    dealers = json.load(open(os.path.join(HERE, "dealers.json")))
    targets = dealers[:limit] if limit else dealers

    results = []
    for i, d in enumerate(targets, 1):
        name = convention_name(d)
        rec = {
            "slug": d["slug"],
            "store": d.get("store"),
            "shortName": d.get("shortName"),
            "category": d.get("category"),
            "currentWebsite": d.get("website"),
            "domain": name,
        }
        rec.update(whois(name))
        cur = (d.get("website") or "").lower()
        rec["isDealersOwn"] = name in cur
        results.append(rec)
        print("%3d/%d  %-34s %-11s %s" % (
            i, len(targets), name, rec["status"],
            "<- already theirs" if rec["isDealersOwn"] else (rec.get("dnsHost") or "")),
            flush=True)
        if i < len(targets):
            time.sleep(DELAY)

    out = os.path.join(HERE, "convention_domains.json")
    json.dump({"checkedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": WHOIS_HOST, "results": results},
              open(out, "w"), indent=1)

    avail = [r for r in results if r["status"] == "available"]
    taken = [r for r in results if r["status"] == "registered"]
    err = [r for r in results if r["status"] == "error"]
    print("\n--- %d checked: %d available, %d registered, %d errors ---"
          % (len(results), len(avail), len(taken), len(err)))
    print("written to", out)


if __name__ == "__main__":
    main()
