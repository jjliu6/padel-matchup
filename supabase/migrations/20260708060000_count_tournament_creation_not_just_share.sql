-- get_tournament_count() previously counted rows in public.tournaments, which
-- only gets a row when a tournament is *published/shared* (create_tournament
-- RPC, called from the share flow) — a tournament started and played purely
-- locally never touched that table, so the social-proof counter undercounted
-- real usage. Track every local "start tournament" instead via a dedicated
-- append-only event table, independent of sharing.
CREATE TABLE public.tournament_creations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.tournament_creations TO service_role;
ALTER TABLE public.tournament_creations ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies; all access via SECURITY DEFINER RPCs below,
-- same pattern as the tournaments table.

CREATE OR REPLACE FUNCTION public.record_tournament_created()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.tournament_creations DEFAULT VALUES;
$$;

REVOKE ALL ON FUNCTION public.record_tournament_created() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_tournament_created() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_tournament_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT count(*) FROM public.tournament_creations;
$$;
