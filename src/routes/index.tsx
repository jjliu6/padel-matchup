import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - JSX component without types
import PadelTournament from "@/components/PadelTournament.jsx";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Padel Matchup — Tournament Manager";
const DESC =
  "Run padel tournaments end-to-end: group stage, Americano rotations, knockout brackets, live standings, big-screen mode, and Excel export.";
const OG_IMAGE = `${SITE}/og-cover.jpg`;

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
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: SITE + "/" }],
  }),
  component: PadelTournament,
});
