import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

interface MonitorSite {
  id: string;
  url: string;
  keyword?: string;
  status: "UP" | "DOWN" | "PENDING";
  lastChecked: string | null;
  responseTime: number | null;
  keywordFound: boolean | null;
  uptimeHistory: boolean[]; // Last 20 checks
  errorMessage?: string | null;
}

let monitoredSites: MonitorSite[] = [];

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  app.use(express.json());

  // API Routes
  app.get("/api/sites", (req, res) => {
    res.json(monitoredSites);
  });

  app.post("/api/sites", (req, res) => {
    const { url, keyword } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const newSite: MonitorSite = {
      id: Math.random().toString(36).substring(2, 15),
      url,
      keyword,
      status: "PENDING",
      lastChecked: null,
      responseTime: null,
      keywordFound: null,
      uptimeHistory: [],
      errorMessage: null,
    };

    monitoredSites.push(newSite);
    checkSite(newSite); // Initial check
    res.status(201).json(newSite);
  });

  app.delete("/api/sites/:id", (req, res) => {
    monitoredSites = monitoredSites.filter((s) => s.id !== req.params.id);
    res.status(204).send();
  });

  // Monitoring Logic
  async function checkSite(site: MonitorSite) {
    const startTime = Date.now();
    try {
      // Use a more realistic User-Agent to avoid being blocked
      const response = await axios.get(site.url, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        validateStatus: (status) => status < 500, // Treat 4xx as "UP" for status purposes if we can reach it, but maybe we should be stricter
      });

      const responseTime = Date.now() - startTime;
      const isUp = response.status >= 200 && response.status < 400;
      
      let keywordFound = null;
      if (site.keyword && isUp) {
        const $ = cheerio.load(response.data);
        const bodyText = $("body").text().toLowerCase();
        keywordFound = bodyText.includes(site.keyword.toLowerCase());
      }

      site.status = isUp ? "UP" : "DOWN";
      site.responseTime = responseTime;
      site.lastChecked = new Date().toISOString();
      site.keywordFound = keywordFound;
      site.uptimeHistory = [...site.uptimeHistory, isUp].slice(-20);
      site.errorMessage = isUp ? null : `HTTP Error: ${response.status}`;

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      site.status = "DOWN";
      site.responseTime = responseTime;
      site.lastChecked = new Date().toISOString();
      site.keywordFound = null;
      site.uptimeHistory = [...site.uptimeHistory, false].slice(-20);
      
      if (error.code === "ECONNABORTED") {
        site.errorMessage = "Timeout (15s)";
      } else if (error.code === "ENOTFOUND") {
        site.errorMessage = "DNS Not Found";
      } else if (error.response) {
        site.errorMessage = `HTTP ${error.response.status}`;
      } else {
        site.errorMessage = error.message || "Connection Failed";
      }
    }

    io.emit("siteUpdate", site);
  }

  // Run monitoring every 1 minute
  setInterval(() => {
    monitoredSites.forEach(checkSite);
  }, 60000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
