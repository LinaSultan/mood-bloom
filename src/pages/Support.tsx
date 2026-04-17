import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { METHOD_LABELS, MOODS, REASSURANCE, REFRAME_PROMPTS, type MethodKey, type MoodKey } from "@/lib/moods";
import { logSession, rankedMethodsFor } from "@/lib/store";
import { Breathing } from "@/components/tools/Breathing";
import { Grounding } from "@/components/tools/Grounding";
import { Journal } from "@/components/tools/Journal";
import { Reframe } from "@/components/tools/Reframe";
import { Reassurance } from "@/components/tools/Reassurance";
import { FeedbackBar } from "@/components/FeedbackBar";
import { Chat } from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircleHeart } from "lucide-react";
import { cn } from "@/lib/utils";

const VALID: MoodKey[] = ["anxious", "stressed", "sad", "regretful", "neutral"];

const Support = () => {
  const { mood } = useParams<{ mood: string }>();
  const [params] = useSearchParams();
  const moodId = params.get("m") ?? undefined;
  const navigate = useNavigate();

  const moodKey = (VALID.includes(mood as MoodKey) ? mood : "neutral") as MoodKey;
  const moodMeta = MOODS.find((m) => m.key === moodKey)!;

  const [methods, setMethods] = useState<MethodKey[]>([]);
  const [active, setActive] = useState<MethodKey | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    rankedMethodsFor(moodKey).then((m) => {
      setMethods(m);
      setActive(m[0]);
    });
  }, [moodKey]);

  useEffect(() => {
    if (!active) return;
    setSessionId(null);
    logSession(moodKey, active, moodId).then(setSessionId).catch(console.error);
  }, [active, moodKey, moodId]);

  const reframePrompts = useMemo(() => REFRAME_PROMPTS[moodKey], [moodKey]);
  const reassuranceMsgs = useMemo(() => REASSURANCE[moodKey], [moodKey]);
  const journalPrompt = useMemo(() => {
    const map: Record<MoodKey, string> = {
      anxious: "What is the worry trying to protect you from?",
      stressed: "If you had to put one thing down today, what would it be?",
      sad: "What does this sadness wish it could say out loud?",
      regretful: "What would you forgive yourself for, if you let yourself?",
      neutral: "What's something small you noticed today?",
    };
    return map[moodKey];
  }, [moodKey]);

  return (
    <AppShell>
      <div className="fade-up space-y-5">
        <button onClick={() => navigate("/")} className="-ml-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> back
        </button>

        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Feeling {moodMeta.label.toLowerCase()}</p>
          <h1 className="font-serif text-3xl text-foreground">
            Let's take this <em className="italic">slowly</em>, together.
          </h1>
        </header>

        {/* Method tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {methods.map((m) => (
            <button
              key={m}
              onClick={() => setActive(m)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm transition-colors",
                active === m
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border"
              )}
            >
              {METHOD_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Active tool */}
        <div key={active ?? "x"} className="scale-in min-h-[280px]">
          {active === "breathing" && <Breathing />}
          {active === "grounding" && <Grounding />}
          {active === "journal" && <Journal prompt={journalPrompt} />}
          {active === "reframe" && <Reframe prompts={reframePrompts} />}
          {active === "reassurance" && <Reassurance messages={reassuranceMsgs} />}
        </div>

        {active && (
          <FeedbackBar
            sessionId={sessionId}
            mood={moodKey}
            method={active}
            onSubmitted={(r) => { if (r === "no") setShowChat(true); }}
          />
        )}

        {!showChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <MessageCircleHeart className="h-4 w-4" />
            I still feel bad
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground text-center">A gentle conversation</p>
            <Chat mood={moodKey} />
          </div>
        )}

        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="w-full text-muted-foreground">
          See my patterns →
        </Button>
      </div>
    </AppShell>
  );
};

export default Support;
