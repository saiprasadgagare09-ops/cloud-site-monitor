# Cloud Site Monitor

A production-style website monitoring service that tracks uptime, response times, and keyword changes in real-time.

## Features
- **Real-time Monitoring**: Checks site status every 60 seconds.
- **Keyword Tracking**: Notifies if a specific keyword is missing from the page.
- **Uptime History**: Visualizes the last 20 checks with a sparkline chart.
- **Instant Updates**: Uses WebSockets (Socket.io) to push updates to the dashboard.
- **Modern UI**: Built with Tailwind CSS, Lucide icons, and Recharts.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js, Express, Socket.io, Axios, Cheerio
- **Development**: Vite, tsx

## Getting Started

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Deployment

#### Vercel / AWS
To deploy this as a full-stack app on platforms like AWS App Runner or Render:
1. Ensure `NODE_ENV` is set to `production`.
2. Run `npm run build` to generate the frontend assets.
3. Start the server using `node server.ts` (or compile it to JS first).
4. The server handles both API routes and serving the static frontend files.

## Project Structure
- `server.ts`: Express server with monitoring logic and WebSocket setup.
- `src/App.tsx`: Main dashboard component.
- `src/components/`: Reusable UI components (SiteCard, AddSiteForm).
- `src/types.ts`: TypeScript interfaces.
- `src/lib/utils.ts`: Utility functions for Tailwind class merging.
