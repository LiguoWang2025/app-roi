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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
}

export function FilterPanel({ value, onChange }: FilterPanelProps) {
  const handleAppChange = useCallback(
    (appId: string) => {
      const newAppIds = appId ? [appId as AppId] : [];
      onChange({ ...value, appIds: newAppIds });
    },
    [value, onChange],
  );

  const handleCountryChange = useCallback(
    (country: string) => {
      const newCountries = country ? [country as Country] : [];
      onChange({ ...value, countries: newCountries });
    },
    [value, onChange],
  );

  const handleBidTypeChange = useCallback(
    (bidType: string) => {
      onChange({ ...value, bidType: bidType as BidType });
    },
    [value, onChange],
  );

  const handleChannelChange = useCallback(
    (channel: string) => {
      onChange({ ...value, channel: channel as Channel });
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
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>筛选控制区域</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>用户安装渠道</Label>
            <Select value={value.channel} onValueChange={handleChannelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNELS.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>出价类型</Label>
            <Select value={value.bidType} onValueChange={handleBidTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BID_TYPES.map((bidType) => (
                  <SelectItem key={bidType} value={bidType}>
                    {bidType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>国家地区</Label>
            <Select
              value={value.countries[0] || ""}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择国家" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country === "US" ? "美国 (US)" : "英国 (UK)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>APP</Label>
            <Select
              value={value.appIds[0] || ""}
              onValueChange={handleAppChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择APP" />
              </SelectTrigger>
              <SelectContent>
                {APP_IDS.map((appId) => (
                  <SelectItem key={appId} value={appId}>
                    {appId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
