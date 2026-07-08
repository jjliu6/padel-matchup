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