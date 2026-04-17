import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export const Journal = ({ prompt }: { prompt: string }) => {
  const [text, setText] = useState("");
  return (
    <div className="space-y-3 py-2">
      <p className="font-serif text-xl text-foreground">{prompt}</p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 4000))}
        rows={9}
        placeholder="Let it spill out. No one reads this but you."
        className="resize-none rounded-2xl border-border bg-card text-base leading-relaxed"
      />
      <p className="text-right text-xs text-muted-foreground">{text.length}/4000 · stays on your device</p>
    </div>
  );
};
