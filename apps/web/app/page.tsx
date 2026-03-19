'use client';

import { useState } from 'react';
import { FilterPanel } from '@/components/FilterPanel';
import { DEFAULT_FILTER, type FilterState } from '@/lib/types';

export default function HomePage() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">AppInsight ROI</h1>
          <p className="mt-2 text-sm text-slate-600">
            多维度广告数据分析系统 - 监控 App 投放表现与 ROI 趋势
          </p>
        </div>

        <FilterPanel value={filter} onChange={setFilter} />

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">当前筛选条件</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-medium">App:</span>{' '}
              {filter.appIds.length > 0 ? filter.appIds.join(', ') : '全部'}
            </p>
            <p>
              <span className="font-medium">国家:</span>{' '}
              {filter.countries.length > 0 ? filter.countries.join(', ') : '全部'}
            </p>
            <p>
              <span className="font-medium">ROI 周期:</span> {filter.roiPeriod}
            </p>
            <p>
              <span className="font-medium">日期范围:</span>{' '}
              {filter.startDate || '不限'} 至 {filter.endDate || '不限'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
