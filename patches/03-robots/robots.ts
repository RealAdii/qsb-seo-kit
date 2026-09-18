// app/robots.ts  (Next.js App Router, root of the Yukon app)
//
// Today https://www.yukon.org/robots.txt returns 404, served as an HTML
// soft-404. Nothing is blocked by that, crawlers default to "allowed", but it
// means there is no place to declare the sitemap and no explicit signal for AI
// crawlers.
//
// Scope note: this is a platform-level file, not a QSB-only one. It belongs to
// whoever owns the Yukon Next.js root.
//
// This renders no UI. Zero design impact.

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Challenge pages that are not open yet already return a noindex 404
        // page, so nothing extra needs disallowing here today. Add paths as
        // they appear rather than pre-emptively.
      },
      // Explicit allow for AI crawlers. These are already covered by the
      // wildcard above; stating them is a deliberate signal that citation is
      // welcome, and it gives one obvious place to revoke that later.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: "https://www.yukon.org/sitemap.xml",
    host: "https://www.yukon.org",
  }
}
