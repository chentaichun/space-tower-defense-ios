const http = require("http");
const fs = require("fs");
const path = require("path");
const rankedServer = import('./ranked-local-server.mjs');

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 4182;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg"
};

http.createServer((request, response) => {
  const requestUrl = new URL(String(request.url || "/"), `http://${request.headers.host || `127.0.0.1:${port}`}`);
  if (requestUrl.pathname === '/api/ranked') { rankedServer.then(api => api.handleRanked(request, response)).catch(() => { response.writeHead(503); response.end('{}'); }); return; }
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    if (path.extname(file) === ".html") {
      const previewLanguage = ["zh", "en", "ja", "ko", "ru", "es"].includes(requestUrl.searchParams.get("lang"))
        ? requestUrl.searchParams.get("lang")
        : "";
      const languageBootstrap = previewLanguage
        ? `window.addEventListener("load",()=>window.setSpaceTowerLanguage?.(${JSON.stringify(previewLanguage)}));`
        : "";
      const devMode = requestUrl.searchParams.get("dev") !== "0";
      data = Buffer.from(data.toString("utf8").replace(
        "<head>",
        `<head><script>window.SPACE_TOWER_LOCAL_RANKED=true;window.SPACE_TOWER_DEV_MODE=${JSON.stringify(devMode)};${languageBootstrap}</script>`
      ));
    }
    response.writeHead(200, {
      "Content-Type": mime[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`DEV_SERVER http://127.0.0.1:${port}`);
});
