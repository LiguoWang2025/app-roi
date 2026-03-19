export const APP_IDS = ["App-1", "App-2", "App-3", "App-4", "App-5"] as const;
export const COUNTRIES = ["US", "UK"] as const;
export const ROI_PERIODS = [
  "0d",
  "1d",
  "3d",
  "7d",
  "14d",
  "30d",
  "60d",
  "90d",
] as const;
export const BID_TYPES = ["CPI"] as const;
export const CHANNELS = ["Apple"] as const;
export const DISPLAY_MODES = ["moving_average", "raw"] as const;
export const Y_SCALES = ["linear", "log"] as const;

export type AppId = (typeof APP_IDS)[number];
export type Country = (typeof COUNTRIES)[number];
export type RoiPeriod = (typeof ROI_PERIODS)[number];
export type BidType = (typeof BID_TYPES)[number];
export type Channel = (typeof CHANNELS)[number];
export type DisplayMode = (typeof DISPLAY_MODES)[number];
export type YScale = (typeof Y_SCALES)[number];

export interface FilterState {
  appIds: AppId[];
  countries: Country[];
  bidType: BidType;
  channel: Channel;
  roiPeriod: RoiPeriod;
  startDate: string;
  endDate: string;
  displayMode: DisplayMode;
  yScale: YScale;
}

export const DEFAULT_FILTER: FilterState = {
  appIds: [],
  countries: [],
  bidType: "CPI",
  channel: "Apple",
  roiPeriod: "7d",
  startDate: "",
  endDate: "",
  displayMode: "moving_average",
  yScale: "log",
};

export interface RoiDataPoint {
  stat_date: string;
  app_id: string;
  country: string;
  installs: number;
  roi_value: number | null;
  roi_status: 1 | 2 | 3;
  moving_avg: number | null;
}

export interface RoiResponse {
  data: RoiDataPoint[];
  meta: {
    collection_date: string | null;
  };
}
