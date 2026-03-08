const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);

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

const env = loadEnv(path.join(ROOT, ".env"));
const DEFAULT_BACKEND_URL = "https://eoc-lab.onrender.com";

function getBackendUrl(rawFromEnv) {
  const candidate = String(rawFromEnv || "").trim();
  if (!candidate) return DEFAULT_BACKEND_URL;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_BACKEND_URL;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

const backendUrl = getBackendUrl(env.BACKEND_URL);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(ROOT, normalized);
}

function sendFile(res, filePath) {
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

http
  .createServer((req, res) => {
    const reqPath = req.url || "/";

    if (reqPath.split("?")[0] === "/assets/config.js") {
      res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
      res.end(`window.APP_CONFIG = { BACKEND_URL: "${backendUrl}" };`);
      return;
    }

    let target = reqPath === "/" ? "/index.html" : reqPath;
    let filePath = safePath(target);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    sendFile(res, filePath);
  })
  .listen(PORT, () => {
    console.log(`Frontend running on http://localhost:${PORT}`);
  });
