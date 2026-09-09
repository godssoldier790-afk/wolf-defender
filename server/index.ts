import cors from "cors";
import express from "express";
import { analyzeStatic } from "../src/lib/analyze";
import { resolveAndAnalyze } from "./resolve";

const PORT = Number(process.env.PORT ?? 8787);
const app = express();

app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "WOLF DEFENDER", mode: "defensive" });
});

app.post("/api/analyze", async (req, res) => {
  const url = typeof req.body?.url === "string" ? req.body.url : "";
  const follow = req.body?.followRedirects !== false;
  if (!url.trim()) {
    res.status(400).json({ error: "url is required" });
    return;
  }
  try {
    const report = follow ? await resolveAndAnalyze(url) : analyzeStatic(url);
    res.json(report);
  } catch (error) {
    const fallback = analyzeStatic(url, {
      resolved: false,
      fetchFailed: true,
      notes: [error instanceof Error ? error.message : "Analyzer failed"],
    });
    res.json(fallback);
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`WOLF DEFENDER api on http://127.0.0.1:${PORT}`);
});
