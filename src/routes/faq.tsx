import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://padel-matchup.philosophie.ai";
const TITLE = "Padel Tournament FAQ — Formats, Scoring, Americano vs Round Robin";
const DESC =
  "Answers to common questions about running a padel tournament: round robin vs Americano vs knockout, scoring, group stage rules, share links, and Excel export.";
const OG_IMAGE = `${SITE}/og-cover.jpg`;

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Padel Matchup?",
    a: "Padel Matchup is a free, open-source tournament manager for padel. It generates fixtures for round robin, Americano, and knockout formats, tracks scores in real time, publishes standings, and exports everything to Excel. No signup is required to create or view a tournament.",
  },
  {
    q: "What's the difference between round robin and Americano in padel?",
    a: "Round robin keeps fixed pairs — the same two players play together for every match — and ranks teams by wins. Americano rotates partners every round so each player has a personal leaderboard rather than a team leaderboard. Use round robin when partnerships are set (couples, coaches, doubles teams); use Americano for mixers, socials, or clinics where everyone should play with and against everyone.",
  },
  {
    q: "How many players or teams do I need?",
    a: "Round robin works with 2 or more teams, though 4–8 is the sweet spot for a single afternoon. Two-group round robin needs at least 6 teams (3 per group). Americano runs cleanly with any even number of players from 4 upward. Knockout brackets kick in automatically after the group stage when enough teams qualify to fill semifinals or a final.",
  },
  {
    q: "How does scoring work?",
    a: "You choose 1 set or best-of-3 sets per match during setup. Each set is scored the standard padel way (games to 6, tiebreak at 6–6). Padel Matchup records set scores, computes wins/losses, game difference, and points, and orders the standings by wins first and game difference as the tiebreaker.",
  },
  {
    q: "How does the knockout bracket work after the group stage?",
    a: "When you use two-group round robin with 'Advance top N per group', qualified teams are seeded into crossover semifinals (A1 vs B2, B1 vs A2), followed by the final and a third-place match. With only two qualifying teams the app produces a direct winners' final instead. Seeds are shown next to each team so players can trace how they got there.",
  },
  {
    q: "Can players and spectators follow the tournament live?",
    a: "Yes. Every published tournament has a read-only viewer link and a QR code — share either at the venue and anyone can open the live fixtures, standings, and brackets on their phone. As the organizer updates scores from the editor link, viewers see the changes in near real time.",
  },
  {
    q: "Is there a big-screen mode for the venue?",
    a: "Yes. Big-screen mode rotates through fixtures, standings, the Americano leaderboard, and the knockout bracket in a layout tuned for a TV or projector at the club. It uses the same live data as the share link, so nothing extra to configure.",
  },
  {
    q: "Can I export results to Excel?",
    a: "Yes. The Export button produces a single Excel file containing fixtures, set-by-set scores, standings, and knockout results. Use it for post-tournament reporting, prize allocation, or archiving league seasons.",
  },
  {
    q: "Does Padel Matchup cost anything?",
    a: "The hosted version at padel-matchup.philosophie.ai is free with no signup and no per-tournament limits. The source is MIT-licensed on GitHub so clubs and academies can self-host. Custom deployments with branding, private hosting, or bespoke formats are available from Philosophie AI on request.",
  },
  {
    q: "What languages does the interface support?",
    a: "Three: a bilingual Chinese/English default at /, an English-only interface at /en, and a Spanish-only interface at /es for pádel communities across Spain and Latin America. Switch anytime from the language menu in the header.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE}/faq` },
  ],
};

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE}/faq` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE}/faq` }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
          <nav className="text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-blue-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">FAQ</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 tracking-tight">
            Padel Tournament FAQ
          </h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Common questions about running a padel tournament with Padel Matchup —
            formats, scoring, share links, and export. Padel Matchup is a free
            open-source tournament manager for round robin, Americano, and
            knockout formats.
          </p>

          <div className="mt-10 space-y-6">
            {FAQS.map((f) => (
              <article
                key={f.q}
                className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 md:p-6"
              >
                <h2 className="text-lg md:text-xl font-semibold text-blue-900">
                  {f.q}
                </h2>
                <p className="mt-2 text-slate-700 leading-relaxed">{f.a}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Start a tournament →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
