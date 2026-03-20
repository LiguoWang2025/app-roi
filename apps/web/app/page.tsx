"use client";

import { useState } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { ROITrendChart } from "@/components/ROITrendChart";
import { UploadModal } from "@/components/UploadModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useROI } from "@/hooks/useROI";
import { DEFAULT_FILTER, APP_IDS, type FilterState } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [showUpload, setShowUpload] = useState(false);
  const { data, isLoading, error, refetch } = useROI({
    filter,
  });
  const displayData = data;

  const selectedApp = filter.appIds[0] || APP_IDS[0];

  const handleUploadComplete = () => {
    refetch();
  };

  if (process.env.NODE_ENV === "development") {
    console.log("Filter:", filter);
    console.log("Data:", data);
    console.log("Loading:", isLoading);
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-card p-4 sm:p-6 shadow-sm">
          <div className="space-y-2 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              {selectedApp} - 多时间维度 ROI 趋势
            </h1>
            <p className="text-sm text-muted-foreground">(7 日移动平均)</p>
            <p className="text-xs text-muted-foreground">
              数据范围：最近 90 天
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="default"
              onClick={() => setShowUpload(true)}
              className="w-full sm:w-auto"
            >
              上传 CSV
            </Button>
          </div>
        </div>

        <FilterPanel value={filter} onChange={setFilter} />

        {isLoading && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-6 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              错误：{error.message}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <ROITrendChart data={displayData} yScale={filter.yScale} />
        )}
      </div>

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadComplete={handleUploadComplete}
      />
    </main>
  );
}
