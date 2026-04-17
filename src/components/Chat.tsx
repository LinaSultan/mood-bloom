import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MoodKey } from "@/lib/moods";

type Msg = { role: "user" | "assistant"; content: string };

export const Chat = ({ mood }: { mood: MoodKey }) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I'm here. No fixing, no judgment — just listening. What's the loudest thing in your head right now?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    let assistant = "";
    let started = false;
    const upsert = (chunk: string) => {
      assistant += chunk;
      setMessages((prev) => {
        if (!started) {
          started = true;
          return [...prev, { role: "assistant", content: assistant }];
        }
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistant } : m));
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mood, messages: [...messages, userMsg] }),
      });

      if (resp.status === 429) { toast.error("Too many messages right now. Please pause a moment."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits are exhausted. Please add credits to continue."); setLoading(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Couldn't reach the chat right now."); setLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-card">
      <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 px-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
              m.role === "assistant"
                ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                : "ml-auto bg-primary text-primary-foreground rounded-br-sm"
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking softly…
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Say anything…"
          className="rounded-full border-border bg-background h-11"
          disabled={loading}
        />
        <Button
          onClick={send}
          disabled={loading || !input.trim()}
          size="icon"
          className="h-11 w-11 rounded-full bg-gradient-sage text-primary-foreground"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
