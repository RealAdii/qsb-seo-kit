# Copy-paste prompts

Hand one of these to a coding agent working in the Yukon repository.

---

## Apply the fixes

```
Apply the SEO and AEO patches from https://github.com/RealAdii/qsb-seo-kit to
this repository.

Read AGENTS.md in that repo first. It is the full brief. Then read
patches/manifest.json for the ordered task list, target files and acceptance
criteria.

Hard constraints:
- No patch may change a single rendered pixel. The design does not change.
- Patch 08 and patch 07 are marked blocked_on_human in the manifest. Ask me the
  questions listed there instead of guessing.
- Do not add FAQPage or HowTo schema, do not retag the section labels as
  headings, and do not hardcode a benchmark record number. AGENTS.md explains
  why for each.

Before you start, run the baseline:
  npx --yes degit RealAdii/qsb-seo-kit /tmp/seokit && node /tmp/seokit/scripts/check-seo.mjs https://qsb.fast

Work the patches in the manifest's `order`. After each one, re-run the check
against a preview deployment. Report which patches you applied, the before and
after check output, and anything you skipped with the reason.

For patch 02, screenshot /qsb at 390px and 1440px before and after and diff the
images. Do not skip this because the reasoning looks sound.
```

---

## Just the two-minute one

Patch 09 fix 5, which needs no deploy and is in a different repository:

```
In the Layr-Labs/quantum-safe-bitcoin-challenge repository, add a link at the
top of README.md pointing to the live leaderboard:

> **Live leaderboard and current records: [qsb.fast](https://qsb.fast)**
> This repo is the benchmark harness. The canonical, continuously updated
> records live on the leaderboard.

Context: as of 2026-09-18 that README contains zero links to yukon.org or
qsb.fast, and answer engines are citing the repo's pull requests instead of the
leaderboard. One of them quoted the pinning record as 233,402,654 when the live
record was 726,763,328, because a three-week-old PR looks as current as today's.
```

---

## Review without changing anything

```
Review the SEO and AEO audit at https://github.com/RealAdii/qsb-seo-kit against
this codebase.

Read AUDIT.md for the findings, patches/09-aeo/ for the answer-engine analysis,
and STRATEGY.md for what goes beyond fixing the audit.

For each of the 9 patches in patches/manifest.json, tell me:
- whether the problem it describes is actually present in this codebase
- whether the proposed fix would work here as written
- anything the outside audit got wrong, since it was written without repo access

Do not make any changes.
```

---

## Verify the current state

No repo access needed, runs against the live site:

```bash
npx --yes degit RealAdii/qsb-seo-kit /tmp/seokit
node /tmp/seokit/scripts/check-seo.mjs https://qsb.fast
node /tmp/seokit/scripts/check-seo.mjs https://qsb.fast --json   # for an agent
```
