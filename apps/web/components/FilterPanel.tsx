"use client";

import { useCallback } from "react";
import {
  APP_IDS,
  COUNTRIES,
  ROI_PERIODS,
  type FilterState,
  type AppId,
  type Country,
  type RoiPeriod,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface FilterPanelProps {
  value: FilterState;
  onChange: (filter: FilterState) => void;
}

export function FilterPanel({ value, onChange }: FilterPanelProps) {
  const handleAppToggle = useCallback(
    (appId: AppId) => {
      const newAppIds = value.appIds.includes(appId)
        ? value.appIds.filter((id) => id !== appId)
        : [...value.appIds, appId];
      onChange({ ...value, appIds: newAppIds });
    },
    [value, onChange],
  );

  const handleSelectAllApps = useCallback(() => {
    onChange({ ...value, appIds: [...APP_IDS] });
  }, [value, onChange]);

  const handleClearApps = useCallback(() => {
    onChange({ ...value, appIds: [] });
  }, [value, onChange]);

  const handleCountryToggle = useCallback(
    (country: Country) => {
      const newCountries = value.countries.includes(country)
        ? value.countries.filter((c) => c !== country)
        : [...value.countries, country];
      onChange({ ...value, countries: newCountries });
    },
    [value, onChange],
  );

  const handleRoiPeriodChange = useCallback(
    (period: string) => {
      onChange({ ...value, roiPeriod: period as RoiPeriod });
    },
    [value, onChange],
  );

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, startDate: e.target.value });
    },
    [value, onChange],
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, endDate: e.target.value });
    },
    [value, onChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选条件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>App 选择</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="xs" onClick={handleSelectAllApps}>
                全选
              </Button>
              <Button variant="ghost" size="xs" onClick={handleClearApps}>
                清空
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {APP_IDS.map((appId) => (
              <label
                key={appId}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={value.appIds.includes(appId)}
                  onCheckedChange={() => handleAppToggle(appId)}
                />
                <Badge
                  variant={value.appIds.includes(appId) ? "default" : "outline"}
                >
                  {appId}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>国家</Label>
          <div className="flex gap-3">
            {COUNTRIES.map((country) => (
              <label
                key={country}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={value.countries.includes(country)}
                  onCheckedChange={() => handleCountryToggle(country)}
                />
                <Badge
                  variant={
                    value.countries.includes(country) ? "default" : "outline"
                  }
                >
                  {country === "US" ? "美国 (US)" : "英国 (UK)"}
                </Badge>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>ROI 周期</Label>
          <Tabs value={value.roiPeriod} onValueChange={handleRoiPeriodChange}>
            <TabsList className="flex flex-wrap">
              {ROI_PERIODS.map((period) => (
                <TabsTrigger key={period} value={period}>
                  {period}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-3">
          <Label>日期范围</Label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="date"
                value={value.startDate}
                onChange={handleStartDateChange}
                placeholder="开始日期"
              />
            </div>
            <span className="text-muted-foreground">至</span>
            <div className="flex-1">
              <Input
                type="date"
                value={value.endDate}
                onChange={handleEndDateChange}
                placeholder="结束日期"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
