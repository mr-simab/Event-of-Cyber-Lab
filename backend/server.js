const http = require("http");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env
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

// Credentials
const USERNAME = env.USERNAME || "eoc";
const USER_PASSWORD = env.USER_PASSWORD || "password123";

// Set CORS headers
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
}

const server = http.createServer((req, res) => {
  setCors(res);

  // Respond to preflight OPTIONS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Auth endpoint
  if (req.url === "/auth" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 16) req.destroy();
    });

    req.on("end", () => {
      let parsed = {};
      try {
        body = body.trim();

        // Detect JSON automatically
        if (body.startsWith("{")) {
          parsed = JSON.parse(body);
        } else {
          parsed = Object.fromEntries(new URLSearchParams(body));
        }
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid request body" }));
        return;
      }

      // Check credentials
      const ok =
        String(parsed.username || "").trim() === USERNAME &&
        String(parsed.password || "") === USER_PASSWORD;

      if (!ok) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "Invalid credentials" }));
        return;
      }

      // Success
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });

    return;
  }

  // 404 fallback
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: false, message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} (CORS enabled for all origins)`);
});
