import { Currency, formatCompact, GlobalData } from "@/lib/crypto";
import { Activity, BarChart3, Globe2, Layers } from "lucide-react";

interface Props {
  data: GlobalData | null;
  currency: Currency;
}

const Card = ({
  icon: Icon,
  label,
  value,
  hint,
  glow,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
  glow?: "primary" | "secondary" | "accent" | "bull";
}) => {
  const glowMap = {
    primary: "from-primary/20 to-transparent",
    secondary: "from-secondary/20 to-transparent",
    accent: "from-accent/20 to-transparent",
    bull: "from-bull/20 to-transparent",
  } as const;
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 shadow-card">
      <div className={`absolute inset-0 bg-gradient-to-br ${glowMap[glow ?? "primary"]} opacity-60 pointer-events-none`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-2xl font-bold font-display tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground font-mono">{hint}</p>}
        </div>
        <div className="rounded-xl bg-background/50 p-2 ring-1 ring-border">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
};

export const StatsGrid = ({ data, currency }: Props) => {
  const cap = data?.total_market_cap?.[currency] ?? 0;
  const vol = data?.total_volume?.[currency] ?? 0;
  const change = data?.market_cap_change_percentage_24h_usd ?? 0;
  const btcDom = data?.market_cap_percentage?.btc ?? 0;
  const ethDom = data?.market_cap_percentage?.eth ?? 0;
  const active = data?.active_cryptocurrencies ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        icon={Globe2}
        label="Total Market Cap"
        value={formatCompact(cap, currency)}
        hint={`${change >= 0 ? "+" : ""}${change.toFixed(2)}% (24h)`}
        glow="primary"
      />
      <Card
        icon={BarChart3}
        label="24h Volume"
        value={formatCompact(vol, currency)}
        hint="across all assets"
        glow="secondary"
      />
      <Card
        icon={Activity}
        label="BTC Dominance"
        value={`${btcDom.toFixed(1)}%`}
        hint={`ETH ${ethDom.toFixed(1)}%`}
        glow="accent"
      />
      <Card
        icon={Layers}
        label="Active Assets"
        value={active.toLocaleString()}
        hint="tracked globally"
        glow="bull"
      />
    </div>
  );
};
