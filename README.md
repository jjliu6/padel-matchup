# Padel Matchup

Padel Matchup is an open-source tournament manager for padel events. It helps organizers generate fair fixtures, record scores, publish live standings, share read-only or editor links, show a venue-friendly big-screen view, and export results to Excel.

Free hosted version: [padel-matchup.philosophie.ai](https://padel-matchup.philosophie.ai/)

## Features

- **Round robin tournaments** for fixed pairs, including single-league and two-group formats.
- **Americano mode** for rotating partners with individual leaderboards.
- **Knockout bracket support** after the group stage, including semifinals, finals, and third-place matches when enough teams qualify.
- **Live share links** backed by Supabase: viewer links are read-only, editor links can update scores.
- **QR code sharing** so players and spectators can open the live tournament quickly.
- **Big-screen mode** for fixtures, standings, leaderboards, and brackets at the venue.
- **Local persistence** through `localStorage` before publishing to the cloud.
- **Excel export** for fixtures, scores, standings, and knockout results.
- **Trilingual UI** — bilingual Chinese/English by default at `/`, plus dedicated English-only (`/en`) and Spanish-only (`/es`) interfaces, switchable from the header language menu.

## Tech stack

- React 19
- TanStack Start / TanStack Router
- Vite
- Tailwind CSS 4
- Supabase RPC + Realtime Broadcast
- SheetJS (`xlsx`) for spreadsheet export
- QRCode for share-code generation
- Bun for package management and scripts

## 中文快速说明

Padel Matchup 是一个面向板式网球赛事组织者的开源工具，支持固定搭档循环赛、双小组出线、Americano 非固定搭档、淘汰赛、大屏展示、扫码分享、实时同步和 Excel 导出。

免费在线版本：[https://padel-matchup.philosophie.ai/](https://padel-matchup.philosophie.ai/)

如果你准备把项目正式开源，建议优先确认三件事：

1. 已选择并提交开源协议，本仓库当前使用 MIT License。
2. `.env.local` 不要提交到仓库，公开配置请参考 `.env.example`。
3. 发布前至少运行 `bun run lint`、`bun run typecheck`、`bun run build`。

## Resumen en español

Padel Matchup es una herramienta de código abierto para organizar torneos de pádel, uno de los deportes de raqueta con más crecimiento en España y Latinoamérica. Genera calendarios de fase de grupos, rotaciones Americano y cuadros de eliminatoria, guarda los resultados en tiempo real, muestra la clasificación en una pantalla grande para el club y exporta todo a Excel.

Versión gratuita en línea (interfaz 100% en español): [padel-matchup.philosophie.ai/es](https://padel-matchup.philosophie.ai/es/)

El proyecto está licenciado bajo MIT (ver [LICENSE](./LICENSE)); el nombre "Padel Matchup" y la marca de Philosophie AI quedan fuera de esa licencia. Para dudas o despliegues personalizados: [junjie@philosophie.ai](mailto:junjie@philosophie.ai).

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

## SEO & GEO

The site ships the standard discovery and citability surface for both search engines and AI answer engines (GEO — Generative Engine Optimization):

- `public/robots.txt` — allows general crawlers plus AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) and points to the sitemap.
- `public/sitemap.xml` — lists the public URL(s).
- `public/llms.txt` — a plain-language summary of the product for AI assistants, per the [llms.txt convention](https://llmstxt.org/).
- `src/routes/index.tsx` — Open Graph/Twitter meta tags plus a `SoftwareApplication` JSON-LD block.
- `src/routes/__root.tsx` — site-wide fallback meta (title, description, robots, favicon).

When adding new routes, give each a `head()` with its own title/description/canonical, and add the URL to `sitemap.xml` if it should be publicly indexed.

## Open-source readiness notes

This repository is close to being open-source ready. Recommended next steps:

1. Move the large `PadelTournament.jsx` module into smaller feature modules: scheduling, scoring, export, share modal, setup screen, and big-screen views.
2. Add unit tests for schedule generation, leaderboard ordering, knockout seeding, and Excel export data shaping.
3. Replace generated or Lovable-specific naming with stable public package metadata where appropriate.
4. Document the Supabase RPC contract in more detail for self-hosters.
5. Add a CI workflow that runs `lint`, `typecheck`, and `build` on pull requests.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for local checks and guidelines. Keep changes focused and avoid rewriting published git history because this project is connected to Lovable.

## Hosted version and customization

You can use the free hosted version at [padel-matchup.philosophie.ai](https://padel-matchup.philosophie.ai/) without running your own deployment. It is intended for clubs, coaches, organizers, and players who need a lightweight tournament tool quickly.

If you need a custom deployment for a club, academy, league, brand event, or internal competition, Philosophie AI can help adapt the project with:

- Custom branding, domain, colors, and event copy.
- Private hosting or organization-specific Supabase setup.
- Custom tournament formats, scoring rules, ranking tiebreakers, and export templates.
- Integrations with registration forms, membership systems, payment flows, or club operations.
- On-site tournament workflows such as check-in, live display, QR cards, or organizer dashboards.

For questions, feedback, or customization requests, contact: [junjie@philosophie.ai](mailto:junjie@philosophie.ai).

Learn more about Philosophie AI at [philosophie.ai](https://philosophie.ai/).

## Brand notice

The MIT License covers the source code in this repository. The Padel Matchup name, logos, hosted `philosophie.ai` domains, and Philosophie AI brand assets are not included in the code license and should not be used to imply official endorsement or affiliation. If you deploy your own instance, use your own app name, branding, and domain.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
