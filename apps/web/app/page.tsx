"use client";

import { useState } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { SummaryCards } from "@/components/SummaryCards";
import { ROITrendChart } from "@/components/ROITrendChart";
import { UploadModal } from "@/components/UploadModal";
import { useROI } from "@/hooks/useROI";
import { DEFAULT_FILTER, type FilterState } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [showUpload, setShowUpload] = useState(false);
  const { data, isLoading, error } = useROI({
    filter,
  });
  const displayData = data;

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("Filter:", filter);
    console.log("Data:", data);
    console.log("Loading:", isLoading);
  }
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              App-1 - 多时间维度 ROI 趋势
            </h1>
            <p className="mt-2 text-sm text-slate-600">(7 日移动平均)</p>
            <p className="mt-1 text-xs text-slate-500">数据范围：最近 90 天</p>
          </div>
          <Button variant="default" onClick={() => setShowUpload(true)}>
            上传 CSV
          </Button>
        </div>

        <FilterPanel value={filter} onChange={setFilter} />

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">加载中...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">错误：{error.message}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <SummaryCards data={displayData} />
            <ROITrendChart data={displayData} yScale={filter.yScale} />
          </>
        )}
      </div>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
    </main>
  );
}
