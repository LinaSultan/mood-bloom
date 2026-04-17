import { useEffect, useState } from "react";

const PHASES = [
  { label: "Breathe in", seconds: 4 },
  { label: "Hold", seconds: 2 },
  { label: "Breathe out", seconds: 6 },
];

export const Breathing = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(PHASES[0].seconds);

  useEffect(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          setPhaseIdx((i) => {
            const next = (i + 1) % PHASES.length;
            setCount(PHASES[next].seconds);
            return next;
          });
          return PHASES[(phaseIdx + 1) % PHASES.length].seconds;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phaseIdx]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div className="breathe-circle absolute inset-0 rounded-full bg-gradient-sage opacity-90 shadow-soft" />
        <div className="relative z-10 text-center">
          <div className="font-serif text-2xl text-primary-foreground drop-shadow">{PHASES[phaseIdx].label}</div>
          <div className="mt-1 text-5xl font-light text-primary-foreground/95">{count}</div>
        </div>
      </div>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        Follow the circle. In for 4, hold for 2, out for 6. Just three rounds is enough.
      </p>
    </div>
  );
};
