# SEO audit: qsb.fast

Audited 2026-09-18 against the live site. Every number below was measured, not
estimated. Re-run `node scripts/check-seo.mjs` to reproduce all of it.

Resolved chain:

```
307  https://qsb.fast        ->  https://yukon.org/qsb
308  https://yukon.org/qsb   ->  https://www.yukon.org/qsb
200  https://www.yukon.org/qsb
```

Scope: this is a single-page analysis. qsb.fast resolves to one content page
plus two legal pages, so a multi-page site crawl does not apply.

## Score: 54 / 100

| Category | Weight | Score | Driver |
|---|---|---|---|
| Technical SEO | 25% | 55 | no robots.txt, no sitemap, 307 first hop |
| Content quality | 25% | 70 | strong original data, no author or date signal |
| On-page SEO | 20% | 58 | no heading outline, short title and description |
| Schema | 10% | 0 | zero structured data |
| Performance | 10% | 45 | `no-store`, TTFB about 1.1s |
| Images | 5% | 85 | dimensions, lazy loading and alt all present |
| AI search readiness | 5% | 45 | no schema, no robots.txt, no llms.txt |

## Findings

### Critical

**C1. Zero structured data.** No `application/ld+json` anywhere.
This is the largest single gap. The page publishes verified benchmark records,
which is exactly what `Dataset` schema exists to describe. Without it, the
numbers are prose to a machine. Patch 01.

**C2. No heading outline.** One `<h1>`, zero `<h2>` through `<h6>`, across 784
words. Patch 02.

Worth stating precisely, because the obvious fix is the wrong one: the section
labels a reader sees (How it works, Participate, Improvement History) are
`<button>` tab controls, and Leaderboard is a nav `<a>`. They are not unstyled
headings waiting to be retagged. The fix adds new hidden headings rather than
changing existing elements.

**C3. No robots.txt.** `https://www.yukon.org/robots.txt` returns 404, served as
an HTML soft-404. Nothing is blocked by this, but there is nowhere to declare
the sitemap. Patch 03. Platform-level.

**C4. No sitemap.xml.** 404. Patch 04. Platform-level.

### High

**H1. First redirect hop is 307 Temporary.** A permanent vanity alias should be
308, as hop two already is. 307 tells search engines not to consolidate signals
onto the target yet. Patch 07. Likely a single dashboard toggle.

**H2. `cache-control: private, no-cache, no-store` on a public page.** Measured
TTFB 1.00s, 1.13s, 1.29s; median full response 1447ms. `no-store` forbids edge
caching entirely. Patch 08, which deliberately does not prescribe a blind fix:
if any part of `/qsb` is genuinely per-viewer, the header may be correct and the
leaderboard should be cached separately instead.

**H3. The `<h1>` contains an interactive control.** It wraps both the cost
sentence and the "How the transaction cost is estimated" disclosure button, so
the page's top-level heading reads with the button label appended. Patch 02,
secondary section.

### Medium

**M1.** Title 35 chars against a 50 to 60 target; meta description 89 chars
against 150 to 160. Patch 06.

**M2.** Only 5 internal links on the page: `/`, `/leaderboard`, `/qsb`,
`/qsb/privacy`, `/qsb/terms`.

**M3.** No llms.txt. Patch 05, and see that patch's note on why it is Low value.

**M4.** No author, publish date, or last-updated signal in the markup. For a
page whose credibility rests on measurement provenance, a visible "records
verified as of" timestamp would be an E-E-A-T gain as well as an SEO one.

**M5.** `content-security-policy-report-only` is set but never enforced. Not an
SEO issue. Noted because it appeared in the same header dump.

## What is already right

Worth saying, because the score alone reads worse than the page deserves:

- Canonical present, self-referencing, and correct
- Complete Open Graph set plus `twitter:card` `summary_large_image`, and the OG
  image returns 200 `image/png`, 68KB
- **Fully server-rendered.** All 784 words are in the raw HTML with no JS
  execution required. Many React sites fail this; this one does not
- `lang="en"`, viewport set
- Real landmark structure: `<main>`, `<header>`, `<footer>`, `<nav>`,
  `<section>`, plus meaningful `aria-label`s throughout
- Images carry explicit `width` and `height` (so no layout shift),
  `loading="lazy"`, and alt attributes
- HSTS with `includeSubDomains; preload`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`
- Genuinely original first-hand data. Independently CPU-verified benchmark
  records are a strong experience and authority signal, and they are the reason
  the schema in patch 01 is worth adding rather than boilerplate

## Not measured

LCP, INP and CLS. These need a real browser. The TTFB and `no-store` findings
predict an LCP problem but do not measure one. Run PageSpeed Insights against
`https://www.yukon.org/qsb` for the field data.
