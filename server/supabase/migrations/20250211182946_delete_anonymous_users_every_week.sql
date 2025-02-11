CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION delete_anonymous_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- deletes anonymous users created more than 30 days ago
  DELETE FROM auth.users
  WHERE is_anonymous IS true AND created_at < now() - interval '7 days';
END;
$$;

GRANT EXECUTE ON FUNCTION delete_anonymous_users TO supabase_auth_admin;

SELECT cron.schedule(
  'delete-anonymous-users',
  '0 3 * * *',  -- Every 03:00 UTC
  $$SELECT delete_anonymous_users()$$
);