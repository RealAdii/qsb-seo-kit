// app/sitemap.ts  (Next.js App Router, root of the Yukon app)
//
// Today https://www.yukon.org/sitemap.xml returns 404.
//
// Scope note: platform-level, same owner as robots.ts.
// Renders no UI. Zero design impact.
//
// The URL list below was discovered by crawling the live homepage on
// 2026-09-18. Replace the hardcoded array with whatever the app already uses
// as its source of truth for open challenges: a hand-maintained list will rot,
// and a stale sitemap is worse than none.

import type { MetadataRoute } from "next"

const BASE = "https://www.yukon.org"

// Challenges linked from the homepage. Prefer generating this.
const CHALLENGES = [
  "flock",
  "frontiercs",
  "heesch",
  "lighter",
  "matrices",
  "precompile",
  "qsb",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/leaderboard`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    ...CHALLENGES.map((slug) => ({
      url: `${BASE}/${slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    { url: `${BASE}/create`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/qsb/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/qsb/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}

// Deliberately excluded:
//   /mlxfast/archive  (archived challenge; include only if it should rank)
// Do not list any path that returns the noindex 404 page.
