const http = require("http");
const fs = require("fs");
const path = require("path");

function loadEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf("=");
    if (idx <= 0) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    out[key] = value;
  }

  return out;
}

const env = loadEnv(path.join(__dirname, ".env"));
const PORT = Number(process.env.PORT || 8000);
const DEFAULT_FRONTEND_URL = "http://localhost:3000";

function getFrontendUrl(rawFromEnv) {
  const candidate = String(rawFromEnv || "").trim();
  if (!candidate) return DEFAULT_FRONTEND_URL;

  try {
    const parsed = new URL(candidate);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_FRONTEND_URL;
    }

    return parsed.origin;
  } catch {
    return DEFAULT_FRONTEND_URL;
  }
}

const FRONTEND_URL = getFrontendUrl(env.FRONTEND_URL);
const USERNAME = env.USERNAME || "eoc";
const USER_PASSWORD = env.USER_PASSWORD || "password123";

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return origin === FRONTEND_URL;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
}

const server = http.createServer((req, res) => {

  const origin = req.headers.origin || "";
  setCors(res);

  if (!isAllowedOrigin(origin)) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Origin not allowed" }));
    return;
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.url === "/auth" && req.method === "POST") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (body.length > 1024 * 16) {
        req.destroy();
      }
    });

    req.on("end", () => {

      let parsed = {};

      try {

        body = body.trim();

        // Detect JSON automatically
        if (body.startsWith("{")) {
          parsed = JSON.parse(body);
        }

        // Otherwise treat as form data
        else {
          parsed = Object.fromEntries(new URLSearchParams(body));
        }

      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid request body" }));
        return;
      }

      const ok =
        String(parsed.username || "").trim() === USERNAME &&
        String(parsed.password || "") === USER_PASSWORD;

      if (!ok) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: false,
          message: "Invalid credentials"
        }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));

    });

    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
