BEGIN;

-- remove the supabase_realtime publication
DROP publication IF EXISTS supabase_realtime;

-- re-create the supabase_realtime publication with no tables
CREATE PUBLICATION supabase_realtime;

COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.request_songs;