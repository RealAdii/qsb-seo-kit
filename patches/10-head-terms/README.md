# Patch 10: ranking for "quantum safe bitcoin"

Goal as stated: get `qsb.fast` to show up when someone searches **"quantum safe
bitcoin"** or **"quantum bitcoin"**.

## What the SERP actually looks like

Searched 2026-09-18. Page one for "quantum safe bitcoin":

| # | Result | Type |
|---|---|---|
| 1 | **starkware.co/blog** first quantum-safe Bitcoin transaction mined | vendor blog |
| 2 | thequantuminsider.com, quantum-safe Bitcoin without a fork | trade press |
| 3 | thequantuminsider.com, BTQ Technologies announcement | competitor PR |
| 4 | coindesk.com, costs $200 a pop | tier-1 crypto press |
| 5 | decrypt.co, without a fork | tier-1 crypto press |
| 6 | technewsworld.com | tech press |
| 7 | decrypt.co, StarkWare says | tier-1 crypto press |
| 8 | gizmodo.com | mainstream tech |
| 9 | fxstreet.com | finance press |

`www.yukon.org/qsb` does not appear.

## The honest verdict, first

**A leaderboard page will not rank for "quantum safe bitcoin", and chasing it
directly is the wrong use of effort.**

That query's intent is informational: people typing it want to know what
quantum-safe Bitcoin *is*. Google fills the page with explainers and news
because that is what satisfies the intent. A page of benchmark numbers does not
answer the question being asked, and no amount of schema, headings or title
tuning changes that. Ranking follows intent match, and the intent here is not a
match.

"quantum bitcoin" is worse: the intent is ambiguous, the volume is dominated by
quantum-computing-threatens-Bitcoin news cycles, and a benchmark page has no
credible claim on it at all.

Saying that plainly, because the alternative is a plan that quietly fails.

**But the goal behind the question is achievable, and it is nearly free**, for a
reason that only became obvious from the SERP.

## Fix 1: StarkWare already owns position 1 and links nowhere

`starkware.co/blog/the-first-quantum-safe-bitcoin-transaction-has-been-mined/`
is the **number one result** for the target query.

Checked its HTML on 2026-09-18:

- mentions of `qsb.fast`: **0**
- mentions of `yukon.org`: **0**
- the only outbound link in the relevant section goes to the GitHub paper PDF

The page that already wins this query is published by the same company, and it
passes nothing to the benchmark.

This is the entire answer to the original question. You do not need to outrank
those nine results. One of them is yours.

**Do this:**

Add to that blog post, ideally in the section discussing transaction cost:

```markdown
The cost of a quantum-safe transaction has fallen substantially since
publication. Live, continuously updated figures and the open GPU grinding
benchmark behind them are at **[qsb.fast](https://qsb.fast)**.
```

Why it works, in order of importance:

1. **Referral traffic.** Position 1 on a head term sends real people who are
   already interested. That is worth more than a rank the benchmark page was
   never going to hold.
2. **Internal authority.** A link from the domain's strongest page on the topic
   is the clearest signal available that `qsb.fast` is the canonical destination
   for the live numbers.
3. **Answer engines.** Every engine summarising "quantum safe bitcoin" is
   already reading that blog post. A link with the words "live" and
   "continuously updated" next to it is how the benchmark enters those answers.

Effort: one paragraph, one internal request. No engineering.

## Fix 2: the number the press does not have

The coverage all quotes the same figure. CoinDesk's headline is literally
**"costs $200 a pop"**. The April reporting range across outlets is **$75 to
$200**.

The live page today says **$72**.

That is a roughly 64% drop from the widely-quoted number, and it is the single
most interesting fact about this project right now. It is also a fact nobody
outside the project has, because there is nowhere to read it except a leaderboard
that no search engine surfaces.

Two things follow.

**2a. Make the cost question answerable on the page.**

There is real, specific search demand here, and it is where the page has a
legitimate claim:

- "how much does a quantum safe bitcoin transaction cost"
- "quantum safe bitcoin transaction cost"
- "quantum safe bitcoin cost 2026"
- "is quantum safe bitcoin cheaper now"

These are long-tail, high-intent, and the page holds the only current answer.
Unlike the head term, this is winnable.

Today the `$72` sits inside an `<h1>` with a hover tooltip and no supporting
content. Give it a short, dated, self-contained block: what the figure is, what
it was at publication, what changed, and when it was last verified. Patch 09
fix 1 and fix 3 already describe the mechanics.

**2b. Tell the outlets that covered it.**

CoinDesk, Decrypt, Gizmodo, The Quantum Insider and TechNewsWorld all published
the $200 figure. "The cost fell 64% in five months, here is the live number and
the open benchmark that drove it" is a genuine follow-up story, not a pitch.

Coverage produces exactly the signals that matter: brand mentions on high-trust
domains, which correlate with AI citation far more strongly than backlinks do.

Not an engineering task. Probably the highest-value item in this entire kit.

## Fix 3: target queries the page can actually win

Realistic targets, roughly by winnability:

| Query | Why it is winnable |
|---|---|
| quantum safe bitcoin transaction cost | page holds the only live figure |
| QSB grinding benchmark | the page is the definitive source |
| quantum safe bitcoin GPU benchmark | no competition |
| fastest ECDSA recovery GPU | genuine first-party data |
| quantum safe bitcoin leaderboard | navigational, should be trivial |
| how much can AI optimize CUDA kernels | unique dataset, real demand |

Patch 06 already lengthens the title toward some of these. Patch 09's
question-shaped headings map onto them directly.

## What not to do

- **Do not stuff "quantum bitcoin" into the title or headings.** It will not
  rank, and it makes the title worse for the queries the page can win.
- **Do not build a thin "what is quantum safe bitcoin" explainer on the
  benchmark page.** It would compete with StarkWare's own #1 result, which is
  the last thing you want, and a shallow duplicate of an existing authoritative
  page is exactly what Google's helpful-content systems demote. Link to the
  blog post instead.
- **Do not buy links or run a guest-post campaign** for a head term the project
  already owns through its own blog.

## Summary

The original goal was "show up for quantum safe bitcoin". The finding is that
**StarkWare already shows up at position 1 and is not passing that to the
benchmark.** Fix that link, make the cost figure answerable and dated, and tell
the outlets that published the old number.

Direct competition for the head term is not the path, and pursuing it would burn
effort on a ranking the page cannot hold.

## Sources

- https://starkware.co/blog/the-first-quantum-safe-bitcoin-transaction-has-been-mined/
- https://www.coindesk.com/markets/2026/04/10/quantum-safe-bitcoin-now-possible-without-a-soft-fork-but-costs-usd200-a-pop
- https://decrypt.co/376767/bitcoin-quantum-safe-transaction-starkware
- https://thequantuminsider.com/2026/04/10/quantum-safe-bitcoin-fork/
- https://gizmodo.com/the-first-quantum-resistant-bitcoin-transaction-has-been-mined-2000804119
