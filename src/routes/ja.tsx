import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX component without types
import PadelTournament from "@/components/PadelTournament.jsx";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Padel Matchup — トーナメント管理";
const DESC =
  "パデルの大会運営を一括サポート：グループステージ、アメリカーノのローテーション、決勝トーナメント、ライブ順位表、ビッグスクリーンモード、Excelエクスポートまで対応。";
const OG_IMAGE = `${SITE}/og-cover.jpg`;

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Padel Matchup",
  url: SITE + "/ja",
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

export const Route = createFileRoute("/ja")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE + "/ja" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { property: "og:locale", content: "ja_JP" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: SITE + "/ja" },
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
  component: JapanesePage,
});

function JapanesePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <PadelTournament initialLang="ja" />
    </>
  );
}
