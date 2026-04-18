CREATE POLICY "anon delete chat_messages"
ON public.chat_messages
FOR DELETE
USING (device_id IS NOT NULL AND length(device_id) > 0);