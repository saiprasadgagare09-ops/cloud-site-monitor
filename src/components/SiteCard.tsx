import React from "react";
import { MonitorSite } from "../types";
import { Activity, Clock, Trash2, CheckCircle2, XCircle, AlertCircle, Search } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

interface SiteCardProps {
  site: MonitorSite;
  onDelete: (id: string) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site, onDelete }) => {
  const chartData = site.uptimeHistory.map((up, i) => ({
    value: up ? 1 : 0,
    index: i,
  }));

  const isUp = site.status === "UP";
  const isDown = site.status === "DOWN";
  const isPending = site.status === "PENDING";

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate mb-1">
              {site.url}
            </h3>
            {site.keyword && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Search size={12} />
                <span>Monitoring: "{site.keyword}"</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isUp ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
              isDown ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
              "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {isUp && <CheckCircle2 size={14} />}
              {isDown && <XCircle size={14} />}
              {isPending && <AlertCircle size={14} />}
              {isDown && site.errorMessage ? site.errorMessage : site.status}
            </div>
            <button
              onClick={() => onDelete(site.id)}
              className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <Activity size={14} />
              <span>Response Time</span>
            </div>
            <div className="text-lg font-mono font-medium text-zinc-900 dark:text-zinc-100">
              {site.responseTime ? `${site.responseTime}ms` : "--"}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
              <Clock size={14} />
              <span>Last Checked</span>
            </div>
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {site.lastChecked ? new Date(site.lastChecked).toLocaleTimeString() : "--"}
            </div>
          </div>
        </div>

        {site.keyword && (
          <div className={`mb-6 p-3 rounded-lg border ${
            site.keywordFound === true ? "bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400" :
            site.keywordFound === false ? "bg-rose-50/50 border-rose-100 text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400" :
            "bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
          }`}>
            <div className="text-xs font-medium uppercase tracking-wider mb-1">Keyword Status</div>
            <div className="text-sm">
              {site.keywordFound === true ? `Found: "${site.keyword}"` : 
               site.keywordFound === false ? `Missing: "${site.keyword}"` : 
               "Pending check..."}
            </div>
          </div>
        )}

        <div className="h-16 w-full min-h-[64px]">
          <ResponsiveContainer width="100%" height={64} minWidth={0} minHeight={64} debounce={1}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`colorUptime-${site.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="stepAfter"
                dataKey="value"
                stroke={isUp ? "#10b981" : "#f43f5e"}
                fillOpacity={1}
                fill={`url(#colorUptime-${site.id})`}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <YAxis hide domain={[0, 1]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
          <span>Uptime History</span>
          <span>Last 20 Checks</span>
        </div>
      </div>
    </div>
  );
};
