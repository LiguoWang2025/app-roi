"use client";

import { useMemo, useState, useCallback } from "react";
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
  type TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoiDataPoint } from "@/lib/types";

interface ROITrendChartProps {
  data: RoiDataPoint[];
  yScale?: "linear" | "log";
}

interface ChartDataPoint {
  date: string;
  [key: string]: string | number | null | boolean | undefined;
  roi_0d?: number | null;
  roi_0d_actual_zero?: boolean;
  roi_1d?: number | null;
  roi_1d_actual_zero?: boolean;
  roi_3d?: number | null;
  roi_3d_actual_zero?: boolean;
  roi_7d?: number | null;
  roi_7d_actual_zero?: boolean;
  roi_14d?: number | null;
  roi_14d_actual_zero?: boolean;
  roi_30d?: number | null;
  roi_30d_actual_zero?: boolean;
  roi_60d?: number | null;
  roi_60d_actual_zero?: boolean;
  roi_90d?: number | null;
  roi_90d_actual_zero?: boolean;
  roi_0d_missing?: boolean;
  roi_1d_missing?: boolean;
  roi_3d_missing?: boolean;
  roi_7d_missing?: boolean;
  roi_14d_missing?: boolean;
  roi_30d_missing?: boolean;
  roi_60d_missing?: boolean;
  roi_90d_missing?: boolean;
  roi_0d_insufficient?: boolean;
  roi_1d_insufficient?: boolean;
  roi_3d_insufficient?: boolean;
  roi_7d_insufficient?: boolean;
  roi_14d_insufficient?: boolean;
  roi_30d_insufficient?: boolean;
  roi_60d_insufficient?: boolean;
  roi_90d_insufficient?: boolean;
  moving_avg?: number | null;
  forecast?: number | null;
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

const LOG_SCALE_MIN_VALUE = 3;

/**
 * 对数刻度专用 ticks 数组
 * 锁定这些特定点，确保 Y 轴刻度清晰、专业
 * 避免自动生成导致 0.1%、0.2% 等异常低端刻度
 */
const LOG_SCALE_TICKS = [6, 10, 20, 30, 50, 70, 100, 200, 300, 500];

/**
 * 对数刻度锁定最大值
 * 防止数据超出范围时图表自动膨胀导致视觉失真
 */
const LOG_SCALE_MAX_VALUE = 500;

const ROI_PERIODS = ["0d", "1d", "3d", "7d", "14d", "30d", "60d", "90d"];

/**
 * 获取所有数据线的唯一标识（dataKey）
 */
const getAllDataKeys = () => {
  const periodKeys = ROI_PERIODS.map((period) => `roi_${period}`);
  return [...periodKeys, "forecast"];
};

export function ROITrendChart({ data, yScale = "linear" }: ROITrendChartProps) {
  /**
   * 状态管理：控制每条数据线的显示/隐藏
   * key: dataKey (如 'roi_0d', 'forecast')
   * value: boolean (true = 显示，false = 隐藏)
   */
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      getAllDataKeys().forEach((key) => {
        initial[key] = true; // 默认全部显示
      });
      return initial;
    },
  );

  /**
   * 图例点击处理函数
   * 切换对应数据线的显示/隐藏状态
   */
  const handleLegendClick = useCallback((data: any) => {
    const dataKey = data?.dataKey;
    if (!dataKey) return;

    setVisibleLines((prev) => ({
      ...prev,
      [String(dataKey)]: !prev[String(dataKey)],
    }));
  }, []);
  /**
   * 数据清洗层：使用 useMemo 进行视图层拦截
   * 核心逻辑：
   * 1. 识别所有真实值为 0 的数据点
   * 2. 将 0 替换为对数刻度的极小底线值（LOG_SCALE_MIN_VALUE = 0）
   * 3. 为每个数据点打上 is_actual_zero 掩码标记，用于 Tooltip 还原
   *
   * 为什么这样做？
   * - 数学底层：log(0) 是无定义的，会导致 D3.js 渲染崩溃
   * - 视觉欺骗：用户看到的是真实的 0%，但底层计算使用的是安全的底线值
   * - 性能优化：useMemo 避免每次渲染都重新计算
   */
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const fallbackValue = yScale === "log" ? LOG_SCALE_MIN_VALUE : 0;
    return data.map((item) => {
      const base: ChartDataPoint = {
        date: item.stat_date,
      };

      ROI_PERIODS.forEach((period) => {
        const key = `roi_${period}`;
        const statusKey = `${key}_status` as keyof RoiDataPoint;
        const value = (item as any)[key];
        const numericValue = value != null ? Number(value) * 100 : null;
        const statusValue = item[statusKey] as 1 | 2 | 3 | undefined;
        const isInsufficient = statusValue === 2;
        base[`${key}_insufficient` as keyof ChartDataPoint] = isInsufficient;

        if (isInsufficient) {
          base[key] = fallbackValue;
          base[`${key}_actual_zero` as keyof ChartDataPoint] = false;
          base[`${key}_missing` as keyof ChartDataPoint] = false;
        } else if (numericValue === 0) {
          base[key] = fallbackValue;
          base[`${key}_actual_zero` as keyof ChartDataPoint] = true;
          base[`${key}_missing` as keyof ChartDataPoint] = false;
        } else if (!numericValue) {
          // 没有值 → 替换为安全底线，并打上掩码
          base[key] = fallbackValue;
          base[`${key}_actual_zero` as keyof ChartDataPoint] = false;
          base[`${key}_missing` as keyof ChartDataPoint] = true;
        } else {
          base[key] = numericValue;
          base[`${key}_actual_zero` as keyof ChartDataPoint] = false;
          base[`${key}_missing` as keyof ChartDataPoint] = false;
        }
      });

      base.moving_avg =
        item.moving_avg != null ? Number(item.moving_avg) * 100 : null;
      base.forecast =
        item.forecast != null ? Number(item.forecast) * 100 : null;

      return base;
    });
  }, [data, yScale]);

  /**
   * Y 轴格式化函数
   * 统一使用 Math.round 取整，避免低端刻度显示异常小数（如 0.1%、0.2%）
   */
  const formatYAxis = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  /**
   * 自定义 Tooltip 组件
   * 核心逻辑：检测 is_actual_zero 掩码，强制显示为真实的 0.00%
   * 而不是用来占位的底线值（7%）
   */
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const dateLabel = (() => {
      try {
        const date = new Date(label as string);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      } catch {
        return label;
      }
    })();
    return (
      <div className="rounded-lg border bg-background p-4 shadow-md">
        <p className="mb-2 text-sm font-semibold">{dateLabel}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const dataKey = entry.dataKey as string;
            const originalValue = entry.value as number | null;

            if (originalValue === null) {
              return null;
            }
            const actualZeroKey = `${dataKey}_actual_zero`;
            const insufficientKey = `${dataKey}_insufficient`;
            const missingKey = `${dataKey}_missing`;
            const isActualZero =
              (entry.payload[actualZeroKey as keyof ChartDataPoint] as
                | boolean
                | undefined) ?? false;
            const isInsufficient =
              (entry.payload[insufficientKey as keyof ChartDataPoint] as
                | boolean
                | undefined) ?? false;
            const isMissing =
              (entry.payload[missingKey as keyof ChartDataPoint] as
                | boolean
                | undefined) ?? false;
            // 关键：如果检测到掩码，强制显示为 0，而不是底线值 LOG_SCALE_MIN_VALUE
            const displayValue = isActualZero ? 0 : originalValue;
            return (
              <div
                key={index}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-medium">
                  {isInsufficient
                    ? "日期不足"
                    : isMissing
                      ? "没有数据"
                      : displayValue.toFixed(2) + "%"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isLogScale = yScale === "log";

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI 趋势分析</CardTitle>
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
                /**
                 * 对数刻度配置
                 * scale="log"：启用对数刻度，展示早期低 ROI 与后期高 ROI 的巨大落差
                 * 为什么锁定 domain？
                 * - domain={[7, 500]}：固定 Y 轴范围，避免自动缩放导致视觉失真
                 * - 下限 7：对数刻度不能处理 0，使用 7 作为视觉欺骗的底线值
                 * - 上限 500：防止数据异常时图表过度膨胀
                 *
                 * 为什么手动指定 ticks？
                 * - ticks={[7, 10, 20, 30, 50, 70, 100, 200, 300, 500]}
                 * - 避免 D3 自动生成异常刻度（如 0.1%、0.2% 等小数）
                 * - 确保刻度清晰、专业、符合行业标准
                 */
                scale={isLogScale ? "log" : "linear"}
                domain={
                  isLogScale
                    ? [LOG_SCALE_MIN_VALUE, LOG_SCALE_MAX_VALUE]
                    : [0, "auto"]
                }
                ticks={isLogScale ? LOG_SCALE_TICKS : undefined}
                tickFormatter={formatYAxis}
                type="number"
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  fontSize: "12px",
                }}
                content={({ payload }) => {
                  // 自定义图例渲染，支持隐藏时文字变暗
                  return (
                    <ul
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: 0,
                        margin: 0,
                        listStyle: "none",
                      }}
                    >
                      {payload?.map((entry, index) => {
                        const isHidden = !visibleLines[String(entry.dataKey)];
                        return (
                          <li
                            key={`item-${index}`}
                            onClick={() =>
                              handleLegendClick({ dataKey: entry.dataKey })
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginRight: "20px",
                              cursor: "pointer",
                              color: isHidden ? "#9ca3af" : undefined,
                              opacity: isHidden ? 0.5 : 1,
                            }}
                          >
                            <div
                              style={{
                                width: 16,
                                height: 16,
                                marginRight: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {entry.type === "line" ? (
                                <div
                                  style={{
                                    width: "100%",
                                    height: 3,
                                    backgroundColor: entry.color,
                                    opacity: isHidden ? 0.3 : 1,
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    backgroundColor: entry.color,
                                    opacity: isHidden ? 0.3 : 1,
                                  }}
                                />
                              )}
                            </div>
                            <span>{entry.value}</span>
                          </li>
                        );
                      })}
                    </ul>
                  );
                }}
                payload={(() => {
                  // 自定义图例 payload，添加隐藏状态的视觉提示
                  const basePayload = ROI_PERIODS.map((period) => {
                    const dataKey = `roi_${period}`;
                    const isVisible = visibleLines[dataKey];
                    return {
                      id: dataKey,
                      value: `${PERIOD_LABELS[period]}(7 日均值)`,
                      dataKey,
                      type: "line" as const,
                      color: PERIOD_COLORS[period],
                      fill: isVisible ? PERIOD_COLORS[period] : "#ccc",
                    };
                  });
                  const forecastVisible = visibleLines["forecast"];
                  basePayload.push({
                    id: "forecast",
                    value: "预测值",
                    dataKey: "forecast",
                    type: "line" as const,
                    color: forecastVisible ? "#000000" : "#ccc",
                    fill: forecastVisible ? "#000000" : "#ccc",
                  });
                  return basePayload;
                })()}
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
              {ROI_PERIODS.map((period) => {
                const dataKey = `roi_${period}`;
                const isVisible = visibleLines[dataKey];
                return (
                  <Line
                    key={period}
                    /**
                     * 线条平滑度配置
                     * type="monotone"：使用单调三次曲线插值，实现丝滑的曲线效果
                     * - 相比默认的"linear"（线性硬转折），monotone 会自动平滑所有转折
                     * - 保证曲线单调性，不会出现过冲（overshoot）
                     *
                     * dot={false}：移除数据点标记
                     * - 避免图表显得杂乱，增强专业感
                     * - 让用户的注意力集中在趋势上，而不是单个数据点
                     *
                     * connectNulls={true}：连接空值
                     * - 当数据存在断点时，自动连接前后数据
                     * - 确保实线/虚线无缝拼接
                     *
                     * hide：根据图例点击状态控制显示/隐藏
                     */
                    type="monotone"
                    dataKey={dataKey}
                    stroke={PERIOD_COLORS[period]}
                    strokeWidth={2}
                    dot={false}
                    name={`${PERIOD_LABELS[period]}(7 日均值)`}
                    isAnimationActive={false}
                    connectNulls={true}
                    hide={!isVisible}
                    activeDot={{ r: 6 }}
                  />
                );
              })}
              <Line
                /**
                 * 预测线配置（虚线）
                 * strokeDasharray="3 3"：虚线效果
                 * - 3px 实线 + 3px 空白，循环重复
                 * - 清晰区分历史数据（实线）与预测数据（虚线）
                 */
                type="monotone"
                dataKey="forecast"
                stroke="#000000"
                strokeWidth={2}
                dot={false}
                strokeDasharray="3 3"
                name="预测值"
                isAnimationActive={false}
                connectNulls={true}
                hide={!visibleLines["forecast"]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
