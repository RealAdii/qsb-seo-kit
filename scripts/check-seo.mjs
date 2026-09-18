#!/usr/bin/env node
// Verifies the fixes in this kit against a LIVE url, by reading what a crawler
// actually receives. Not the source, the shipped bytes.
//
//   node scripts/check-seo.mjs                          # defaults to qsb.fast
//   node scripts/check-seo.mjs https://staging.example  # any origin
//   node scripts/check-seo.mjs --ci                     # exit 1 on failure
//   node scripts/check-seo.mjs --json                   # machine-readable, for agents
//   node scripts/check-seo.mjs --patch 02               # only that patch's check
//
// Node 18+ (uses global fetch). No dependencies.

const args = process.argv.slice(2)
const CI = args.includes("--ci")
const JSON_OUT = args.includes("--json")
const patchIdx = args.indexOf("--patch")
const ONLY = patchIdx !== -1 ? args[patchIdx + 1] : null
const START =
  args.filter((a, i) => !a.startsWith("--") && i !== patchIdx + 1)[0] ?? "https://qsb.fast"

const results = []
const push = (s, n, d) => {
  const patch = (n.match(/^(\d{2})/) || [])[1] ?? null
  if (ONLY && patch !== ONLY) return
  results.push({ status: s, patch, check: n, detail: d })
}
const ok = (n, d) => push("PASS", n, d)
const bad = (n, d) => push("FAIL", n, d)
const warn = (n, d) => push("WARN", n, d)

// Follow the redirect chain by hand so we can grade each hop.
async function chain(url) {
  const hops = []
  let cur = url
  for (let i = 0; i < 10; i++) {
    const res = await fetch(cur, { redirect: "manual" })
    const loc = res.headers.get("location")
    hops.push({ url: cur, status: res.status, location: loc })
    if (!loc) return { hops, final: res, finalUrl: cur }
    cur = new URL(loc, cur).href
  }
  throw new Error("too many redirects")
}

const { hops, final, finalUrl } = await chain(START)
const html = await final.text()
const origin = new URL(finalUrl).origin

// ---------- patch 07: redirects ----------
const redirects = hops.filter((h) => h.location)
if (redirects.length === 0) {
  ok("07 redirects", "no redirect, served directly")
} else {
  const temporary = redirects.filter((h) => h.status === 302 || h.status === 307)
  if (temporary.length) {
    bad(
      "07 redirects",
      `temporary redirect(s): ${temporary.map((h) => `${h.url} -> ${h.status}`).join(", ")}. Want 301/308.`
    )
  } else {
    ok("07 redirects", `${redirects.length} permanent hop(s)`)
  }
  if (redirects.length > 1) {
    warn("07 redirects", `${redirects.length} hops, collapse to 1 to save latency`)
  }
}

// ---------- patch 01: JSON-LD ----------
const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
if (!ld.length) {
  bad("01 json-ld", "no application/ld+json block found")
} else {
  const types = []
  let broken = 0
  for (const m of ld) {
    try {
      const j = JSON.parse(m[1].trim())
      const nodes = j["@graph"] ?? [j]
      for (const n of nodes) if (n["@type"]) types.push(n["@type"])
    } catch {
      broken++
    }
  }
  if (broken) bad("01 json-ld", `${broken} block(s) are not valid JSON`)
  else ok("01 json-ld", `${ld.length} block(s), types: ${types.join(", ")}`)
  if (!types.includes("Dataset")) {
    warn("01 json-ld", "no Dataset node; that is the one that fits a benchmark leaderboard")
  }
}

// ---------- patch 02: headings ----------
const counts = {}
for (let i = 1; i <= 6; i++) {
  counts[`h${i}`] = (html.match(new RegExp(`<h${i}[\\s>]`, "gi")) || []).length
}
const sub = counts.h2 + counts.h3 + counts.h4 + counts.h5 + counts.h6
if (counts.h1 !== 1) bad("02 headings", `${counts.h1} h1 elements, want exactly 1`)
else if (sub === 0) bad("02 headings", "only an h1, no h2-h6: the page has no heading outline")
else ok("02 headings", JSON.stringify(counts))

// ---------- patches 03/04/05: site files ----------
for (const [patch, path, required] of [
  ["03 robots.txt", "/robots.txt", true],
  ["04 sitemap.xml", "/sitemap.xml", true],
  ["05 llms.txt", "/llms.txt", false],
]) {
  const res = await fetch(origin + path)
  const ct = res.headers.get("content-type") ?? ""
  const body = await res.text()
  // A Next.js app returns its 404 PAGE with a 404 status: catch the soft-404
  // where status is 200 but the body is HTML.
  const isHtml = ct.includes("text/html") || body.trimStart().startsWith("<!DOCTYPE")
  if (res.status !== 200) {
    ;(required ? bad : warn)(patch, `HTTP ${res.status}`)
  } else if (isHtml) {
    ;(required ? bad : warn)(patch, "returns HTML, not a plain-text/xml file (soft 404)")
  } else {
    ok(patch, `HTTP 200, ${ct.split(";")[0]}, ${body.length}B`)
  }
}

// robots must point at the sitemap
const rb = await fetch(origin + "/robots.txt")
if (rb.status === 200) {
  const t = await rb.text()
  if (!/^\s*sitemap:/im.test(t)) warn("03 robots.txt", "no Sitemap: directive")
}

// ---------- patch 06: metadata ----------
const grab = (re) => (html.match(re) || [])[1]
const title = grab(/<title[^>]*>([\s\S]*?)<\/title>/i)
const desc = grab(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)
const canon = grab(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i)

if (!title) bad("06 title", "missing")
else if (title.length < 50 || title.length > 60)
  warn("06 title", `${title.length} chars (target 50-60): ${title}`)
else ok("06 title", `${title.length} chars`)

if (!desc) bad("06 description", "missing")
else if (desc.length < 150) warn("06 description", `${desc.length} chars, short of 150`)
else ok("06 description", `${desc.length} chars`)

if (!canon) bad("06 canonical", "missing")
else if (canon !== finalUrl.replace(/\/$/, "") && canon !== finalUrl)
  warn("06 canonical", `${canon} does not match resolved ${finalUrl}`)
else ok("06 canonical", canon)

for (const p of ["og:title", "og:description", "og:image", "og:url", "twitter:card"]) {
  const re = new RegExp(`<meta[^>]+(?:property|name)="${p}"[^>]+content="([^"]*)"`, "i")
  if (!re.test(html)) warn("06 social", `${p} missing`)
}

// ---------- patch 08: caching ----------
const cc = final.headers.get("cache-control") ?? ""
if (/no-store/.test(cc)) {
  warn("08 cache", `no-store on a public page: "${cc}". Nothing can cache this.`)
} else if (/s-maxage|max-age=[1-9]/.test(cc)) {
  ok("08 cache", cc)
} else {
  warn("08 cache", `weak: "${cc}"`)
}

// TTFB, three samples, median
const times = []
for (let i = 0; i < 3; i++) {
  const t0 = performance.now()
  const r = await fetch(finalUrl, { cache: "no-store" })
  await r.arrayBuffer()
  times.push(performance.now() - t0)
}
const median = times.sort((a, b) => a - b)[1]
if (median > 800) warn("08 latency", `median full response ${Math.round(median)}ms, want < 800ms`)
else ok("08 latency", `median ${Math.round(median)}ms`)

// ---------- leaked markdown, per the rendered-output rule ----------
const body = html
  .slice(html.indexOf("<body"))
  .replace(/<script[\s\S]*?<\/script>/gi, "")
  .replace(/<style[\s\S]*?<\/style>/gi, "")
const text = body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
const leaks = [
  [/\|\s*-{3,}\s*\|/, "markdown table separator row"],
  [/\*\*[^*\n]{2,60}\*\*/, "literal **bold**"],
  [/^#{1,6}\s/m, "literal # heading"],
  [/\[[^\]\n]{2,50}\]\(https?:/, "literal [link](url)"],
]
const found = leaks.filter(([re]) => re.test(text)).map(([, n]) => n)
if (found.length) bad("rendered markdown", `source syntax leaked as text: ${found.join(", ")}`)
else ok("rendered markdown", "no leaked markdown in rendered prose")

// ---------- report ----------
const fails = results.filter((r) => r.status === "FAIL").length
const warns = results.filter((r) => r.status === "WARN").length
const passes = results.length - fails - warns

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        start: START,
        resolved: finalUrl,
        hops: hops.map((h) => ({ url: h.url, status: h.status, location: h.location ?? null })),
        summary: { passed: passes, warnings: warns, failed: fails },
        results,
      },
      null,
      2
    )
  )
} else {
  console.log(`\n  ${START}  ->  ${finalUrl}\n`)
  for (const h of hops) {
    console.log(
      `  ${String(h.status).padEnd(4)} ${h.url}${h.location ? `  ->  ${h.location}` : ""}`
    )
  }
  console.log("")
  const pad = Math.max(...results.map((r) => r.check.length), 0)
  for (const r of results) {
    const mark = r.status === "PASS" ? "  ok  " : r.status === "WARN" ? " warn " : " FAIL "
    console.log(`  [${mark}] ${r.check.padEnd(pad)}  ${r.detail}`)
  }
  console.log(`\n  ${passes} passed, ${warns} warnings, ${fails} failed\n`)
}

if (CI && fails) process.exit(1)
