ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;