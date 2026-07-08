import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Padel Knockout Bracket — Semifinals, Final & Third-Place Guide";
const DESC =
  "How the knockout stage works after a padel group stage: crossover semifinals (A1 vs B2, B1 vs A2), final, and third-place match. Seeding, byes, and bracket rules.";
const OG_IMAGE = `${SITE}/og-cover.jpg`;
const URL = `${SITE}/guide/knockout`;

const HOWTO = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to run a padel knockout stage after the group stage",
  description: DESC,
  totalTime: "PT2H",
  tool: [{ "@type": "HowToTool", name: "Padel Matchup" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Finish the group stage",
      text: "Complete the two-group round robin so standings inside each group are final.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Set how many advance per group",
      text: "Choose top 1 or top 2 per group. Top 2 gives you crossover semifinals; top 1 gives a direct final.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Seed the bracket",
      text: "Padel Matchup pairs A1 vs B2 and B1 vs A2 automatically. Group winners cannot meet before the final.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Play semifinals, third-place, and final",
      text: "Losers of the semifinals meet in the third-place match; winners meet in the final. All four matches appear as a live bracket on the share link.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Export or reset",
      text: "Export the whole event (group + bracket) to Excel, or start a new tournament from scratch.",
    },
  ],
};

const BREADCRUMB = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Knockout Guide", item: URL },
  ],
};

export const Route = createFileRoute("/guide/knockout")({
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
  component: KnockoutGuide,
});

function KnockoutGuide() {
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
            <span className="text-slate-700">Knockout Guide</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
            Padel Knockout Bracket
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Padel Matchup is a free tournament manager. This guide explains how
            the knockout stage — semifinals, final, and third-place match —
            works on top of a two-group round robin.
          </p>

          <section className="mt-10 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">When a knockout stage kicks in</h2>
            <p className="text-slate-700 leading-relaxed">
              Use knockouts after a <strong>two-group round robin</strong>. Once
              you set "Advance top N per group", Padel Matchup takes the
              qualifying teams and builds a bracket. With top 2 per group
              (4 teams), you get semifinals + final + third place. With top 1
              per group (2 teams), you get a direct final.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Seeding: A1 vs B2, B1 vs A2</h2>
            <p className="text-slate-700 leading-relaxed">
              Crossover seeding ensures the two group winners cannot meet
              before the final. The seed number next to each team on the
              bracket shows how they qualified: <em>A1</em> = Group A winner,
              <em> B2</em> = Group B runner-up, and so on.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Third-place and final</h2>
            <p className="text-slate-700 leading-relaxed">
              The two semifinal losers meet in the third-place match. The two
              semifinal winners meet in the final. Both matches appear side by
              side in the live bracket, and can be scored in any order — a
              typical schedule plays them on adjacent courts at the same time.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-blue-900">Byes and odd numbers</h2>
            <p className="text-slate-700 leading-relaxed">
              For classic single-elimination brackets, the number of teams
              should be a power of two (2, 4, 8, 16). If it isn&apos;t, the
              standard fix is to give the top seeds a first-round bye so the
              remaining bracket becomes a power of two. Padel Matchup&apos;s
              built-in knockout is optimized for 2- or 4-team playoffs after a
              group stage.
            </p>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium"
            >
              Start a tournament →
            </Link>
            <Link
              to="/guide/round-robin"
              className="inline-flex items-center rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 px-5 py-2.5 text-sm font-medium"
            >
              Round robin guide
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
