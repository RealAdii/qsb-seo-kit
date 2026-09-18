# Patch 09: answer engine optimization (AEO)

Getting cited by ChatGPT, Perplexity, Google AI Overviews and Claude when
someone asks about the QSB benchmark.

## The evidence this is needed

Searched for `Yukon.org "Quantum Safe Bitcoin" GPU grinding benchmark
leaderboard` on 2026-09-18. Two things came back, and both are problems.

**1. The canonical page did not rank. The GitHub repo did.**

Every result was a `github.com/Layr-Labs/quantum-safe-bitcoin-challenge` page,
mostly individual submission-validation pull requests. `www.yukon.org/qsb` did
not appear.

**2. The answer that got generated was wrong.**

The generated summary stated:

> The current best score is 233,402,654 (for the pinning track)

The live record at that moment was **726,763,328**. The number that got quoted,
233,402,654, is real, but it is a mid-table historical row on the leaderboard,
not the record. An answer engine read the page's numbers and picked the wrong
one.

That is the whole problem in one line. The page is not failing to be crawled.
It is being crawled and **misread**, because nothing on it marks which of its
roughly forty large numbers is the answer to "what is the record."

Also worth noting: the record moved from 724,568,034 to 726,763,328 during the
few hours this audit took. Anything cached or cited goes stale fast, which makes
an explicit "as of" timestamp more important here than on a normal page.

## Fix 1: one self-contained answer sentence

Highest impact item in this patch.

Answer engines extract passages, not pages. They want a sentence that survives
being lifted out of context with no surrounding page. Right now the record is
split across separate visual elements: a `726.76M` badge, a `146.09M` figure, a
raw `726,763,328`, and the words "on the benchmark RTX 4090" some distance away.
There is no single sentence stating the fact.

Add one. It can be visually hidden if it duplicates what the design already
shows, in which case it changes no pixels:

```jsx
<p className="sr-only">
  The current Quantum Safe Bitcoin pinning record is {pinningRecord.toLocaleString()} verified
  candidates per second, set by {holder} on {recordDate} and measured on the benchmark
  NVIDIA RTX 4090. The current subset-selection record is {subsetRecord.toLocaleString()}
  verified candidates per second. Every hit behind these figures is independently re-derived
  on CPU before it is scored.
</p>
```

Better still, make it visible. A single plain sentence under the hero would help
human readers for the same reason it helps machines, and the design already has
room. That is a design change, so it is offered rather than assumed, and it is
the only thing anywhere in this kit that would alter the page visually.

## Fix 2: question-shaped hidden headings

This extends patch 02. When patch 02 adds the `sr-only` `<h2>` elements, phrase
them as the questions people actually type:

| Instead of | Use |
|---|---|
| Leaderboard | What is the current Quantum Safe Bitcoin grinding record? |
| How it works | How is the QSB grinding benchmark scored? |
| Participate | How do I submit a QSB grinding kernel? |
| Improvement History | How much has QSB grinding throughput improved? |

Same zero pixels, same `sr-only` class, better match to query phrasing. Heading
text is one of the strongest passage-boundary signals an extractor has.

**Deliberately not recommended: FAQPage schema.** Google restricted FAQ rich
results to government and health sites in 2023. Adding it here earns no rich
result and is a small credibility cost. Question-shaped headings get the benefit
without the markup.

## Fix 3: an explicit freshness signal

The page has no date anywhere except per-row timestamps inside the leaderboard.
For a page whose entire content is "the current record", that is the single most
important missing field, and it is the likeliest reason a stale number got
quoted with confidence.

```jsx
<p className="sr-only">
  Records verified as of <time dateTime={lastVerified}>{formatted}</time>.
</p>
```

Pair it with `dateModified` in the JSON-LD (see fix 4).

## Fix 4: strengthen the Dataset schema

Patch 01 adds `Dataset`. For AEO specifically, add three fields that directly
answer "what is the record" and "is this current":

```jsonc
{
  "@type": "Dataset",
  "@id": "https://www.yukon.org/qsb#dataset",
  "dateModified": "2026-09-18T11:42:00Z",
  "temporalCoverage": "2026-08-01/..",
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "Current pinning record",
      "value": 726763328,
      "unitText": "verified candidates per second",
      "measurementTechnique": "CPU-verified on a reference NVIDIA RTX 4090"
    }
  ]
}
```

`value` as an actual number is what makes this unambiguous. A machine reading
this cannot pick 233,402,654 off the leaderboard instead.

Keep the value wired to the live record. A hardcoded number that drifts is worse
than none, because it is the one an engine will trust.

## Fix 5: link the GitHub repo back to the site

**Cheapest item here, and probably the highest leverage.**

`github.com/Layr-Labs/quantum-safe-bitcoin-challenge/README.md` currently
contains **zero** links to `yukon.org` or `qsb.fast`. Checked 2026-09-18.

That repo is what answer engines are already finding and citing. It is doing the
authority work and sending none of it to the canonical page, and it is also
where the stale numbers are coming from, since a PR from three weeks ago looks
exactly as current as one from today.

Add to the top of that README:

```markdown
> **Live leaderboard and current records: [qsb.fast](https://qsb.fast)**
> This repo is the benchmark harness. The canonical, continuously updated
> records live on the leaderboard.
```

One line, no code, no deploy. It gives every engine crawling those pull requests
a pointer to the page that has the right answer.

## Fix 6: the off-site signals that actually move AI citation

Brand mentions correlate with AI visibility far more strongly than backlinks do.
None of this is a code change and none of it belongs in this repo, but it is the
honest answer to "what else can we do":

- A **Wikipedia or Wikidata entity** for the benchmark, if it meets notability.
  Wikipedia presence is among the strongest single predictors of citation.
- **Reddit and Hacker News** discussion. A record going from 146M to 726M, a
  roughly 5x speedup on an ECDSA recovery grind, is genuinely interesting to
  r/CUDA, r/crypto and HN. That is a real story, not manufactured promotion.
- **YouTube**, the strongest correlated signal in the Ahrefs data. Even a short
  screen recording of a kernel run and a leaderboard promotion would do.
- **A writeup with a named author.** The page currently has no byline and no
  author credentials anywhere. For a measurement-based claim, attribution is an
  authority signal as well as an honesty one.

## What is already working in your favour

- The page is **fully server-rendered**. AI crawlers do not run JavaScript, and
  many React sites are invisible to them. This one is not. All 784 words are in
  the raw HTML. This is the prerequisite most sites fail, and it is already met.
- The content is **original first-hand measurement** that exists nowhere else.
  That is exactly what answer engines prefer to cite. The problem is packaging,
  not substance.
- Patch 03 adds explicit AI crawler permissions.

## Priority

1. **Fix 5**, the GitHub README link. Two minutes, no deploy, addresses the
   observed failure directly.
2. **Fix 1 and Fix 3**, the answer sentence and the timestamp. These are what
   stop a wrong number being quoted.
3. **Fix 4**, schema values. Makes the right number machine-unambiguous.
4. **Fix 2**, question headings. Free if patch 02 is being done anyway.
5. **Fix 6**, off-site. Slowest, largest ceiling, not an engineering task.
