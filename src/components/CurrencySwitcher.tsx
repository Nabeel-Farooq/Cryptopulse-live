import { useEffect, useState } from "react";
import { Currency, CURRENCY_META } from "@/lib/crypto";
import { cn } from "@/lib/utils";

interface Props {
  value: Currency;
  onChange: (c: Currency) => void;
}

const ORDER: Currency[] = ["usd", "eur", "gbp", "jpy"];

export const CurrencySwitcher = ({ value, onChange }: Props) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="glass inline-flex rounded-full p-1 shadow-card">
      {ORDER.map((c) => {
        const active = c === value;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-glow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={active}
          >
            <span className="mr-1 font-mono">{CURRENCY_META[c].symbol}</span>
            {CURRENCY_META[c].label}
          </button>
        );
      })}
      {mounted && null}
    </div>
  );
};
