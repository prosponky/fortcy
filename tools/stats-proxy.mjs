import http from "node:http";

const port = Number(process.env.FORTCY_STATS_PROXY_PORT ?? 8787);
const apiKey = process.env.FORTNITE_API_KEY;
const origin = "https://fortnite-api.com";

const send = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "http://localhost:1420" });
  res.end(JSON.stringify(body));
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, { "access-control-allow-origin": "http://localhost:1420", "access-control-allow-methods": "GET", "access-control-allow-headers": "content-type" }); return res.end(); }
  if (req.method !== "GET" || !req.url?.startsWith("/stats/player")) return send(res, 404, { error: "Not found" });
  if (!apiKey) return send(res, 503, { error: "FORTNITE_API_KEY is not configured" });
  const name = new URL(req.url, `http://127.0.0.1:${port}`).searchParams.get("displayName")?.trim();
  if (!name) return send(res, 400, { error: "displayName is required" });
  try {
    const encodedName = encodeURIComponent(name);
    const statsResponse = await fetch(`${origin}/v2/stats/br/v2?name=${encodedName}&accountType=epic&timeWindow=season`, { headers: { Authorization: `ApiKey ${apiKey}` } });
    if (!statsResponse.ok) return send(res, statsResponse.status, { error: "Provider rejected the API key or profile request" });
    const raw = await statsResponse.json();
    const stats = raw.stats ?? raw.data ?? raw;
    return send(res, 200, { displayName: name, wins: stats.wins ?? stats.winsTotal ?? null, kills: stats.kills ?? stats.killsTotal ?? null, matches: stats.matches ?? stats.matchesPlayed ?? null, winRate: stats.winRate ?? null, updatedAt: new Date().toISOString() });
  } catch { return send(res, 502, { error: "Stats provider unavailable" }); }
});

server.listen(port, "127.0.0.1", () => console.log(`Fortcy stats proxy listening on http://127.0.0.1:${port}`));
