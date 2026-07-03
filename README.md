# Padel Matchup

Padel Matchup is an open-source tournament manager for padel events. It helps organizers generate fair fixtures, record scores, publish live standings, share read-only or editor links, show a venue-friendly big-screen view, and export results to Excel.

## Features

- **Round robin tournaments** for fixed pairs, including single-league and two-group formats.
- **Americano mode** for rotating partners with individual leaderboards.
- **Knockout bracket support** after the group stage, including semifinals, finals, and third-place matches when enough teams qualify.
- **Live share links** backed by Supabase: viewer links are read-only, editor links can update scores.
- **QR code sharing** so players and spectators can open the live tournament quickly.
- **Big-screen mode** for fixtures, standings, leaderboards, and brackets at the venue.
- **Local persistence** through `localStorage` before publishing to the cloud.
- **Excel export** for fixtures, scores, standings, and knockout results.
- **Bilingual UI** with Chinese-first labels and concise English helpers.

## Tech stack

- React 19
- TanStack Start / TanStack Router
- Vite
- Tailwind CSS 4
- Supabase RPC + Realtime Broadcast
- SheetJS (`xlsx`) for spreadsheet export
- QRCode for share-code generation
- Bun for package management and scripts

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) installed locally.
- A Supabase project if you want cloud sharing and live sync.

### Installation

```bash
bun install
```

### Environment variables

Copy `.env.example` to `.env.local`, then fill in your Supabase values for local development:

```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

For server-side rendering or deployment environments, the app can also read:

```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

Apply the SQL files in `supabase/migrations/` to create the tournament storage and RPC helpers used by the app.

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Lint and type-check

```bash
bun run lint
bun run typecheck
```

## Project structure

```text
src/components/PadelTournament.jsx     Main tournament UI and scheduling logic
src/lib/tournament-cloud.js            Cloud publish/load/save/share helpers
src/integrations/supabase/             Supabase client, auth helpers, and generated types
src/routes/                            TanStack Router routes and page metadata
supabase/migrations/                   Database schema and RPC migrations
public/                                Favicon, Open Graph image, and static assets
```

## Open-source readiness notes

This repository is close to being open-source ready. Recommended next steps:

1. Move the large `PadelTournament.jsx` module into smaller feature modules: scheduling, scoring, export, share modal, setup screen, and big-screen views.
2. Add unit tests for schedule generation, leaderboard ordering, knockout seeding, and Excel export data shaping.
3. Replace generated or Lovable-specific naming with stable public package metadata where appropriate.
4. Document the Supabase RPC contract in more detail for self-hosters.
5. Add a CI workflow that runs `lint`, `typecheck`, and `build` on pull requests.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for local checks and guidelines. Keep changes focused and avoid rewriting published git history because this project is connected to Lovable.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
