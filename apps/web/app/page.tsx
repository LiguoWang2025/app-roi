"use client";

import { useState } from "react";
import { FilterPanel } from "@/components/FilterPanel";
import { DEFAULT_FILTER, type FilterState } from "@/lib/types";

export default function HomePage() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            App-1 - 多时间维度 ROI 趋势
          </h1>
          <p className="mt-2 text-sm text-slate-600">(7 日移动平均)</p>
          <p className="mt-1 text-xs text-slate-500">数据范围：最近 90 天</p>
        </div>

        <FilterPanel value={filter} onChange={setFilter} />
      </div>
    </main>
  );
}
