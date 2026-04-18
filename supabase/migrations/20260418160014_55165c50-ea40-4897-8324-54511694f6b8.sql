CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  conversation_id UUID NOT NULL,
  mood TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read chat_messages"
ON public.chat_messages
FOR SELECT
USING (device_id IS NOT NULL AND length(device_id) > 0);

CREATE POLICY "anon insert chat_messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (device_id IS NOT NULL AND length(device_id) > 0);

CREATE INDEX idx_chat_messages_device_created ON public.chat_messages (device_id, created_at DESC);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages (conversation_id, created_at);