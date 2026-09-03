import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
const releaseName = `xhs-comment-reader-minimal-v${version}`;
const releaseFiles = [
  "README.md",
  "VERSION",
  "LICENSE-NOTICE.md",
  "docs/REFERENCE_AUDIT.md",
  "manifest.json",
  "src/background.js",
  "src/ai-utils.js",
  "src/sidepanel.html",
  "src/sidepanel.css",
  "src/sidepanel.js"
];
const unpacked = path.join(root, "build", "unpacked");
const stageBase = path.join(root, "build", "package");
const stageRoot = path.join(stageBase, releaseName);
const deliverables = path.join(root, "deliverables");
const zipPath = path.join(deliverables, `${releaseName}.zip`);

fs.rmSync(unpacked, { recursive: true, force: true });
fs.rmSync(stageBase, { recursive: true, force: true });
fs.mkdirSync(unpacked, { recursive: true });
fs.mkdirSync(stageRoot, { recursive: true });
fs.mkdirSync(deliverables, { recursive: true });

for (const relative of releaseFiles) {
  const source = path.join(root, relative);
  if (!fs.existsSync(source)) throw new Error(`Missing release file: ${relative}`);
  for (const destinationRoot of [unpacked, stageRoot]) {
    const destination = path.join(destinationRoot, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

for (const entry of fs.readdirSync(deliverables)) {
  if (entry.endsWith(".zip") || entry === "SHA256SUMS.txt") {
    fs.rmSync(path.join(deliverables, entry), { force: true });
  }
}

const archived = spawnSync("zip", ["-q", "-r", zipPath, releaseName], { cwd: stageBase, encoding: "utf8" });
if (archived.status !== 0) throw new Error(archived.stderr || "zip failed");
const digest = crypto.createHash("sha256").update(fs.readFileSync(zipPath)).digest("hex");
fs.writeFileSync(path.join(deliverables, "SHA256SUMS.txt"), `${digest}  ${path.basename(zipPath)}\n`, "utf8");
console.log(`ZIP_PATH=${zipPath}`);
console.log(`ZIP_SHA256=${digest}`);
