import { createFileRoute } from "@tanstack/react-router";
import PadelTournament from "@/components/PadelTournament.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Padel Tournament Manager" },
      { name: "description", content: "Organize and run padel tournaments: group stage, Americano, knockout brackets, live standings, and Excel export." },
      { property: "og:title", content: "Padel Tournament Manager" },
      { property: "og:description", content: "Organize and run padel tournaments: group stage, Americano, knockout brackets, live standings, and Excel export." },
    ],
  }),
  component: PadelTournament,
});
