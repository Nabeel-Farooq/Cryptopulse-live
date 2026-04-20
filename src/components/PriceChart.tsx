import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Currency, formatPrice, MarketChartPoint } from "@/lib/crypto";

interface Props {
  data: MarketChartPoint[];
  currency: Currency;
  positive: boolean;
}

export const PriceChart = ({ data, currency, positive }: Props) => {
  const color = positive ? "hsl(var(--bull))" : "hsl(var(--bear))";

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatPrice(v, currency)}
            width={80}
            orientation="right"
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "var(--shadow-card)",
            }}
            labelFormatter={(v) => new Date(Number(v)).toLocaleString()}
            formatter={(v: number) => [formatPrice(v, currency), "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGrad)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
