import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Americano Padel Tournament — Rules, Rotation & Scoring Guide";
const DESC =
  "How an Americano padel tournament works: rotating partners every round, individual leaderboards, and points-per-game scoring. Step-by-step with 4–16 player examples.";
const OG_IMAGE = `${SITE}/og-cover.jpg`;
const URL = `${SITE}/guide/americano`;

const HOWTO = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to run an Americano padel tournament",
  description: DESC,
  totalTime: "PT2H",
  tool: [{ "@type": "HowToTool", name: "Padel Matchup" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Enter every player",
      text: "Americano is an individual format — enter one name per player, not per team. Any even number from 4 upward works.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Pick round count",
      text: "Choose how many rounds to play. Padel Matchup rotates partners so each player pairs with as many others as possible.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Choose scoring",
      text: "Americano is usually scored by games won per round (e.g. first to 24 games, or a fixed time per round).",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Share the fixtures",
      text: "Padel Matchup generates round-by-round pairings and a share link. Players see who they play with and against each round.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Track the individual leaderboard",
      text: "Games each player wins accumulate into a personal leaderboard. Export final standings to Excel when the event ends.",
    },
  ],
};

const BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Americano Guide", item: URL },
  ],
};

export const Route = createFileRoute("/guide/americano")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: AmericanoGuide,
});

function AmericanoGuide() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
          <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-blue-700">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">Americano Guide</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
            Americano Padel Tournament
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Padel Matchup is a free tournament manager. This guide explains the
            Americano format: partners rotate every round, everyone plays with
            (and against) as many others as possible, and the leaderboard is
            individual — not by team.
          </p>

          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">What is Americano?</h2>
            <p className="text-slate-700 leading-relaxed">
              Americano is a padel format built around rotation. After each
              round, partners shuffle so that (over enough rounds) every player
              has played with and against every other player. Each player earns
              points from the games their team wins in that round, and those
              points add up on an individual leaderboard.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">When to use it</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Club mixers, socials, and open sessions.</li>
              <li>Clinics and academies where coaches want everyone paired with everyone.</li>
              <li>Groups with mixed levels — rotation balances out weak/strong pairings.</li>
              <li>Any even number of players, 4 and up.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Scoring</h2>
            <p className="text-slate-700 leading-relaxed">
              Americano is normally scored by <strong>games won per round</strong>
              rather than sets. A common setup is "first to 24 games" or a
              fixed timer (e.g. 15 minutes per round). Padel Matchup adds each
              player&apos;s games from every round they play into a single
              cumulative total.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Americano vs round robin</h2>
            <p className="text-slate-700 leading-relaxed">
              The key difference is <strong>who</strong> is ranked. Round robin
              ranks teams — fixed pairs, team-vs-team standings. Americano
              ranks individuals — rotating pairs, personal leaderboard. Use
              Americano when the pairing itself is part of the fun.
            </p>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium"
            >
              Create an Americano →
            </Link>
            <Link
              to="/guide/round-robin"
              className="inline-flex items-center rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 px-5 py-2.5 text-sm font-medium"
            >
              Compare with round robin
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
