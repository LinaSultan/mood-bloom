import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Reframe = ({ prompts }: { prompts: string[] }) => {
  const [idx, setIdx] = useState(0);
  const [thought, setThought] = useState("");
  const [reframe, setReframe] = useState("");

  return (
    <div className="space-y-4 py-2">
      <div className="rounded-2xl bg-secondary/60 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Reflection</p>
        <p className="mt-1 font-serif text-lg text-foreground">{prompts[idx]}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIdx((i) => (i + 1) % prompts.length)}
          className="mt-2 -ml-2 h-7 text-xs text-primary hover:text-primary"
        >
          Try another prompt →
        </Button>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">The thought</label>
        <Textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          rows={3}
          placeholder="What's the loud thought right now?"
          className="resize-none rounded-2xl border-border bg-card"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">A softer, truer version</label>
        <Textarea
          value={reframe}
          onChange={(e) => setReframe(e.target.value)}
          rows={3}
          placeholder="Write what a kind, wise friend might say back."
          className="resize-none rounded-2xl border-border bg-card"
        />
      </div>
    </div>
  );
};
