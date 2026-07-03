# Contributing to Padel Matchup

Thanks for helping improve Padel Matchup. This project is intended to be easy to run, review, and contribute to.

## Local checks

Before opening a pull request, run:

```bash
bun run lint
bun run typecheck
bun run build
```

## Development notes

- Keep pull requests focused and small where possible.
- Avoid committing secrets. Use `.env.local` for local values and `.env.example` as the public template.
- Do not rewrite published git history. This repository is connected to Lovable, and rewriting pushed commits can break the project history in Lovable.
- For larger changes, prefer adding tests around the scheduling, scoring, leaderboard, knockout, and export logic first.

## Good first areas

- Split `src/components/PadelTournament.jsx` into smaller modules.
- Add unit tests for schedule generation and leaderboard ordering.
- Improve Supabase self-hosting documentation.
- Reduce production bundle size by code-splitting Excel export and QR generation.
