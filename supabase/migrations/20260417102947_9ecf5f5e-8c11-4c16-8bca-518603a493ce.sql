-- Moods: each mood check-in
CREATE TABLE public.moods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_moods_device_created ON public.moods(device_id, created_at DESC);

-- Sessions: a coping tool usage tied to a mood
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  mood_id UUID REFERENCES public.moods(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_device_created ON public.sessions(device_id, created_at DESC);

-- Feedback: did this help?
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  method TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('yes','no','somewhat')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_device_mood ON public.feedback(device_id, mood);

ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anonymous device-scoped access. Device_id is required and used as the access key.
-- Anyone with the device_id can read/write its own data; no cross-device access by enforcing non-empty device_id and per-row matching is handled at app layer.
-- For an anonymous MVP we allow public read/write but require non-empty device_id.
CREATE POLICY "anon read moods" ON public.moods FOR SELECT USING (device_id IS NOT NULL AND length(device_id) > 0);
CREATE POLICY "anon insert moods" ON public.moods FOR INSERT WITH CHECK (device_id IS NOT NULL AND length(device_id) > 0);

CREATE POLICY "anon read sessions" ON public.sessions FOR SELECT USING (device_id IS NOT NULL AND length(device_id) > 0);
CREATE POLICY "anon insert sessions" ON public.sessions FOR INSERT WITH CHECK (device_id IS NOT NULL AND length(device_id) > 0);

CREATE POLICY "anon read feedback" ON public.feedback FOR SELECT USING (device_id IS NOT NULL AND length(device_id) > 0);
CREATE POLICY "anon insert feedback" ON public.feedback FOR INSERT WITH CHECK (device_id IS NOT NULL AND length(device_id) > 0);