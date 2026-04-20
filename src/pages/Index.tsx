import { useEffect, useState } from "react";
import { Coin, Currency, fetchGlobal, fetchTopCoins, GlobalData } from "@/lib/crypto";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { StatsGrid } from "@/components/StatsGrid";
import { CoinTable } from "@/components/CoinTable";
import { MarketTicker } from "@/components/MarketTicker";
import { CoinDetailDrawer } from "@/components/CoinDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, RefreshCw, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";

const REFRESH_MS = 60_000;

const Index = () => {
  const [currency, setCurrency] = useState<Currency>("usd");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Coin | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [c, g] = await Promise.all([fetchTopCoins(currency, 50), fetchGlobal()]);
      setCoins(c);
      setGlobal(g);
      setLastUpdate(new Date());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load market data";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const filtered = coins.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen relative">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-[0.07]" aria-hidden />

      {/* Header */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-neon">
                <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bull animate-pulse-glow" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight leading-none">NEXUS</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none mt-1">
                Live Crypto Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="hidden md:inline text-[11px] font-mono text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <CurrencySwitcher value={currency} onChange={setCurrency} />
            <Button
              variant="glass"
              size="icon"
              onClick={() => load()}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </header>

      <MarketTicker coins={coins.slice(0, 20)} currency={currency} />

      <main className="container py-8 space-y-8">
        {/* Hero */}
        <section className="relative animate-fade-up">
          <div className="absolute inset-0 bg-gradient-radial-glow pointer-events-none" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              <Sparkles className="h-3 w-3 text-primary" />
              AI-powered forecasts · Live data every 60s
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              The pulse of <span className="text-gradient">crypto markets</span>,
              <br />
              with intelligence built in.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl">
              Track 50+ assets in USD, EUR, GBP and JPY. Tap any coin for a live 24h chart and an AI-generated short-term outlook.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="animate-fade-up" style={{ animationDelay: "60ms" }}>
          <StatsGrid data={global} currency={currency} />
        </section>

        {/* Search + Table */}
        <section className="animate-fade-up space-y-4" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight">Top Assets</h3>
              <p className="text-sm text-muted-foreground">Ranked by market capitalization · click any row to drill in</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Bitcoin, ETH…"
                className="pl-9 glass border-border bg-transparent"
              />
            </div>
          </div>

          {loading && coins.length === 0 ? (
            <div className="glass rounded-2xl p-16 grid place-items-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <CoinTable coins={filtered} currency={currency} onSelect={setSelected} />
          )}
        </section>

        <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
          Market data by CoinGecko · Forecasts are for informational purposes only and are not financial advice.
        </footer>
      </main>

      <CoinDetailDrawer
        coin={selected}
        currency={currency}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
};

export default Index;
