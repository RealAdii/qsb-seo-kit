# QSB SEO kit

Drop-in SEO fixes for [qsb.fast](https://qsb.fast), which resolves to
`https://www.yukon.org/qsb`.

**Every patch is design-neutral.** Nothing here changes a single rendered pixel
on the page. See [VERIFY.md](VERIFY.md) for why, and for how to check that claim
rather than trust it.

## Note to the Yukon / QSB team

This comes from outside your org, so the most useful thing to say up front is
what it does **not** touch.

**Nothing here is structural.** No architecture change, no refactor, no new
dependency, no change to the harness, the verifier, the scoring, the submission
flow or anything a solver interacts with. No package is added. No build step is
introduced. The benchmark itself is not touched at all.

**Nothing here changes the design.** Not a single rendered pixel moves. The one
exception is the browser tab text in patch 06, and that is called out explicitly
rather than slipped in. [VERIFY.md](VERIFY.md) explains why each patch is safe
and, more usefully, how to prove it with a screenshot diff rather than take our
word for it.

**What it actually does**, in full:

- adds a hidden `<script type="application/ld+json">` block, which has no layout
  box and paints nothing
- adds a few `sr-only` headings, which are absolutely positioned at 1px and
  contribute nothing to layout. No existing element is retagged or modified
- adds two static files, `robots.txt` and `sitemap.xml`, that do not exist today
- lengthens the `<title>` and meta description strings
- flips one Vercel redirect from 307 to 308, most likely a dashboard toggle
- raises one question about cache headers, and deliberately does **not**
  prescribe a fix, because the right answer depends on something only you know

**Nothing has been applied anywhere.** This is a proposal, not a pull request.
Every patch is a standalone file to lift in, ignore, or disagree with. Two of
them are marked `blocked_on_human` precisely because guessing would be worse
than asking.

Written from the live site with no access to your repository, so treat anything
about your internal file layout as a best guess. The findings themselves were
all measured against the live page and are reproducible with
`node scripts/check-seo.mjs`.

## If you are an agent

Read **[AGENTS.md](AGENTS.md)** first, then **[patches/manifest.json](patches/manifest.json)**
for the ordered task list with target files and acceptance criteria.

```bash
node scripts/check-seo.mjs https://qsb.fast --json     # machine-readable state
node scripts/check-seo.mjs https://qsb.fast --patch 02 # one patch's check
node scripts/check-seo.mjs https://qsb.fast --ci       # exit 1 on failure
```

Two patches are marked `blocked_on_human` and must not be applied without asking.

## If you are a human

**[PROMPT.md](PROMPT.md)** has copy-paste prompts to hand your agent: apply
everything, do the two-minute one, review only, or just check current state.

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
| [10](patches/10-head-terms/) | show up for "quantum safe bitcoin" | StarkWare blog + QSB page | 30 min | High |

Patches 03, 04 and 05 are site-wide and belong to whoever owns the Yukon Next.js
root, not to the QSB challenge specifically. Split them out if the two are
different people.

Patch 09 is the newest and has the sharpest evidence behind it: a live search on
2026-09-18 showed answer engines citing the GitHub repo instead of this page,
and quoting a record of 233,402,654 when the actual record was 726,763,328. See
[patches/09-aeo/](patches/09-aeo/).

Patch 10 has the most surprising finding in the kit: `starkware.co` already
ranks **#1** for "quantum safe bitcoin" and its blog post contains zero links to
qsb.fast. The head term does not need to be won, it needs to be forwarded. See
[patches/10-head-terms/](patches/10-head-terms/).

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
