"use client";
import { Card, CardContent } from "@/components/ui/card";
import type { RoiDataPoint } from "@/lib/types";

interface SummaryCardsProps {
  data: RoiDataPoint[];
}

interface SummaryMetric {
  label: string;
  value: string;
  trend?: number;
  icon: React.ReactNode;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatPercent(num: number): string {
  return `${(num * 100).toFixed(1)}%`;
}

function calculateMetrics(data: RoiDataPoint[]): {
  totalInstalls: number;
  avgRoi: number;
  roi7d: number;
  pendingDays: number;
} {
  if (!data || data.length === 0) {
    return {
      totalInstalls: 0,
      avgRoi: 0,
      roi7d: 0,
      pendingDays: 0,
    };
  }

  const totalInstalls = data.reduce(
    (sum, item) => sum + (item.installs || 0),
    0,
  );

  const validRoiData = data.filter(
    (item) => item.roi_value !== null && item.roi_value !== undefined,
  );
  const avgRoi =
    validRoiData.length > 0
      ? validRoiData.reduce((sum, item) => sum + (item.roi_value || 0), 0) /
        validRoiData.length
      : 0;

  const roi7dData = data.filter(
    (item) => item.roi_7d !== null && item.roi_7d !== undefined,
  );
  const roi7d =
    roi7dData.length > 0
      ? roi7dData.reduce((sum, item) => sum + (item.roi_7d || 0), 0) /
        roi7dData.length
      : 0;

  const pendingDays = data.filter((item) => item.roi_status === 2).length;

  return {
    totalInstalls,
    avgRoi,
    roi7d,
    pendingDays,
  };
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const metrics = calculateMetrics(data);

  const cards: SummaryMetric[] = [
    {
      label: "总安装量",
      value: formatNumber(metrics.totalInstalls),
      icon: (
        <svg
          className="size-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      label: "平均 ROI",
      value: formatPercent(metrics.avgRoi),
      icon: (
        <svg
          className="size-6 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      label: "7 日 ROI",
      value: formatPercent(metrics.roi7d),
      icon: (
        <svg
          className="size-6 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      label: "待更新天数",
      value: metrics.pendingDays.toString(),
      icon: (
        <svg
          className="size-6 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600">
                  {card.label}
                </p>
                <p className="text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 p-3">{card.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
