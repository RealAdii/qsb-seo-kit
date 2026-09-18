# Patch 07: make the qsb.fast redirect permanent

## Measured today (2026-09-18)

```
https://qsb.fast        307  ->  https://yukon.org/qsb
https://yukon.org/qsb   308  ->  https://www.yukon.org/qsb
```

Hop two is already correct. Hop one is a **307 Temporary Redirect**.

## Why it matters

307 tells search engines "this move is temporary, keep the old URL indexed and
do not transfer signals to the target yet." 308 means permanent, consolidate on
the target. For a vanity domain that will always point at the challenge page,
307 is simply the wrong verb, and it leaves qsb.fast and www.yukon.org/qsb
competing rather than compounding.

307 is Vercel's default for a domain redirect configured in the dashboard with
the permanent toggle off. It is a one-click fix, not a code change.

## Fix A: Vercel dashboard (most likely where this lives)

Project Settings, Domains, the `qsb.fast` entry, edit the redirect, enable
**Permanent (308)**. Nothing to deploy.

## Fix B: vercel.json, if the alias is configured in code

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "qsb.fast" }],
      "destination": "https://www.yukon.org/qsb/:path*",
      "permanent": true
    }
  ]
}
```

`"permanent": true` emits 308. Note this also collapses both hops into one,
which is the better outcome: every redirect hop costs latency on a real user's
first paint.

## Collapsing both hops

Ideal end state is a single hop:

```
https://qsb.fast  308  ->  https://www.yukon.org/qsb
```

Point the `qsb.fast` redirect target directly at the `www` host rather than the
apex, so the apex-to-www 308 never runs for these visitors.

## Verify

```bash
curl -sI https://qsb.fast | head -3
# want: HTTP/2 308  +  location: https://www.yukon.org/qsb
```

Zero design impact.
