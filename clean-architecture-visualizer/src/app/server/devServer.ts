import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import chalk from "chalk";

const API_PORT  = 3131;
const VITE_PORT = 5173;

export function startDevServer() {
  const app = express();
  app.use(express.json());

  // ── Session DB API ────────────────────────────────────────────
  app.get("/api/session", (_req, res) => {
    res.json(sessionDb.all());
  });

  app.post("/api/session/:key", (req, res) => {
    sessionDb.set(req.params.key, req.body);
    res.json({ ok: true });
  });

  app.get("/api/session/:key", (req, res) => {
    const value = sessionDb.get(req.params.key);
    value !== null ? res.json(value) : res.status(404).json({ error: "not found" });
  });

  app.delete("/api/session/:key", (req, res) => {
    sessionDb.delete(req.params.key);
    res.json({ ok: true });
  });

  // ── Proxy everything else to Vite frontend ────────────────────
  app.use(
    "/",
    createProxyMiddleware({
      target: `http://localhost:${VITE_PORT}`,
      changeOrigin: true,
      ws: true,           // proxy WebSocket (Vite HMR)
    })
  );

  app.listen(API_PORT, () => {
    console.log(chalk.green(`Dev server running at http://localhost:${API_PORT}`));
    console.log(chalk.dim(`  → Proxying frontend from :${VITE_PORT}`));
    console.log(chalk.dim(`  → Session API at /api/session`));
  });
}