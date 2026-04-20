import { Coin, Currency, formatPct, formatPrice, formatCompact } from "@/lib/crypto";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface Props {
  coins: Coin[];
  currency: Currency;
  onSelect: (coin: Coin) => void;
}

const PctCell = ({ value }: { value?: number }) => {
  if (value === undefined || value === null) return <span className="text-muted-foreground">—</span>;
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-sm font-medium",
        positive ? "text-bull" : "text-bear"
      )}
    >
      {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {formatPct(value)}
    </span>
  );
};

export const CoinTable = ({ coins, currency, onSelect }: Props) => {
  return (
    <div className="glass overflow-hidden rounded-2xl shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">1h</th>
              <th className="px-4 py-3 font-medium text-right">24h</th>
              <th className="px-4 py-3 font-medium text-right hidden md:table-cell">7d</th>
              <th className="px-4 py-3 font-medium text-right hidden lg:table-cell">Market Cap</th>
              <th className="px-4 py-3 font-medium text-right hidden xl:table-cell">Volume 24h</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Last 7d</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, idx) => {
              const change24h = coin.price_change_percentage_24h_in_currency;
              const positive = (change24h ?? 0) >= 0;
              return (
                <tr
                  key={coin.id}
                  onClick={() => onSelect(coin)}
                  className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-primary/5 last:border-b-0"
                  style={{ animationDelay: `${idx * 15}ms` }}
                >
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{coin.market_cap_rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" loading="lazy" />
                        <div className="absolute inset-0 rounded-full ring-1 ring-border group-hover:ring-primary/40 transition" />
                      </div>
                      <div>
                        <div className="font-semibold leading-tight">{coin.name}</div>
                        <div className="text-xs uppercase text-muted-foreground font-mono">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatPrice(coin.current_price, currency)}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <PctCell value={coin.price_change_percentage_1h_in_currency} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PctCell value={change24h} />
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <PctCell value={coin.price_change_percentage_7d_in_currency} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground hidden lg:table-cell">
                    {formatCompact(coin.market_cap, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground hidden xl:table-cell">
                    {formatCompact(coin.total_volume, currency)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Sparkline data={coin.sparkline_in_7d?.price ?? []} positive={positive} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
