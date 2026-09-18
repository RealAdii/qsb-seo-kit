# QSB SEO kit

Drop-in SEO fixes for [qsb.fast](https://qsb.fast), which resolves to
`https://www.yukon.org/qsb`.

**Every patch is design-neutral.** Nothing here changes a single rendered pixel
on the page. See [VERIFY.md](VERIFY.md) for why, and for how to check that claim
rather than trust it.

## What this is

An outside audit plus the code to fix what it found. It is **not** a fork of the
Yukon app: this was put together without access to that repository, from the
live site. Each patch is a standalone file or diff to lift into the real
codebase.

Nothing here has been applied anywhere. Review, take what is useful, ignore the
rest.

## Start here

- **[AUDIT.md](AUDIT.md)**: what was measured, what it scored, and why. 54/100.
- **[VERIFY.md](VERIFY.md)**: the zero-design-change argument and how to test it.
- **`scripts/check-seo.mjs`**: reproduces the whole audit against any URL.

```bash
node scripts/check-seo.mjs              # audits qsb.fast as it stands today
node scripts/check-seo.mjs <url> --ci   # exit 1 on failure, for a build gate
```

Node 18+, no dependencies.

## Current state, 2026-09-18

```
  307  https://qsb.fast  ->  https://yukon.org/qsb
  308  https://yukon.org/qsb  ->  https://www.yukon.org/qsb
  200  https://www.yukon.org/qsb

  [ FAIL ] 07 redirects       temporary redirect: 307. Want 301/308.
  [ FAIL ] 01 json-ld         no application/ld+json block found
  [ FAIL ] 02 headings        only an h1, no h2-h6: the page has no heading outline
  [ FAIL ] 03 robots.txt      HTTP 404
  [ FAIL ] 04 sitemap.xml     HTTP 404
  [ warn ] 05 llms.txt        HTTP 404
  [ warn ] 06 title           35 chars (target 50-60)
  [ warn ] 06 description     89 chars, short of 150
  [  ok  ] 06 canonical       https://www.yukon.org/qsb
  [ warn ] 08 cache           no-store on a public page
  [ warn ] 08 latency         median full response 1447ms, want < 800ms
  [  ok  ] rendered markdown  no leaked markdown in rendered prose
```

## The patches

| # | Fix | Owner | Effort | Impact |
|---|---|---|---|---|
| [01](patches/01-jsonld/) | `Dataset` + `WebPage` + `BreadcrumbList` JSON-LD | QSB page | 15 min | High |
| [02](patches/02-headings/) | `sr-only` `<h2>` per section | QSB page | 15 min | High |
| [03](patches/03-robots/) | `app/robots.ts` | Yukon platform | 5 min | High |
| [04](patches/04-sitemap/) | `app/sitemap.ts` | Yukon platform | 15 min | High |
| [05](patches/05-llms/) | `public/llms.txt` | Yukon platform | 5 min | Low |
| [06](patches/06-metadata/) | longer title and description | QSB page | 10 min | Medium |
| [07](patches/07-redirects/) | 307 to 308 on the qsb.fast alias | DNS / Vercel | 2 min | High |
| [08](patches/08-cache/) | cache headers, **read the caveat first** | QSB page | varies | High |
| [09](patches/09-aeo/) | AEO: get cited correctly by AI answer engines | QSB page + GitHub repo | 30 min | High |

Patches 03, 04 and 05 are site-wide and belong to whoever owns the Yukon Next.js
root, not to the QSB challenge specifically. Split them out if the two are
different people.

Patch 09 is the newest and has the sharpest evidence behind it: a live search on
2026-09-18 showed answer engines citing the GitHub repo instead of this page,
and quoting a record of 233,402,654 when the actual record was 726,763,328. See
[patches/09-aeo/](patches/09-aeo/).

Patch 08 is the one to not apply blind: `no-store` may be deliberate if any part
of the page is per-viewer. That patch explains both paths.

## Suggested order

1. **07** first. It is a dashboard toggle and it stops splitting signals between
   two URLs, which makes everything downstream count for more.
2. **03 and 04** next. Cheap, and they are what lets crawlers find the rest.
3. **01 and 02** next. These are the two with real upside for a benchmark page:
   they turn published records into machine-readable data and give the page a
   parseable structure.
4. **09** fix 5 is two minutes and needs no deploy: add one link to the
   `quantum-safe-bitcoin-challenge` README pointing at the live leaderboard. Do
   it whenever, it is independent of everything else.
5. **06** whenever. **08** after someone confirms the caching question. **05**
   only if the team wants it.

## What is already good

The page is fully server-rendered, canonical and Open Graph are correct, images
carry dimensions and lazy loading, security headers are solid, and the content
is genuinely original first-hand measurement. The score is low because of
missing files and missing structure, not because the page is bad. See the tail
of [AUDIT.md](AUDIT.md).

## Provenance

Audited and drafted by an outside reader on 2026-09-18 from publicly available
pages only. No access to the Yukon codebase, no credentials, no crawling beyond
normal page fetches. Numbers were measured at that time and the live page moves,
so re-run the script rather than trusting the table above.
