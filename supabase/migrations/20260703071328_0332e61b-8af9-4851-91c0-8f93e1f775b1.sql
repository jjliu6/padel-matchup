
CREATE TABLE public.tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  view_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  edit_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.tournaments TO service_role;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies; all access via SECURITY DEFINER RPCs below.

CREATE OR REPLACE FUNCTION public.create_tournament(initial_state jsonb)
RETURNS TABLE(id uuid, view_token uuid, edit_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.tournaments (state)
  VALUES (COALESCE(initial_state, '{}'::jsonb))
  RETURNING tournaments.id, tournaments.view_token, tournaments.edit_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.load_tournament(_view_token uuid)
RETURNS TABLE(state jsonb, updated_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT state, updated_at FROM public.tournaments WHERE view_token = _view_token;
$$;

CREATE OR REPLACE FUNCTION public.save_tournament(_edit_token uuid, _state jsonb)
RETURNS TABLE(view_token uuid, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.tournaments
     SET state = _state, updated_at = now()
   WHERE edit_token = _edit_token
  RETURNING tournaments.view_token, tournaments.updated_at;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid edit token' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.create_tournament(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.load_tournament(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_tournament(uuid, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_tournament(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.load_tournament(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_tournament(uuid, jsonb) TO anon, authenticated;
