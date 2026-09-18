# Patch 08: cache headers on a public page

## Measured today (2026-09-18)

```
$ curl -sI https://www.yukon.org/qsb | grep -i cache-control
cache-control: private, no-cache, no-store, max-age=0, must-revalidate
```

TTFB over three runs: **1.00s, 1.13s, 1.29s**. HTML payload 229KB.

`no-store` forbids every cache, including Vercel's edge. Every visitor pays a
full origin render. On a page whose primary content is a leaderboard, that is
expensive for content that is identical for all anonymous visitors.

## Why it is probably set

This header is what Next.js emits when a route opts out of static generation,
usually because it reads `cookies()`, `headers()`, or calls a data source with
`cache: "no-store"`. It is often accidental: one authenticated widget in the
tree forces the whole route dynamic.

That may well be deliberate here. A live leaderboard should be fresh, and the
page does render per-viewer state (a signed-in solver's own row). **Do not apply
this patch blind.** Confirm first whether anything on `/qsb` is genuinely
per-viewer.

## If the page is the same for all anonymous visitors

```ts
// app/qsb/page.tsx
export const revalidate = 60  // seconds
```

Or, for explicit control at the edge:

```
cache-control: public, s-maxage=60, stale-while-revalidate=300
```

`s-maxage=60` lets the CDN serve a cached copy for a minute.
`stale-while-revalidate=300` means a visitor after that minute still gets an
instant cached response while the refresh happens in the background, so nobody
waits on the origin. Records change on the order of hours, so 60s is
conservative.

Expected effect: TTFB on a cache hit drops from roughly 1.1s to edge latency,
tens of milliseconds. That is the single largest LCP lever available here.

## If the page IS per-viewer

Then keep `no-store` on the document and move the leaderboard to a cached
segment instead, so the expensive shared part is still cached:

- wrap the personalized widget in `<Suspense>` and let it stream, or
- fetch the leaderboard through a separately cached route handler, or
- use Partial Prerendering if the app is on a Next version that supports it.

## Also worth a look

`content-security-policy-report-only` is set but never enforced. Report-only
collects violations without blocking anything, which is the correct way to
stage a CSP, but it has to be promoted to the enforcing
`content-security-policy` header eventually or it is only ever a monitoring
tool. Not an SEO issue, flagged because it showed up in the same header dump.

Zero design impact.
