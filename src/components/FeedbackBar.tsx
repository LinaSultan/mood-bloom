import { Button } from "@/components/ui/button";
import type { MoodKey, MethodKey } from "@/lib/moods";
import { logFeedback } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";

export const FeedbackBar = ({
  sessionId,
  mood,
  method,
  onSubmitted,
}: {
  sessionId: string | null;
  mood: MoodKey;
  method: MethodKey;
  onSubmitted: (rating: "yes" | "no" | "somewhat") => void;
}) => {
  const [submitted, setSubmitted] = useState<string | null>(null);

  const send = async (rating: "yes" | "no" | "somewhat") => {
    if (!sessionId || submitted) return;
    setSubmitted(rating);
    try {
      await logFeedback(sessionId, mood, method, rating);
      onSubmitted(rating);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save your feedback.");
      setSubmitted(null);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl bg-secondary/60 p-4 text-center text-sm text-muted-foreground fade-up">
        Thank you. We'll remember what works for you.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
      <p className="text-center font-serif text-lg text-foreground">Did this help you?</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => send("yes")} className="rounded-full">Yes</Button>
        <Button variant="outline" onClick={() => send("somewhat")} className="rounded-full">Somewhat</Button>
        <Button variant="outline" onClick={() => send("no")} className="rounded-full">Not really</Button>
      </div>
    </div>
  );
};
