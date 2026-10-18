const expression = process.argv.slice(2).join(" ").trim();
if (!expression) {
  throw new Error("Usage: node tools/android-webview-eval.mjs <JavaScript expression>");
}

const targets = await fetch("http://127.0.0.1:9222/json").then((response) => response.json());
const appTarget = targets.find((target) => target.type === "page" && target.url === "https://localhost/");
if (!appTarget?.webSocketDebuggerUrl) {
  throw new Error("The Space Tower Defense Android WebView is not available on port 9222.");
}

const socket = new WebSocket(appTarget.webSocketDebuggerUrl);
const requestId = 1;
const timeout = setTimeout(() => {
  socket.close();
  throw new Error("Timed out while evaluating the Android WebView expression.");
}, 120000);

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({
    id: requestId,
    method: "Runtime.evaluate",
    params: {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    }
  }));
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
  if (message.id !== requestId) return;
  clearTimeout(timeout);
  socket.close();
  if (message.error) throw new Error(message.error.message || JSON.stringify(message.error));
  if (message.result?.exceptionDetails) {
    throw new Error(message.result.exceptionDetails.text || "Android WebView evaluation failed.");
  }
  console.log(JSON.stringify(message.result?.result?.value ?? null));
});

