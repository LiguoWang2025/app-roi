"use client";

import { useCallback } from "react";
import {
  APP_IDS,
  COUNTRIES,
  BID_TYPES,
  CHANNELS,
  DISPLAY_MODES,
  Y_SCALES,
  type FilterState,
  type AppId,
  type Country,
  type BidType,
  type Channel,
  type DisplayMode,
  type YScale,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
}

export function FilterPanel({ value, onChange }: FilterPanelProps) {
  const handleAppChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const appId = e.target.value;
      const newAppIds = appId ? [appId as AppId] : [];
      onChange({ ...value, appIds: newAppIds });
    },
    [value, onChange],
  );

  const handleCountryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const country = e.target.value;
      const newCountries = country ? [country as Country] : [];
      onChange({ ...value, countries: newCountries });
    },
    [value, onChange],
  );

  const handleBidTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...value, bidType: e.target.value as BidType });
    },
    [value, onChange],
  );

  const handleChannelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ ...value, channel: e.target.value as Channel });
    },
    [value, onChange],
  );

  const handleDisplayModeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, displayMode: e.target.value as DisplayMode });
    },
    [value, onChange],
  );

  const handleYScaleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, yScale: e.target.value as YScale });
    },
    [value, onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选控制区域</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>用户安装渠道</Label>
            <select
              value={value.channel}
              onChange={handleChannelChange}
              className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>出价类型</Label>
            <select
              value={value.bidType}
              onChange={handleBidTypeChange}
              className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {BID_TYPES.map((bidType) => (
                <option key={bidType} value={bidType}>
                  {bidType}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>国家地区</Label>
            <select
              value={value.countries[0] || ""}
              onChange={handleCountryChange}
              className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">全部</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country === "US" ? "美国 (US)" : "英国 (UK)"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>APP</Label>
            <select
              value={value.appIds[0] || ""}
              onChange={handleAppChange}
              className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground shadow-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">全部</option>
              {APP_IDS.map((appId) => (
                <option key={appId} value={appId}>
                  {appId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>数据显示模式</Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayMode"
                  value="moving_average"
                  checked={value.displayMode === "moving_average"}
                  onChange={handleDisplayModeChange}
                  className="size-4 accent-primary"
                />
                显示移动平均值
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayMode"
                  value="raw"
                  checked={value.displayMode === "raw"}
                  onChange={handleDisplayModeChange}
                  className="size-4 accent-primary"
                />
                显示原始数据
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Y 轴刻度</Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="yScale"
                  value="linear"
                  checked={value.yScale === "linear"}
                  onChange={handleYScaleChange}
                  className="size-4 accent-primary"
                />
                线性刻度
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="yScale"
                  value="log"
                  checked={value.yScale === "log"}
                  onChange={handleYScaleChange}
                  className="size-4 accent-primary"
                />
                对数刻度
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
