# Instructions for a coding agent

You are being asked to apply SEO and AEO fixes to the Quantum Safe Bitcoin
challenge page. This repo is the audit and the patches. It is **not** the target
codebase: it was written from outside, against the live site, by someone without
access to the Yukon repository.

Read this file first. It is the whole brief.

## Before you touch anything

1. **Confirm you are in the right repository.** The target is the Next.js app
   serving `https://www.yukon.org/qsb`. If the working directory is this kit,
   you are in the wrong place: this repo is a reference to read, not a repo to
   edit.
2. **Establish the baseline.** Run the audit against the live site so you can
   prove your changes worked:
   ```bash
   node scripts/check-seo.mjs https://qsb.fast
   ```
   Expect 5 failures and 6 warnings today. Save that output.
3. **Read `patches/manifest.json`.** It is the machine-readable task list:
   ordering, target files, acceptance criteria and which patches are blocked.

## The one rule that overrides everything

**No patch may change a single rendered pixel.**

The person who commissioned this was explicit: the design does not change. If
applying a patch as written would move, resize, restyle or reflow anything, stop
and report it rather than proceeding. `VERIFY.md` explains why each patch is
safe and how to prove it.

The only user-visible change permitted anywhere in this kit is the browser tab
text, from patch 06.

## Order of work

From `manifest.json`, `order`:

```
07 → 03 → 04 → 01 → 02 → 09 → 06 → 05 → 08
```

Rationale: 07 stops signals splitting between two URLs, so everything after it
counts for more. 03 and 04 let crawlers find things. 01 and 02 are the real
content wins. 08 is last because it is the only one that can be wrong to apply.

## Two patches you must not apply on your own

These have `blocked_on_human: true` in the manifest. Ask, do not guess.

- **Patch 08 (caching).** The question: *does `/qsb` render anything that
  differs per viewer, such as a signed-in solver's own row?* If yes, the current
  `no-store` header is correct and the fix is different. Applying the naive
  version would serve one visitor's view to another. Do not apply until a human
  answers.
- **Patch 07 (redirect).** Likely a Vercel dashboard toggle rather than a code
  change. Determine which, and hand the dashboard route to a human with project
  access.

## Things that will look like improvements and are not

Explicitly out of scope. Do not do these even if a general SEO checklist, or
your own training, suggests them:

- **Do not add `FAQPage` schema.** Google restricted FAQ rich results to
  government and health sites in 2023. It earns nothing here and costs a little
  credibility. One of the tools consulted during this audit recommended it; that
  recommendation was rejected on purpose.
- **Do not add `HowTo` schema.** Deprecated since 2023.
- **Do not retag the section labels as headings.** "How it works", "Participate"
  and "Improvement History" are `<button>` tab controls; "Leaderboard" is a nav
  `<a>`. Retagging breaks the `role="tab"` contract and changes the design.
  Patch 02 adds new hidden elements instead, and touches no existing element.
- **Do not hardcode a benchmark record.** The record changed twice during the
  few hours of this audit. A stale number in schema is worse than no number,
  because it is the one a machine will trust. Wire it to live data or omit it.
- **Do not rewrite page copy.** Nothing in this kit asks for it.
- **Do not add `Article` schema.** `Dataset` is the correct type for a benchmark
  leaderboard, and patch 01 already uses it.

## How to verify you succeeded

Do not infer success from the build passing or the component existing. Check
what a crawler actually receives:

```bash
# against a preview deployment first
node scripts/check-seo.mjs https://your-preview-url.vercel.app --ci

# then production, after deploy
node scripts/check-seo.mjs https://qsb.fast --ci
```

`--ci` exits non-zero on failure, so it works as a build gate. Add it to CI if
the team wants this to stay fixed.

For patch 02 specifically, the pixel check is not optional. Screenshot `/qsb` at
390px and 1440px before and after, and diff the images. `VERIFY.md` has a
Playwright snippet. Reasoning about `sr-only` is not evidence; a diff is.

## Reporting back

When you are done, report:

- Which patch ids you applied, by number
- The `check-seo.mjs` output before and after, side by side
- Any patch you skipped, and why
- The two blocked questions, if they are still unanswered
- For patch 02, the result of the pixel diff

Do not report a patch as applied unless its `acceptance` criterion from
`manifest.json` passes against a live URL.

## If you are not applying patches

If you were asked to review rather than implement: `AUDIT.md` has the findings
and the evidence, and `patches/09-aeo/` has the answer-engine analysis. Start
with `AUDIT.md`.
