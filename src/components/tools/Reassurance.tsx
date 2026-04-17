import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Reassurance = ({ messages }: { messages: string[] }) => {
  const [i, setI] = useState(0);
  return (
    <div className="space-y-5 py-4 text-center">
      <div key={i} className="scale-in rounded-3xl bg-card p-8 shadow-card">
        <p className="font-serif text-2xl leading-snug text-foreground">"{messages[i]}"</p>
      </div>
      <Button
        variant="outline"
        onClick={() => setI((x) => (x + 1) % messages.length)}
        className="rounded-full"
      >
        Another one
      </Button>
    </div>
  );
};
