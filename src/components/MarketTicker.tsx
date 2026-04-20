import { Coin, Currency, formatCompact } from "@/lib/crypto";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  coins: Coin[];
  currency: Currency;
}

export const MarketTicker = ({ coins, currency }: Props) => {
  if (coins.length === 0) return null;
  const list = [...coins, ...coins];

  return (
    <div className="ticker-mask glass border-y border-border overflow-hidden py-3">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap">
        {list.map((coin, i) => {
          const change = coin.price_change_percentage_24h_in_currency ?? 0;
          const positive = change >= 0;
          return (
            <div key={`${coin.id}-${i}`} className="flex items-center gap-3">
              <img src={coin.image} alt="" className="h-5 w-5 rounded-full" loading="lazy" />
              <span className="font-mono text-xs uppercase text-muted-foreground">{coin.symbol}</span>
              <span className="font-mono text-sm font-medium">{formatCompact(coin.current_price, currency)}</span>
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs ${
                  positive ? "text-bull" : "text-bear"
                }`}
              >
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
