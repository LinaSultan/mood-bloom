import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STEPS = [
  { n: 5, sense: "things you can see", placeholder: "a lamp, a window, your hands…" },
  { n: 4, sense: "things you can touch", placeholder: "the chair, your sleeve…" },
  { n: 3, sense: "things you can hear", placeholder: "a hum, a voice, the wind…" },
  { n: 2, sense: "things you can smell", placeholder: "coffee, fresh air…" },
  { n: 1, sense: "thing you can taste", placeholder: "tea, mint, water…" },
];

export const Grounding = () => {
  const [step, setStep] = useState(0);
  const [val, setVal] = useState("");
  const cur = STEPS[step];
  const done = step >= STEPS.length;

  if (done) {
    return (
      <div className="space-y-4 py-4 text-center">
        <p className="font-serif text-2xl">You're here. You're now.</p>
        <p className="text-sm text-muted-foreground">Notice your feet on the ground. You did the whole loop.</p>
        <Button variant="outline" onClick={() => { setStep(0); setVal(""); }} className="rounded-full">
          Run it again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-2">
      <div className="rounded-3xl bg-secondary/60 p-6 text-center">
        <div className="font-serif text-7xl leading-none text-primary">{cur.n}</div>
        <div className="mt-2 text-base text-foreground">{cur.sense}</div>
      </div>
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={cur.placeholder}
        className="rounded-2xl border-border bg-card h-12 text-base"
      />
      <Button
        onClick={() => { setStep((s) => s + 1); setVal(""); }}
        className="w-full h-12 rounded-full bg-gradient-sage text-primary-foreground"
      >
        {step === STEPS.length - 1 ? "Finish" : "Next"}
      </Button>
    </div>
  );
};
