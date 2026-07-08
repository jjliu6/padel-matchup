CREATE OR REPLACE FUNCTION public.get_tournament_count()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::bigint FROM public.tournaments;
$$;

GRANT EXECUTE ON FUNCTION public.get_tournament_count() TO anon, authenticated, service_role;