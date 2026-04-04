import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MonitorSite } from "./types";
import { AddSiteForm } from "./components/AddSiteForm";
import { SiteCard } from "./components/SiteCard";
import { LayoutDashboard, Activity, ShieldCheck, Globe, AlertCircle, XCircle } from "lucide-react";

export default function App() {
  const [sites, setSites] = useState<MonitorSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Suppress benign WebSocket errors that can occur during HMR or environment transitions
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = (...args) => {
      if (args[0]?.toString().includes("failed to connect to websocket")) return;
      originalConsoleWarn(...args);
    };

    // Initialize socket inside useEffect with fallback transports
    const socket = io({
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
      transports: ["polling", "websocket"], // Start with polling for better compatibility
    });
    socketRef.current = socket;

    // Handle unhandled rejections specifically for WebSockets if they leak
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("WebSocket") || event.reason?.toString().includes("WebSocket")) {
        event.preventDefault();
        console.warn("Caught benign WebSocket rejection:", event.reason);
      }
    };
    window.addEventListener("unhandledrejection", handleRejection);

    // Initial fetch
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data) => {
        setSites(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch sites:", err);
        setError("Failed to connect to monitoring service.");
        setLoading(false);
      });

    // Socket updates
    socket.on("siteUpdate", (updatedSite: MonitorSite) => {
      setSites((prev) => {
        const index = prev.findIndex((s) => s.id === updatedSite.id);
        if (index === -1) return [...prev, updatedSite];
        const newSites = [...prev];
        newSites[index] = updatedSite;
        return newSites;
      });
    });

    socket.on("connect_error", (err) => {
      // Log but don't crash
      console.debug("Socket connection state:", err.message);
    });

    return () => {
      socket.disconnect();
      window.removeEventListener("unhandledrejection", handleRejection);
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  const handleAddSite = async (url: string, keyword: string) => {
    setError(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, keyword }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add monitor");
      }

      const newSite = await res.json();
      setSites((prev) => {
        if (prev.some((s) => s.id === newSite.id)) return prev;
        return [...prev, newSite];
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const handleDeleteSite = async (id: string) => {
    await fetch(`/api/sites/${id}`, { method: "DELETE" });
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  const upCount = sites.filter((s) => s.status === "UP").length;
  const downCount = sites.filter((s) => s.status === "DOWN").length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg">
              <Activity className="text-white dark:text-zinc-900" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">CloudMonitor</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{upCount} Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>{downCount} Offline</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Monitoring Dashboard</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Track your infrastructure's health and uptime in real-time.
          </p>
        </div>

        {/* Add Monitor Form */}
        <div className="mb-12">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-rose-400 hover:text-rose-600 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
          <AddSiteForm onAdd={handleAddSite} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 mb-4">
              <Globe size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">Total Monitors</span>
            </div>
            <div className="text-4xl font-bold">{sites.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <ShieldCheck size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">System Health</span>
            </div>
            <div className="text-4xl font-bold">
              {sites.length > 0 ? `${Math.round((upCount / sites.length) * 100)}%` : "100%"}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 mb-4">
              <LayoutDashboard size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">Active Alerts</span>
            </div>
            <div className="text-4xl font-bold">{downCount}</div>
          </div>
        </div>

        {/* Monitors Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Activity className="animate-pulse mb-4" size={48} />
            <p>Loading your monitors...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-20 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Globe className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-1">No monitors yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Add your first website to start monitoring.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} onDelete={handleDeleteSite} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 py-10 text-center text-zinc-500 dark:text-zinc-400 text-sm">
        <p>© 2026 CloudMonitor. Built for high-availability infrastructure.</p>
      </footer>
    </div>
  );
}
