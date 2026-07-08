import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX component without types
import PadelTournament from "@/components/PadelTournament.jsx";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Padel Matchup — Tournament Manager";
const DESC =
  "Run padel tournaments end-to-end: group stage, Americano rotations, knockout brackets, live standings, big-screen mode, and Excel export.";
const OG_IMAGE = `${SITE}/og-cover.jpg`;

// SoftwareApplication schema so search and AI answer engines can cite what
// Padel Matchup is, that it's free, and where the source lives.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Padel Matchup",
  url: SITE + "/",
  description: DESC,
  applicationCategory: "SportsApplication",
  operatingSystem: "Any (web-based)",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  image: OG_IMAGE,
  publisher: {
    "@type": "Organization",
    name: "Philosophie AI",
    url: "https://philosophie.ai/",
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE + "/" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: SITE + "/" },
      { rel: "alternate", hreflang: "x-default", href: SITE + "/" },
      { rel: "alternate", hreflang: "zh", href: SITE + "/zh" },
      { rel: "alternate", hreflang: "en", href: SITE + "/" },
      { rel: "alternate", hreflang: "es", href: SITE + "/es" },
      { rel: "alternate", hreflang: "it", href: SITE + "/it" },
      { rel: "alternate", hreflang: "fr", href: SITE + "/fr" },
      { rel: "alternate", hreflang: "pt", href: SITE + "/pt" },
      { rel: "alternate", hreflang: "nl", href: SITE + "/nl" },
      { rel: "alternate", hreflang: "de", href: SITE + "/de" },
      { rel: "alternate", hreflang: "ja", href: SITE + "/ja" },
      { rel: "alternate", hreflang: "ko", href: SITE + "/ko" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <PadelTournament initialLang="en" />
    </>
  );
}
