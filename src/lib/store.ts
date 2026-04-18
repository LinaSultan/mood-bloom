import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "./device";
import type { MoodKey, MethodKey } from "./moods";
import { MOOD_METHODS } from "./moods";

export async function logMood(mood: MoodKey, note?: string) {
  const device_id = getDeviceId();
  const { data, error } = await supabase
    .from("moods")
    .insert({ device_id, mood, note: note?.trim() || null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function logSession(mood: MoodKey, method: MethodKey, mood_id?: string) {
  const device_id = getDeviceId();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ device_id, mood, method, mood_id: mood_id ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function logFeedback(
  session_id: string,
  mood: MoodKey,
  method: MethodKey,
  rating: "yes" | "no" | "somewhat",
) {
  const device_id = getDeviceId();
  const { error } = await supabase
    .from("feedback")
    .insert({ device_id, session_id, mood, method, rating });
  if (error) throw error;
}

export async function getRecentMoods(limit = 30) {
  const device_id = getDeviceId();
  const { data, error } = await supabase
    .from("moods")
    .select("id, mood, note, created_at")
    .eq("device_id", device_id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getFeedback() {
  const device_id = getDeviceId();
  const { data, error } = await supabase
    .from("feedback")
    .select("mood, method, rating")
    .eq("device_id", device_id);
  if (error) throw error;
  return data ?? [];
}

export async function saveChatMessage(
  conversation_id: string,
  mood: MoodKey,
  role: "user" | "assistant",
  content: string,
) {
  const device_id = getDeviceId();
  const { error } = await supabase
    .from("chat_messages")
    .insert({ device_id, conversation_id, mood, role, content });
  if (error) throw error;
}

export async function getChatMessages() {
  const device_id = getDeviceId();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, conversation_id, mood, role, content, created_at")
    .eq("device_id", device_id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Adaptive ordering: rank methods per mood by feedback score
export async function rankedMethodsFor(mood: MoodKey): Promise<MethodKey[]> {
  const all = await getFeedback();
  const scores = new Map<MethodKey, number>();
  for (const m of MOOD_METHODS[mood]) scores.set(m, 0);
  for (const row of all) {
    if (row.mood !== mood) continue;
    const k = row.method as MethodKey;
    if (!scores.has(k)) continue;
    const delta = row.rating === "yes" ? 2 : row.rating === "somewhat" ? 1 : -1;
    scores.set(k, (scores.get(k) ?? 0) + delta);
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
}
