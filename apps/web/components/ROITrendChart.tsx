"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoiDataPoint } from "@/lib/types";

interface ROITrendChartProps {
  data: RoiDataPoint[];
  yScale?: "linear" | "log";
}

const PERIOD_COLORS: Record<string, string> = {
  "0d": "#ef4444",
  "1d": "#06b6d4",
  "3d": "#0891b2",
  "7d": "#059669",
  "14d": "#d97706",
  "30d": "#7c3aed",
  "60d": "#2563eb",
  "90d": "#db2777",
};

const PERIOD_LABELS: Record<string, string> = {
  "0d": "当日",
  "1d": "1 日",
  "3d": "3 日",
  "7d": "7 日",
  "14d": "14 日",
  "30d": "30 日",
  "60d": "60 日",
  "90d": "90 日",
};

export function ROITrendChart({ data, yScale = "linear" }: ROITrendChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 100) {
      return `${value.toFixed(0)}%`;
    } else if (value >= 10) {
      return `${value.toFixed(0)}%`;
    } else {
      return `${value.toFixed(0)}%`;
    }
  };

  const formatTooltip = (value: number, name: string) => {
    return [`${value.toFixed(2)}%`, name];
  };

  const chartData = data.map((item) => {
    const base = {
      date: item.stat_date,
    };

    const periodData: Record<string, number | null> = {};
    ROI_PERIODS.forEach((period) => {
      const key = `roi_${period}`;
      const value = (item as any)[key];
      periodData[key] = value != null ? Number(value) * 100 : null;
    });

    return {
      ...base,
      ...periodData,
      moving_avg:
        item.moving_avg != null ? Number(item.moving_avg) * 100 : null,
      forecast: item.forecast != null ? Number(item.forecast) * 100 : null,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>图表区域</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}月${date.getDate()}日`;
                }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                scale={yScale === "log" ? "log" : "linear"}
                domain={[0, "auto"]}
                tickFormatter={formatYAxis}
                type="number"
                ticks={[10, 30, 50, 70, 100, 150, 200, 300, 400, 500]}
              />
              <Tooltip formatter={formatTooltip} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  fontSize: "12px",
                }}
              />
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeWidth={2}
                label={{
                  value: "100% 回本线",
                  fill: "#ef4444",
                  fontSize: 12,
                }}
              />
              {Object.keys(PERIOD_COLORS).map((period) => (
                <Line
                  key={period}
                  type="monotone"
                  dataKey={`roi_${period}`}
                  stroke={PERIOD_COLORS[period]}
                  strokeWidth={2}
                  dot={false}
                  name={`${PERIOD_LABELS[period]}(7 日均值)`}
                  isAnimationActive={false}
                />
              ))}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#000000"
                strokeWidth={2}
                dot={false}
                strokeDasharray="3 3"
                name="预测值"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const ROI_PERIODS = ["0d", "1d", "3d", "7d", "14d", "30d", "60d", "90d"];
