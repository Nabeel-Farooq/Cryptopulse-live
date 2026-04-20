import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Coin, Currency, fetchMarketChart, formatPct, formatPrice, MarketChartPoint } from "@/lib/crypto";
import { PriceChart } from "./PriceChart";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  coin: Coin | null;
  currency: Currency;
  onOpenChange: (open: boolean) => void;
}

interface Forecast {
  outlook: "bullish" | "bearish" | "neutral";
  confidence: number;
  short_term: string;
  key_drivers: string[];
  risks: string[];
  summary: string;
}

export const CoinDetailDrawer = ({ coin, currency, onOpenChange }: Props) => {
  const [chart, setChart] = useState<MarketChartPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    setForecast(null);
    setChart([]);
    if (!coin) return;
    let cancelled = false;
    setLoadingChart(true);
    fetchMarketChart(coin.id, currency, 1)
      .then((d) => !cancelled && setChart(d))
      .catch(() => !cancelled && toast.error("Could not load chart"))
      .finally(() => !cancelled && setLoadingChart(false));
    return () => {
      cancelled = true;
    };
  }, [coin, currency]);

  const handleForecast = async () => {
    if (!coin) return;
    setLoadingForecast(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict-coin", {
        body: {
          name: coin.name,
          symbol: coin.symbol,
          currency,
          price: coin.current_price,
          change_1h: coin.price_change_percentage_1h_in_currency,
          change_24h: coin.price_change_percentage_24h_in_currency,
          change_7d: coin.price_change_percentage_7d_in_currency,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          ath: coin.ath,
          ath_change_percentage: coin.ath_change_percentage,
          market_cap_rank: coin.market_cap_rank,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForecast(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Forecast failed";
      toast.error(msg);
    } finally {
      setLoadingForecast(false);
    }
  };

  const open = !!coin;
  const positive = (coin?.price_change_percentage_24h_in_currency ?? 0) >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl border-l border-border bg-background/95 backdrop-blur-2xl overflow-y-auto"
      >
        {coin && (
          <>
            <SheetHeader className="text-left">
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="h-12 w-12 rounded-full ring-1 ring-border" />
                <div>
                  <SheetTitle className="text-2xl font-display">
                    {coin.name}{" "}
                    <span className="text-muted-foreground font-mono text-base uppercase">{coin.symbol}</span>
                  </SheetTitle>
                  <SheetDescription>Rank #{coin.market_cap_rank} • Live market data</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold font-display tracking-tight font-mono">
                {formatPrice(coin.current_price, currency)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono text-sm font-medium",
                  positive ? "text-bull" : "text-bear"
                )}
              >
                {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {formatPct(coin.price_change_percentage_24h_in_currency)} (24h)
              </span>
            </div>

            <div className="mt-6 glass rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">24h Price</h3>
                <span className="text-xs text-muted-foreground font-mono">Live · CoinGecko</span>
              </div>
              {loadingChart ? (
                <div className="h-72 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <PriceChart data={chart} currency={currency} positive={positive} />
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="High 24h" value={formatPrice(coin.high_24h, currency)} />
              <Stat label="Low 24h" value={formatPrice(coin.low_24h, currency)} />
              <Stat label="ATH" value={formatPrice(coin.ath, currency)} />
              <Stat label="From ATH" value={formatPct(coin.ath_change_percentage)} />
            </div>

            <div className="mt-6 glass relative overflow-hidden rounded-2xl p-5 shadow-card">
              <div className="absolute inset-0 bg-gradient-aurora opacity-50 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="text-base font-display font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Forecast
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Short-term outlook generated from live signals.
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleForecast}
                    disabled={loadingForecast}
                  >
                    {loadingForecast ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {forecast ? "Regenerate" : "Generate forecast"}
                      </>
                    )}
                  </Button>
                </div>

                {forecast && (
                  <div className="mt-4 space-y-3 animate-fade-up">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                          forecast.outlook === "bullish" && "bg-bull/15 text-bull ring-1 ring-bull/40",
                          forecast.outlook === "bearish" && "bg-bear/15 text-bear ring-1 ring-bear/40",
                          forecast.outlook === "neutral" && "bg-muted text-muted-foreground ring-1 ring-border"
                        )}
                      >
                        {forecast.outlook}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {forecast.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{forecast.summary}</p>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Short term</p>
                      <p className="text-sm">{forecast.short_term}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ListBlock title="Key drivers" items={forecast.key_drivers} tone="primary" />
                      <ListBlock title="Risks" items={forecast.risks} tone="bear" />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic mt-2">
                      For informational purposes only. Not financial advice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="glass rounded-xl p-3">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="font-mono text-sm font-semibold mt-1">{value}</p>
  </div>
);

const ListBlock = ({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "primary" | "bear";
}) => (
  <div>
    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="text-xs flex gap-2">
          <span
            className={cn(
              "mt-1.5 h-1.5 w-1.5 rounded-full shrink-0",
              tone === "primary" ? "bg-primary" : "bg-bear"
            )}
          />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);
