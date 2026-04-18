-- Tighten RLS policies to scope by requesting device via x-device-id header
-- Helper: read device_id from request header (set automatically by PostgREST)
CREATE OR REPLACE FUNCTION public.current_device_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.headers', true)::json->>'x-device-id', ''),
    ''
  )
$$;

-- moods: scope SELECT by device
DROP POLICY IF EXISTS "anon read moods" ON public.moods;
CREATE POLICY "anon read moods" ON public.moods FOR SELECT
  USING (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

DROP POLICY IF EXISTS "anon insert moods" ON public.moods;
CREATE POLICY "anon insert moods" ON public.moods FOR INSERT
  WITH CHECK (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

-- sessions
DROP POLICY IF EXISTS "anon read sessions" ON public.sessions;
CREATE POLICY "anon read sessions" ON public.sessions FOR SELECT
  USING (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

DROP POLICY IF EXISTS "anon insert sessions" ON public.sessions;
CREATE POLICY "anon insert sessions" ON public.sessions FOR INSERT
  WITH CHECK (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

-- feedback
DROP POLICY IF EXISTS "anon read feedback" ON public.feedback;
CREATE POLICY "anon read feedback" ON public.feedback FOR SELECT
  USING (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

DROP POLICY IF EXISTS "anon insert feedback" ON public.feedback;
CREATE POLICY "anon insert feedback" ON public.feedback FOR INSERT
  WITH CHECK (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

-- chat_messages
DROP POLICY IF EXISTS "anon read chat_messages" ON public.chat_messages;
CREATE POLICY "anon read chat_messages" ON public.chat_messages FOR SELECT
  USING (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

DROP POLICY IF EXISTS "anon insert chat_messages" ON public.chat_messages;
CREATE POLICY "anon insert chat_messages" ON public.chat_messages FOR INSERT
  WITH CHECK (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);

DROP POLICY IF EXISTS "anon delete chat_messages" ON public.chat_messages;
CREATE POLICY "anon delete chat_messages" ON public.chat_messages FOR DELETE
  USING (device_id = public.current_device_id() AND length(public.current_device_id()) > 0);
