# Verifying the zero design change claim

Every patch here is intended to be invisible. That claim is only worth something
if it is checked against rendered pixels rather than reasoned about from source.

## Why each patch cannot change the design

| Patch | Renders | Reasoning |
|---|---|---|
| 01 JSON-LD | nothing | `<script type="application/ld+json">` has no layout box and is never painted |
| 02 headings | nothing | `sr-only` is `position:absolute` at 1px with `clip`, so it is out of normal flow and contributes no space |
| 03 robots.txt | nothing | separate file, never rendered |
| 04 sitemap.xml | nothing | separate file, never rendered |
| 05 llms.txt | nothing | separate file, never rendered |
| 06 metadata | browser tab text only | `<title>` changes the tab label. This is the one user-visible change in the kit and it is not page design |
| 07 redirects | nothing | HTTP status code on a hop the user never sees |
| 08 cache | nothing | response header, affects only how fast the same bytes arrive |

Patch 02 is the only one touching the DOM, so it is the only one that needs a
pixel check.

## The pixel check for patch 02

Do not skip this because the reasoning above looks airtight. Reasoning about CSS
is exactly where invisible regressions come from: if the Tailwind build has a
customized `sr-only`, or a global `h2 { }` rule exists outside Preflight, the
argument breaks.

1. Screenshot `/qsb` before the change, at 390px and 1440px wide.
2. Apply patch 02.
3. Screenshot again at the same two widths.
4. Diff the images. They should be byte-identical apart from any live number
   that ticked over between captures.

Playwright, if it is easier than doing it by hand:

```js
// npx playwright test, or run with node after `npm i -D playwright`
import { chromium } from "playwright"

const shot = async (url, file, width) => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width, height: 900 } })
  await p.goto(url, { waitUntil: "networkidle" })
  await p.screenshot({ path: file, fullPage: true })
  await b.close()
}

await shot("http://localhost:3000/qsb", "after-390.png", 390)
await shot("http://localhost:3000/qsb", "after-1440.png", 1440)
```

Then `compare -metric AE before-390.png after-390.png null:` (ImageMagick), or
any image diff tool.

## Confirming the headings actually took effect

A heading that is invisible to a person still has to be visible to a crawler.
Check the shipped HTML, not the JSX:

```bash
curl -sL https://www.yukon.org/qsb | grep -o '<h[1-6][ >]' | sort | uniq -c
```

Before: `1 <h1 `, nothing else.
After: `1 <h1 ` plus one `<h2 ` per section.

## Confirming the whole kit

```bash
node scripts/check-seo.mjs https://your-preview-url
```

Run it against a preview deployment before merging, and against production
after. `--ci` makes it exit non-zero on failures so it can gate a build.

## A note on this repo's own advice

The check script includes a leaked-markdown test on rendered prose. That is
there because it is a real failure mode: source syntax surviving into the page
as literal text (table pipes, `**bold**`, `---` rows) passes every build and
type check while looking broken to every reader. `/qsb` is clean on this today.
It is in the script so it stays clean.
