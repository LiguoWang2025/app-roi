"use client";

import { useState, useEffect, useCallback } from "react";
import type { FilterState, RoiDataPoint, RoiResponse } from "@/lib/types";

interface UseROIOptions {
  filter: FilterState;
  enabled?: boolean;
}

interface UseROIReturn {
  data: RoiDataPoint[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useROI({
  filter,
  enabled = true,
}: UseROIOptions): UseROIReturn {
  const [data, setData] = useState<RoiDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filter.appIds.length > 0) {
        params.append("app_id", filter.appIds.join(","));
      }

      if (filter.countries.length > 0) {
        params.append("country", filter.countries.join(","));
      }

      if (filter.bidType) {
        params.append("bid_type", filter.bidType);
      }

      if (filter.channel) {
        params.append("channel", filter.channel);
      }

      if (filter.startDate) {
        params.append("start_date", filter.startDate);
      }

      if (filter.endDate) {
        params.append("end_date", filter.endDate);
      }

      params.append("roi_period", filter.roiPeriod);
      params.append("ma_days", "7");

      const url = `/api/roi?${params.toString()}`;
      console.log("Fetching ROI data from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: RoiResponse = await response.json();
      console.log("Received ROI data:", result.data.length, "items");
      setData(result.data);
    } catch (err) {
      console.error("ROI fetch error:", err);
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    filter.appIds,
    filter.countries,
    filter.bidType,
    filter.channel,
    filter.startDate,
    filter.endDate,
    filter.roiPeriod,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
