import { createFileRoute, redirect } from "@tanstack/react-router";

// The English interface now lives at "/" (the site default), so this
// legacy path just forwards old links/bookmarks there instead of serving
// duplicate content.
export const Route = createFileRoute("/en")({
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
