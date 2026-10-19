CREATE OR REPLACE FUNCTION public.founding_spots_left(check_env text DEFAULT 'live')
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(0, 100 - (
    SELECT count(DISTINCT user_id)::int FROM public.subscriptions
    WHERE price_id = 'agentos_founding_monthly' AND environment = check_env
  ));
$$;
GRANT EXECUTE ON FUNCTION public.founding_spots_left(text) TO anon, authenticated, service_role;