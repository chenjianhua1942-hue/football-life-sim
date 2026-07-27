import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const copies = [
  ["sites/server.js", "dist/server/index.js"],
  [".openai/hosting.json", "dist/.openai/hosting.json"],
  ["dist/index.html", "dist/client/index.html"],
  ["dist/assets", "dist/client/assets"],
  ["dist/icon.svg", "dist/client/icon.svg"]
];

for (const [source, destination] of copies) {
  const target = resolve(destination);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(source), target, { recursive: true });
}
