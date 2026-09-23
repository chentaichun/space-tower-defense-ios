import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((code) => !code.trim().startsWith("{"));

for (const [index, script] of scripts.entries()) {
  new vm.Script(script, { filename: `index.html<script ${index + 1}>` });
}

console.log(`checked ${scripts.length} script block(s)`);

new vm.Script(readFileSync(new URL("./progression-ux.js", import.meta.url), "utf8"), { filename: "progression-ux.js" });
