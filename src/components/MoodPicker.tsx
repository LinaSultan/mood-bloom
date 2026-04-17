import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOODS, type MoodKey } from "@/lib/moods";
import { logMood } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const MoodPicker = () => {
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const onContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const id = await logMood(selected, note);
      navigate(`/support/${selected}?m=${id}`);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save your check-in. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="fade-up flex flex-col gap-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">A soft check-in</p>
        <h1 className="font-serif text-4xl leading-[1.05] text-foreground">
          How are you <em className="italic">really</em> feeling right now?
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {MOODS.map((m) => {
          const isActive = selected === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelected(m.key)}
              className={cn(
                "group flex items-center gap-4 rounded-3xl border bg-card px-5 py-4 text-left shadow-card transition-all",
                isActive
                  ? "border-primary ring-2 ring-primary/30 -translate-y-0.5"
                  : "border-border hover:border-primary/40 hover:-translate-y-0.5"
              )}
              style={isActive ? { backgroundColor: `hsl(var(--mood-${m.key}) / 0.25)` } : undefined}
              aria-pressed={isActive}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: `hsl(var(--mood-${m.key}) / 0.5)` }}
              >
                {m.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-serif text-xl text-foreground">{m.label}</span>
                <span className="block text-sm text-muted-foreground">{m.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={cn("space-y-2 transition-opacity", selected ? "opacity-100" : "opacity-50 pointer-events-none")}>
        <label htmlFor="note" className="text-sm text-muted-foreground">
          What's on your mind? <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder="A word, a sentence, or nothing at all…"
          rows={3}
          className="resize-none rounded-2xl border-border bg-card text-base"
        />
      </div>

      <Button
        size="lg"
        disabled={!selected || saving}
        onClick={onContinue}
        className="h-14 rounded-full bg-gradient-sage text-base font-medium text-primary-foreground shadow-soft hover:opacity-95"
      >
        {saving ? "Saving…" : "Continue"}
      </Button>
    </section>
  );
};
