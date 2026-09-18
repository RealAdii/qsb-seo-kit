# Patch 05: llms.txt

Serve at `https://www.yukon.org/llms.txt` (put the file in `public/`).

Scope: platform-level.

## Honest framing

llms.txt is a community convention, not a standard any major AI vendor has
committed to reading. No confirmed ranking or citation benefit exists today.

It is included here because the cost is one static file and the content is
already written, and because the failure mode is zero: nothing regresses if it
is ignored. Treat it as Low priority. If the team wants to skip it, skipping it
costs nothing measurable.

The things that actually drive AI citation on this page are patches 01 (Dataset
schema), 02 (heading outline) and 03 (robots.txt), because they make the
benchmark numbers machine-readable and the page structure parseable.
