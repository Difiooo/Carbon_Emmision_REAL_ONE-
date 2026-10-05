const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 5000);
const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "activities.json");
const validTypes = {
  transport: { car: 0.18, bus: 0.08, motorcycle: 0.1 },
  food: { vegetarian: 1.5, meat: 3.0 },
  energy: { electricity: 0.7 },
};

fs.mkdirSync(dataDirectory, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]\n", "utf8");

function readActivities() {
  const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  return Array.isArray(parsed) ? parsed : [];
}

function saveActivities(activities) {
  const tempFile = `${dataFile}.tmp`;
  fs.writeFileSync(tempFile, `${JSON.stringify(activities, null, 2)}\n`, "utf8");
  fs.renameSync(tempFile, dataFile);
}

function sendJson(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) reject(new Error("Request body is too large."));
    });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("Request body must be valid JSON.")); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("EcoTrack backend is running.");
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { status: "ok", message: "EcoTrack backend is running" });
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/activities") {
      sendJson(res, 200, readActivities().sort((a, b) => Number(b.id) - Number(a.id)));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/activities") {
      const { category, type, quantity } = await readBody(req);
      const amount = Number(quantity);
      if (!validTypes[category] || !Object.hasOwn(validTypes[category], type)) {
        sendJson(res, 400, { error: "Invalid activity category or type" });
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        sendJson(res, 400, { error: "Quantity must be a positive number" });
        return;
      }
      const activities = readActivities();
      const now = new Date();
      const activity = {
        id: activities.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1,
        category,
        type,
        quantity: amount,
        emission: amount * validTypes[category][type],
        date: now.toLocaleDateString(),
        day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(now),
      };
      activities.unshift(activity);
      saveActivities(activities);
      sendJson(res, 201, activity);
      return;
    }
    const deleteMatch = url.pathname.match(/^\/api\/activities\/(\d+)$/);
    if (req.method === "DELETE" && deleteMatch) {
      const id = Number(deleteMatch[1]);
      const activities = readActivities();
      const remaining = activities.filter((item) => Number(item.id) !== id);
      if (remaining.length === activities.length) {
        sendJson(res, 404, { error: "Activity not found" });
        return;
      }
      saveActivities(remaining);
      sendJson(res, 200, { message: "Activity deleted successfully" });
      return;
    }
    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, error.message.includes("Request body") ? 400 : 500, {
      error: error.message || "Internal server error",
    });
  }
});

server.listen(PORT, () => console.log(`EcoTrack API running at http://localhost:${PORT}`));

