import { Line, LineChart, ResponsiveContainer } from "recharts";

interface Props {
  data: number[];
  positive: boolean;
}

export const Sparkline = ({ data, positive }: Props) => {
  if (!data || data.length === 0) return null;
  const points = data.map((price, i) => ({ i, price }));
  const stroke = positive ? "hsl(var(--bull))" : "hsl(var(--bear))";

  return (
    <div className="h-10 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={stroke}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
