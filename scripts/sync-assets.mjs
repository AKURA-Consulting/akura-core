import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
await mkdir(resolve(root, "public"), { recursive: true });
await Promise.all([
  copyFile(resolve(root, "src/index.html"), resolve(root, "public/index.html")),
  copyFile(resolve(root, "src/frontend/app.js"), resolve(root, "public/app.js")),
  copyFile(resolve(root, "src/frontend/styles.css"), resolve(root, "public/styles.css"))
]);
console.log("Frontend assets synchronized.");
