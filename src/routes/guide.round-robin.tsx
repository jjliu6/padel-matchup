import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Round Robin Padel Tournament — Format, Rules & How to Run One";
const DESC =
  "How a round robin padel tournament works: fixed pairs, everyone plays everyone, standings by wins and game difference. Step-by-step guide with 4–16 team examples.";
const OG_IMAGE = `${SITE}/og-cover.jpg`;
const URL = `${SITE}/guide/round-robin`;

const HOWTO = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to run a round robin padel tournament",
  description: DESC,
  totalTime: "PT3H",
  tool: [{ "@type": "HowToTool", name: "Padel Matchup" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Fix your pairs",
      text: "Confirm the doubles pairings. In round robin, partners do not rotate — each team stays together for the whole tournament.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Pick single league or two groups",
      text: "Up to 6 teams: single league (every team plays every other team). 6+ teams: split into two groups and add a knockout stage on top.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Choose set format",
      text: "Choose 1 set or best-of-3 sets per match, and how many rounds to schedule.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Generate fixtures and share",
      text: "Padel Matchup generates the fixture list and a share link with QR code. Players open it on their phones; the organizer keeps the editor link.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Record scores live",
      text: "Enter set scores as matches finish. Standings sort by wins first, then game difference. Export everything to Excel at the end.",
    },
  ],
};

const BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Round Robin Guide", item: URL },
  ],
};

export const Route = createFileRoute("/guide/round-robin")({
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
  component: RoundRobinGuide,
});

function RoundRobinGuide() {
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
            <span className="text-slate-700">Round Robin Guide</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
            Round Robin Padel Tournament
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Padel Matchup is a free tournament manager. This guide explains the
            round robin format for padel: fixed pairs, everyone plays everyone,
            ranked by wins and game difference.
          </p>

          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">What is a round robin?</h2>
            <p className="text-slate-700 leading-relaxed">
              A round robin is a format where every team plays every other team
              exactly once. The winner is the team with the most match wins;
              ties are broken by game difference (games won minus games lost),
              then by head-to-head result. Unlike Americano, partners do not
              rotate — the two players on each team stay together for the
              whole event.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">When to use it</h2>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li>Fixed doubles teams (couples, coaches, club pairs).</li>
              <li>4–8 teams for a single afternoon on 1–2 courts.</li>
              <li>Any league or ladder where you want fair, complete play.</li>
              <li>Events where each team should meet every other team on court.</li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">How many matches?</h2>
            <p className="text-slate-700 leading-relaxed">
              A single round robin with <strong>n</strong> teams needs{" "}
              <strong>n × (n − 1) / 2</strong> matches. Four teams = 6 matches,
              six teams = 15 matches, eight teams = 28 matches. If time is
              tight, use two groups instead of one league and add a short
              knockout on top.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Scoring &amp; tiebreakers</h2>
            <p className="text-slate-700 leading-relaxed">
              Choose 1 set or best-of-3 per match at setup. Each set is scored
              the standard padel way (games to 6, tiebreak at 6–6). Padel
              Matchup records set scores automatically and orders the standings
              by wins first, then game difference, then head-to-head.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Two-group round robin + knockout</h2>
            <p className="text-slate-700 leading-relaxed">
              With 6+ teams, split into Group A and Group B. Each group plays
              its own mini round robin, then the top N per group cross into
              semifinals (A1 vs B2, B1 vs A2), followed by the final and a
              third-place match.
            </p>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium"
            >
              Create a round robin →
            </Link>
            <Link
              to="/guide/americano"
              className="inline-flex items-center rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 px-5 py-2.5 text-sm font-medium"
            >
              Compare with Americano
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
