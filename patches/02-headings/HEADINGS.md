# Patch 02: heading outline

## The problem

`https://www.yukon.org/qsb` has exactly one heading element: the `<h1>`.
Zero `<h2>` through `<h6>`, across 784 words of visible text.

Verify before and after:

```bash
curl -sL https://www.yukon.org/qsb | grep -o '<h[1-6][ >]' | sort | uniq -c
```

The section labels a reader sees (How it works, Participate, Improvement
History, Leaderboard) are **not** unstyled headings that can be swapped. They
are `<button>` tab controls and one nav `<a>`. Retagging them would be wrong on
both counts: it breaks the `role="tab"` contract, and it would change design,
because a `<button>` and an `<h2>` are not interchangeable boxes.

So this patch does not touch any existing element.

## The fix: `sr-only` headings

Add one visually hidden `<h2>` at the top of each section. `sr-only` is already
in use on this page, so the utility is present in the Tailwind build and needs
no CSS change.

Tailwind's `sr-only` compiles to:

```css
position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
```

`position: absolute` plus 1px box removes the element from normal flow entirely.
It contributes nothing to layout, occupies no space, paints no pixels. This is
the single reason the patch qualifies as zero design change, and it is worth
confirming in the browser rather than taking on trust (see VERIFY.md).

## Exact edits

Two `<section>` elements exist today.

### Section 1, the hero (currently has no `aria-label`)

```diff
  <section className="relative w-full min-w-0 overflow-hidden rounded-2xl bg-hero px-5 py-6 text-hero-ink shadow-lift sm:px-9 sm:py-10">
+   <h2 className="sr-only">Estimated Quantum Safe Bitcoin transaction cost</h2>
```

### Section 2, the leaderboard (already has `aria-label="Leaderboard"`)

```diff
  <section aria-label="Leaderboard" className="min-w-0 rounded-xl border border-line bg-surface p-3 sm:p-6">
+   <h2 className="sr-only">Leaderboard: verified candidate throughput records</h2>
```

Once the `<h2>` is there, `aria-label="Leaderboard"` is redundant and slightly
worse: prefer pointing the section at the real heading, so assistive tech and
crawlers agree on one label.

```diff
- <section aria-label="Leaderboard" className="...">
+ <section aria-labelledby="leaderboard-heading" className="...">
+   <h2 id="leaderboard-heading" className="sr-only">Leaderboard: verified candidate throughput records</h2>
```

### Two regions that are not yet sections

The "How it works" and "Participate" tab panels are the other substantial
content blocks. If each panel has a wrapper element, give it the same treatment:

```diff
- <div role="tabpanel" ...>
+ <div role="tabpanel" aria-labelledby="howitworks-heading" ...>
+   <h2 id="howitworks-heading" className="sr-only">How the benchmark works</h2>
```

Keep the existing `role="tabpanel"` and `aria-controls` wiring as it is. Adding
a heading inside a panel does not conflict with the tab pattern.

## What this is not

This does not make the hidden text a ranking keyword trick. The headings
describe content that is genuinely on the page and visible to every reader. That
is the supported use of `sr-only`. Do not put anything in these headings that a
sighted reader cannot also find on the page.

## Secondary: the `<h1>` wraps a control

The `<h1>` currently contains the cost sentence **and** the info disclosure
button:

```html
<h1 class="text-balance ..."> A Quantum Safe Bitcoin transaction now costs an
  estimated <span class="font-mono ...">$72</span>.
  <span class="group static ml-2 inline-flex align-middle">
    <button type="button" aria-label="How the transaction cost is estimated" ...>
```

The accessible name of the `<h1>` therefore includes the button's label, so the
document's top-level heading reads as "...costs an estimated $72. How the
transaction cost is estimated" to a crawler and a screen reader.

Moving the button to a sibling of the `<h1>` fixes this, but whether that is
possible without a visual shift depends on the inline flow around it, which is
why it is listed separately here and not bundled into the diff above. If it
cannot be moved cleanly, the cheaper zero-risk option is:

```diff
- <span class="group static ml-2 inline-flex align-middle">
+ <span class="group static ml-2 inline-flex align-middle" aria-hidden="false" role="presentation">
```

which is not ideal either. Recommendation: try the sibling move, verify the
rendered pixels are unchanged, and fall back to leaving it alone. This one is
Medium priority, not Critical.
