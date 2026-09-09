import type { IncomingMessage, ServerResponse } from "node:http";
import { analyzeStatic } from "../src/lib/analyze.ts";
import { resolveAndAnalyze } from "../server/resolve.ts";

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "POST only" }));
    return;
  }

  try {
    const body = await readJson(req);
    const url = typeof body.url === "string" ? body.url : "";
    const follow = body.followRedirects !== false;
    if (!url.trim()) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "url is required" }));
      return;
    }
    const report = follow ? await resolveAndAnalyze(url) : analyzeStatic(url);
    res.statusCode = 200;
    res.end(JSON.stringify(report));
  } catch (error) {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Analyzer failed",
      }),
    );
  }
}
