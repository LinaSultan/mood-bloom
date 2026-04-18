import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getChatMessages, getFeedback, getRecentMoods } from "@/lib/store";
import { METHOD_LABELS, MOODS, type MethodKey, type MoodKey } from "@/lib/moods";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type MoodRow = { id: string; mood: string; note: string | null; created_at: string };
type FBRow = { mood: string; method: string; rating: string };
type ChatRow = { id: string; conversation_id: string; mood: string; role: string; content: string; created_at: string };

const Dashboard = () => {
  const [moods, setMoods] = useState<MoodRow[]>([]);
  const [fb, setFb] = useState<FBRow[]>([]);
  const [chats, setChats] = useState<ChatRow[]>([]);

  useEffect(() => {
    getRecentMoods(60).then(setMoods).catch(console.error);
    getFeedback().then(setFb).catch(console.error);
    getChatMessages().then(setChats).catch(console.error);
  }, []);

  const total = moods.length;
  const counts = moods.reduce<Record<string, number>>((acc, m) => {
    acc[m.mood] = (acc[m.mood] ?? 0) + 1;
    return acc;
  }, {});
  const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as MoodKey | undefined;

  // Best method overall (highest yes-somewhat score)
  const methodScores = new Map<MethodKey, number>();
  for (const r of fb) {
    const k = r.method as MethodKey;
    const delta = r.rating === "yes" ? 2 : r.rating === "somewhat" ? 1 : -1;
    methodScores.set(k, (methodScores.get(k) ?? 0) + delta);
  }
  const bestMethod = [...methodScores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // Repeated mood detection (last 7 days)
  const week = moods.filter((m) => Date.now() - new Date(m.created_at).getTime() < 7 * 86400000);
  const weekCounts = week.reduce<Record<string, number>>((acc, m) => {
    acc[m.mood] = (acc[m.mood] ?? 0) + 1;
    return acc;
  }, {});
  const recurring = Object.entries(weekCounts).find(([, c]) => c >= 3)?.[0] as MoodKey | undefined;

  // Group chat messages: conversation -> { mood, date, messages }
  const conversations = useMemo(() => {
    const map = new Map<string, { id: string; mood: string; started_at: string; messages: ChatRow[] }>();
    for (const m of chats) {
      const c = map.get(m.conversation_id);
      if (!c) {
        map.set(m.conversation_id, { id: m.conversation_id, mood: m.mood, started_at: m.created_at, messages: [m] });
      } else {
        c.messages.push(m);
      }
    }
    return [...map.values()].sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at));
  }, [chats]);

  // Group conversations by date label
  const groupedByDate = useMemo(() => {
    const fmt = (d: string) => {
      const date = new Date(d);
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const isSame = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
      if (isSame(date, today)) return "Today";
      if (isSame(date, yesterday)) return "Yesterday";
      return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    };
    const groups = new Map<string, typeof conversations>();
    for (const c of conversations) {
      const label = fmt(c.started_at);
      const arr = groups.get(label) ?? [];
      arr.push(c);
      groups.set(label, arr);
    }
    return [...groups.entries()];
  }, [conversations]);

  return (
    <AppShell>
      <div className="fade-up space-y-5">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your patterns</p>
          <h1 className="font-serif text-3xl text-foreground">A gentle look back.</h1>
        </header>

        {recurring && (
          <div className="rounded-3xl border border-primary/30 bg-primary-soft/30 p-5">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-serif text-lg text-foreground">
                  This feeling has been recurring lately.
                </p>
                <p className="text-sm text-muted-foreground">
                  You've felt {recurring} a few times this week. Maybe a deeper, slower session today?
                </p>
                <Link to={`/support/${recurring}`}>
                  <Button size="sm" className="mt-3 rounded-full bg-gradient-sage text-primary-foreground">
                    Open a calm space
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Check-ins" value={total.toString()} />
          <Stat label="Most common" value={mostCommon ? MOODS.find(m => m.key === mostCommon)?.label ?? "—" : "—"} />
          <Stat label="Best for you" value={bestMethod ? METHOD_LABELS[bestMethod] : "—"} />
          <Stat label="This week" value={week.length.toString()} />
        </div>

        {/* Mood distribution */}
        {total > 0 && (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <p className="font-serif text-xl text-foreground">Mood mix</p>
            <div className="mt-3 space-y-2">
              {MOODS.map((m) => {
                const c = counts[m.key] ?? 0;
                const pct = total ? Math.round((c / total) * 100) : 0;
                return (
                  <div key={m.key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{m.emoji} {m.label}</span>
                      <span className="text-muted-foreground">{c} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: `hsl(var(--mood-${m.key}))` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent entries */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <p className="font-serif text-xl text-foreground">Recent check-ins</p>
          {moods.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No check-ins yet. Start with one when you're ready.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {moods.slice(0, 8).map((m) => (
                <li key={m.id} className="flex items-start gap-3 py-3">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `hsl(var(--mood-${m.mood}))` }}
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-foreground capitalize">{m.mood}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    {m.note && <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{m.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Past AI conversations */}
        {conversations.length > 0 && (
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <p className="font-serif text-xl text-foreground">Past conversations</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {conversations.length} {conversations.length === 1 ? "chat" : "chats"} · grouped by day
            </p>
            <div className="mt-4 space-y-5">
              {groupedByDate.map(([label, convs]) => (
                <div key={label}>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <Accordion type="multiple" className="mt-2 space-y-2">
                    {convs.map((c) => {
                      const moodMeta = MOODS.find((m) => m.key === c.mood);
                      const time = new Date(c.started_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
                      const userCount = c.messages.filter((m) => m.role === "user").length;
                      return (
                        <AccordionItem
                          key={c.id}
                          value={c.id}
                          className="rounded-2xl border border-border bg-background px-4"
                        >
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <div className="flex flex-1 items-center gap-3 text-left">
                              <span
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                                style={{ backgroundColor: `hsl(var(--mood-${c.mood}) / 0.5)` }}
                              >
                                {moodMeta?.emoji ?? "💬"}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm capitalize text-foreground">{moodMeta?.label ?? c.mood}</p>
                                <p className="text-xs text-muted-foreground">
                                  {time} · {userCount} {userCount === 1 ? "message" : "messages"}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pb-3">
                              {c.messages.map((m) => (
                                <div
                                  key={m.id}
                                  className={
                                    "max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed " +
                                    (m.role === "assistant"
                                      ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                                      : "ml-auto bg-primary text-primary-foreground rounded-br-sm")
                                  }
                                >
                                  {m.content}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link to="/">
          <Button className="w-full h-12 rounded-full bg-gradient-sage text-primary-foreground">
            New check-in
          </Button>
        </Link>
      </div>
    </AppShell>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-1 font-serif text-2xl leading-tight text-foreground">{value}</p>
  </div>
);

export default Dashboard;
