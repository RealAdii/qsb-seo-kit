# Patch 11: route everything through the Quantum Hub

Goal: make `https://quantum.starkware.co/` the hub that the post-quantum work
links back to, so topical authority consolidates on one owned property instead
of scattering.

## The link graph as it stands

Measured 2026-09-18.

| Property | What it is | Links to hub | Links to qsb.fast |
|---|---|---|---|
| `starkware.co/blog/...has-been-mined/` | **#1 result** for "quantum safe bitcoin" | no | no |
| `quantum.starkware.co` | the Quantum Hub | n/a | **no** |
| `www.yukon.org/qsb` (qsb.fast) | the live benchmark | **no** | n/a |

Three properties covering one topic. **Not one of them links to another on that
topic.** The only outbound link on the hub goes to a StarkWare blog post about
Google's quantum attack estimate; the only StarkWare link on the QSB page goes
to the `starkware.co` homepage.

Every one of these is a link someone at StarkWare can add. None require
outreach.

## The correction to make before doing this

"Make everything link back to the hub" is the right instinct and the wrong
shape if taken literally.

Links flow authority in the direction they point. If every property links **to**
the hub and the hub links **out** to nothing, the hub ranks and the spokes stay
invisible. That directly undoes patch 10, whose entire goal is getting
`qsb.fast` to surface.

The structure that works for both is **bidirectional hub and spoke**:

```
                  quantum.starkware.co
                   (head terms: post-quantum,
                    cryptographic agility)
                    ↑        ↓
          ┌─────────┘        └─────────┐
          ↓                            ↓
   starkware.co/blog              qsb.fast
   (news, #1 for the             (cost, benchmark,
    head term)                    live numbers)
```

The hub owns the broad head terms. Each spoke owns the specific query it can
actually win. They reinforce each other rather than compete, and a crawler
reading any one of them can reach the whole topic cluster.

Concretely: **add the hub link to every spoke, and add spoke links to the hub.**
Doing only the first half is the failure mode.

## Fix 1: spokes link to the hub

### On `www.yukon.org/qsb`

In the footer, or near the StarkWare logo that is already on the page:

```jsx
<a href="https://quantum.starkware.co/">
  Post-quantum research at StarkWare
</a>
```

Ownership note: `yukon.org` is not a StarkWare property, so this is a
cross-domain link and needs the Yukon team to agree. That also makes it the
**most valuable** link in this patch: an external backlink from an independent
domain is worth considerably more than an internal one. It is a reasonable ask,
since the page already carries StarkWare branding and an "In collaboration with"
label.

### On `starkware.co/blog/...has-been-mined/`

Internal, so no negotiation needed. Alongside the `qsb.fast` link from patch 10:

```markdown
For StarkWare's wider post-quantum research, migration path and architecture,
see the [Quantum Hub](https://quantum.starkware.co/).
```

This is the highest-authority page on the topic. A link from it is the single
strongest internal signal available to the hub.

## Fix 2: the hub links to the spokes

Currently missing entirely, and it is the half that makes the cluster work.

The hub has four sections: Foundations, Migration, Architecture, Learn. QSB fits
**Learn** ("Definitions, StarkWare content and primary sources on post-quantum
security") and arguably deserves its own featured slot, since it is the most
newsworthy post-quantum work StarkWare has shipped.

Suggested addition to the featured area, which already highlights `ecdsa.fail`:

```
Quantum-safe Bitcoin is live on mainnet, and the cost is falling.
→ Read the research (starkware.co/blog)
→ Live benchmark and current cost (qsb.fast)
```

Both links, not one. The blog post explains it; the benchmark has the current
number.

## Fix 3: vary the anchor text

Do not use the identical phrase everywhere. Natural variation across these
reads as editorial linking rather than a template:

- Quantum Hub
- StarkWare post-quantum research
- Starknet cryptographic agility
- post-quantum migration path

Match the anchor to what the destination section actually covers.

## Fix 4: the hub needs to be able to hold the authority

If the hub is going to be the destination, it should be capable of ranking.
Checked 2026-09-18:

**Already right**, and notably ahead of `yukon.org` here:

- `robots.txt`, `sitemap.xml` and `llms.txt` all return 200
- canonical set, `robots: index, follow`
- clear four-part information architecture

**Gaps**, the same two that patch 01 and patch 02 address on the QSB page:

- **Zero JSON-LD.** No structured data at all. `WebSite` plus `Organization`
  plus a `CollectionPage` with an `ItemList` of the four sections would describe
  what this page is. The pattern in `patches/01-jsonld/` transfers directly.
- **110 words, one `<h1>`, zero `<h2>`.** Same heading problem as the QSB page.
  The four section labels (Foundations, Migration, Architecture, Learn) are the
  obvious `<h2>` candidates. If they are currently links or buttons, use the
  `sr-only` approach from `patches/02-headings/` rather than retagging them.

110 words is thin for a page meant to be the topical authority for a competitive
subject. The four section pages carry the depth, so the hub works as a directory,
but a short framing paragraph explaining what cryptographic agility means and
why it matters would give it something to rank on besides navigation.

## Priority

1. **Fix 2**, the hub links out to the blog post and `qsb.fast`. Fully internal
   to the PMM team, and it is the half most likely to be skipped.
2. **Fix 1**, the `starkware.co` blog post links to the hub. Internal, one line,
   highest-authority source page.
3. **Fix 1**, the QSB page links to the hub. Needs the Yukon team, worth the ask
   because it is a genuine external backlink.
4. **Fix 4**, hub JSON-LD and headings. Same work as patches 01 and 02, already
   drafted.

## Verify

```bash
# each property should link to the other two on this topic
curl -sL https://quantum.starkware.co/ | grep -o 'qsb\.fast'
curl -sL https://starkware.co/blog/the-first-quantum-safe-bitcoin-transaction-has-been-mined/ | grep -o 'quantum\.starkware\.co'
curl -sL https://qsb.fast | grep -o 'quantum\.starkware\.co'
```

All three return nothing today. All three should return a match when this patch
is done.
