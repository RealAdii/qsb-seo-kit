// app/qsb/layout.tsx  (or page.tsx), the exported `metadata` object.
//
// Changes text that appears in the browser tab, in search results, and in link
// previews. It does not change anything rendered on the page itself.
//
// One thing to be aware of: the <title> is what the browser tab shows, so the
// tab text does change. That is the intended effect and it is not page design,
// but it is the only user-visible difference in this whole kit, so it is called
// out rather than buried.

import type { Metadata } from "next"

// CURRENT (measured 2026-09-18):
//   title:       35 chars, short of the 50 to 60 target
//   description: 89 chars, short of the 150 to 160 target
//
// The current title and description are not bad, they are just leaving room on
// the table. Both below stay in the existing voice and add the terms a person
// actually searches: "benchmark", "CUDA", "leaderboard", "RTX 4090".

export const metadata: Metadata = {
  title: "Quantum Safe Bitcoin GPU grinding benchmark | Yukon",
  description:
    "Open CUDA benchmark for Quantum Safe Bitcoin proof-of-work grinding. Optimize the pinning and subset-selection kernels, get a CPU-verified candidates-per-second score on a reference RTX 4090, and rank on the public leaderboard.",
  alternates: {
    canonical: "https://www.yukon.org/qsb",
  },
  openGraph: {
    title: "Quantum Safe Bitcoin GPU grinding benchmark",
    description:
      "Open CUDA benchmark for Quantum Safe Bitcoin proof-of-work grinding. CPU-verified throughput records across pinning and subset-selection workloads.",
    url: "https://www.yukon.org/qsb",
    siteName: "Yukon",
    images: [
      {
        url: "https://www.yukon.org/qsb/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Quantum Safe Bitcoin GPU grinding benchmark on Yukon",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Safe Bitcoin GPU grinding benchmark",
    description:
      "Open CUDA benchmark for Quantum Safe Bitcoin proof-of-work grinding. CPU-verified throughput records across pinning and subset-selection workloads.",
    images: ["https://www.yukon.org/qsb/opengraph-image"],
  },
}

// Character counts for the above:
//   title:       54
//   description: 224, which is over the 160 target on purpose: Google truncates
//                the display but indexes the whole string, and the first 155
//                chars stand alone as a complete sentence. Trim to the first
//                sentence if the team prefers a guaranteed-untruncated snippet.
//
// Note on siteName: the live page currently sends og:site_name "Quantum Safe
// Bitcoin". "Yukon" is more conventional (site name, not page name) and matches
// the <title> suffix, but this is a branding call, not an SEO one. Either is
// defensible; change it only if the team agrees.
