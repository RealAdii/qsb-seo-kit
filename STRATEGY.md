# Getting to S tier

Patches 01 to 09 fix what is broken. They do not create an advantage, because
every one of them is something any competent team can also do. Adding JSON-LD
and a sitemap moves this page from roughly 54 to roughly 85, and 85 is A tier:
competent, indexed, correctly read. Table stakes.

S tier is a different axis. It is not "fewer errors." It is being the source
that other people's content has to cite, so that the citation graph works for
you instead of the other way round.

This document is the honest version of what that would take, including the parts
that are not engineering work and the parts that may not be worth doing.

## The asset nobody else has

Strip away the SEO framing and ask what this page actually holds:

> A continuously updated, independently CPU-verified record of how much faster
> specific AI models made a low-level GPU kernel, week over week, with the
> model and the solver named on every promoted submission.

That dataset does not exist anywhere else. Not on Papers With Code, not in any
paper, not on any other leaderboard. It is first-hand measurement of a question
a very large number of people are actively arguing about, which is: **how much
can AI agents actually optimize hard systems code?**

The page currently presents that asset as a scoreboard for people who already
know what QSB is. That is the gap between A and S. The data is S tier. The
packaging is not.

## The structural problem

The entire benchmark is **one URL**.

Verified 2026-09-18: `/qsb/leaderboard`, `/qsb/submissions`, `/qsb/solvers`,
`/qsb/records` and `/qsb/data.json` all return 404. There is no downloadable
data anywhere on the page. 17 promoted submissions and 15 solvers live inside a
single HTML document, revealed by clicking rows.

One URL can hold one position for one query. Everything the benchmark knows is
competing with itself for a single slot.

## Five moves, roughly in order of leverage

### 1. Make the data downloadable

The single highest-leverage item here, and it is mostly a data-export task
rather than an SEO one.

Publish the full submission history as JSON and CSV at a stable URL:

```
https://www.yukon.org/qsb/data.json
https://www.yukon.org/qsb/data.csv
```

One row per promoted submission: timestamp, solver, model, workload, verified
candidates per second, delta over previous record, link to the validating PR.

Then wire it into the `Dataset` schema from patch 01:

```jsonc
"distribution": [
  {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://www.yukon.org/qsb/data.json"
  },
  {
    "@type": "DataDownload",
    "encodingFormat": "text/csv",
    "contentUrl": "https://www.yukon.org/qsb/data.csv"
  }
]
```

Why this is first: researchers, journalists and analysts cite what they can
load into a notebook. A number in a `<div>` gets retyped and misattributed, as
already happened when an answer engine quoted 233,402,654 as the record. A CSV
gets cited with a URL. `Dataset` schema with a real `distribution` is also what
makes the page eligible for Google Dataset Search, which almost no competitor
in this space is registered for.

### 2. Give every submission and solver its own URL

```
/qsb/submissions/<id>     17 pages today, one per promoted submission
/qsb/solvers/<handle>     15 pages today
/qsb/models/<model>       a handful, and the most interesting of the three
```

Each page carries genuinely unique verified data: what changed, by how much,
which model, what the diff was, the validating PR. That is not thin content and
it is not a doorway page, which is the usual failure mode of scaled page
generation. The test to apply before shipping: if a page has nothing on it that
is not already on the parent, do not create it.

`/qsb/models/<model>` is the one to build first even though it has the fewest
pages, because "which AI model writes the fastest CUDA" is a question with real
search demand and almost no credible first-party answer anywhere.

Guardrail: do not generate a page per unpromoted submission. Hundreds of
near-identical pages is index bloat and it actively hurts. Promoted only.

### 3. Publish one authored, dated writeup

The page has no byline anywhere, and the cs-aeo audit scored Experience 47/100
for exactly this reason. Everything on it is reported in the passive voice of a
dashboard.

Write the thing the dashboard cannot say:

> "Over six weeks, submissions took this kernel from 146M to 727M verified
> candidates per second, a 5x speedup. Here is what actually changed, and here
> is what the models got wrong on the way."

Named author. Date. Method. Links to the specific submissions. This is the
artifact that gets posted to Hacker News and r/CUDA, that other writers link to,
and that a Wikipedia editor can cite. A leaderboard is not citable in prose. A
writeup with a named author and a methodology is.

This is the highest-value item on the list that is not an engineering task, and
it is the one most likely to be skipped for that reason.

### 4. Make it academically citable

Deposit the dataset on **Zenodo** and get a DOI. It is free and takes about an
hour.

A DOI turns the benchmark into something a paper can cite formally. Academic
citation is the strongest authority signal that exists, it is the main path to
Wikipedia notability, and Wikipedia presence is among the strongest single
predictors of whether an answer engine cites you.

There is a real audience here: GPU optimization, post-quantum Bitcoin, and
AI-agents-writing-code are three active research areas, and this dataset sits in
the intersection of all three.

### 5. Weaponise the freshness

The record moved from 724,568,034 to 726,763,328 during the few hours this audit
took. Almost no authoritative page in any field has genuinely live data.

- Visible "last verified at" timestamp, plus `dateModified` in the schema
- An RSS or JSON feed of new records
- A short changelog page: every promotion, dated

Answer engines discount stale content aggressively and reward demonstrable
recency. This page can demonstrate it hourly and currently signals it not at
all.

## The thing to fix before any of the above

GitHub currently outranks the canonical page for its own subject, and the
`quantum-safe-bitcoin-challenge` README contains zero links back to the
leaderboard. Patch 09 fix 5.

Do not treat that as competition to beat. That repo has more authority than the
site will build in a year, and it is already where the audience is. The move is
to make it a funnel: link the README to the live leaderboard, reference the
canonical page from release notes and discussions, and let the repo's authority
flow to the page that has the current numbers.

## What S tier actually looks like

Not a score. These, concretely:

- Someone asks ChatGPT "how much can AI optimize CUDA kernels" and the answer
  cites yukon.org/qsb with the correct current number
- A paper on LLM code generation cites the dataset by DOI
- The Wikipedia article on post-quantum Bitcoin references the cost estimate
- A journalist writing about AI coding ability uses the CSV
- The `$72 per transaction` figure becomes the number people quote, the way
  specific benchmark figures become canonical in other fields

None of those come from meta tags. All of them come from the data being
packaged so it can travel.

## Cost, honestly

| Move | Effort | Who |
|---|---|---|
| 1. Data export + schema | 1 to 2 days | engineering |
| 2. Per-entity pages | 3 to 5 days | engineering |
| 3. Authored writeup | 1 to 2 days | a named human |
| 4. Zenodo DOI | 1 hour | anyone |
| 5. Freshness signals | half a day | engineering |
| Patch 09 fix 5 | 2 minutes | anyone |

Patches 01 to 09 first. They are cheap and they are prerequisites: there is no
point earning citations to a page an engine misreads.

If only two things from this document ever happen, make them **move 1** and
**move 3**. Downloadable data and one authored writeup with a name on it. Those
two carry most of the distance, and neither is an SEO task, which is the actual
point: at S tier the SEO work is finished and what remains is having something
worth citing and making it easy to cite.
