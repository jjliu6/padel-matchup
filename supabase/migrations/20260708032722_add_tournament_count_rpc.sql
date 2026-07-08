-- Social-proof counter: total number of tournaments ever created via the app.
-- tournaments has no SELECT policy (all access goes through SECURITY DEFINER
-- RPCs), so a dedicated read-only counter RPC is needed for the client to
-- display "X tournaments created" without exposing the table itself.
CREATE OR REPLACE FUNCTION public.get_tournament_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT count(*) FROM public.tournaments;
$$;

REVOKE ALL ON FUNCTION public.get_tournament_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tournament_count() TO anon, authenticated;
