export type Currency = "usd" | "eur" | "gbp" | "jpy";

export const CURRENCY_META: Record<Currency, { label: string; symbol: string; locale: string }> = {
  usd: { label: "USD", symbol: "$", locale: "en-US" },
  eur: { label: "EUR", symbol: "€", locale: "de-DE" },
  gbp: { label: "GBP", symbol: "£", locale: "en-GB" },
  jpy: { label: "JPY", symbol: "¥", locale: "ja-JP" },
};

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_change_percentage: number;
  circulating_supply: number;
}

export interface GlobalData {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage: Record<string, number>;
  active_cryptocurrencies: number;
}

export interface MarketChartPoint {
  time: number;
  price: number;
}

const BASE = "https://api.coingecko.com/api/v3";

export async function fetchTopCoins(currency: Currency, perPage = 50): Promise<Coin[]> {
  const url = `${BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load coins (${res.status})`);
  return res.json();
}

export async function fetchGlobal(): Promise<GlobalData> {
  const res = await fetch(`${BASE}/global`);
  if (!res.ok) throw new Error("Failed to load global");
  const json = await res.json();
  return json.data;
}

export async function fetchMarketChart(id: string, currency: Currency, days = 1): Promise<MarketChartPoint[]> {
  const url = `${BASE}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load chart");
  const json = await res.json();
  return (json.prices as [number, number][]).map(([time, price]) => ({ time, price }));
}

export function formatPrice(value: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  const fractionDigits = value >= 1000 ? 2 : value >= 1 ? 2 : value >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits >= 2 ? 2 : 0,
  }).format(value);
}

export function formatCompact(value: number, currency: Currency): string {
  const meta = CURRENCY_META[currency];
  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPct(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
