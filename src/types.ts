export interface MonitorSite {
  id: string;
  url: string;
  keyword?: string;
  status: "UP" | "DOWN" | "PENDING";
  lastChecked: string | null;
  responseTime: number | null;
  keywordFound: boolean | null;
  uptimeHistory: boolean[];
  errorMessage?: string | null;
}
