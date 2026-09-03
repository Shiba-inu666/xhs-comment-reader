import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();

if (manifest.version !== version || packageJson.version !== version) throw new Error("Version mismatch");
if (manifest.manifest_version !== 3) throw new Error("Manifest must be MV3");
if (JSON.stringify(manifest).includes("<all_urls>")) throw new Error("Broad host scope is forbidden");
if (!manifest.optional_host_permissions?.includes("https://*/*")) throw new Error("External HTTPS API permission declaration missing");

const panelHtml = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
for (const reference of ["sidepanel.css", "ai-utils.js", "sidepanel.js"]) {
  if (!panelHtml.includes(reference)) throw new Error(`Side panel reference missing: ${reference}`);
}
if (!fs.existsSync(path.join(root, "docs/REFERENCE_AUDIT.md"))) throw new Error("Reference audit missing");

const runtimeSource = ["src/background.js", "src/ai-utils.js", "src/sidepanel.js"]
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");
if (/sk-[A-Za-z0-9_-]{20,}/.test(runtimeSource)) throw new Error("Possible hard-coded API key found");
if (/document\.cookie|xsec_token|requestHeaders|XMLHttpRequest/.test(runtimeSource)) {
  throw new Error("Forbidden XiaoHongShu credential or network-capture logic found");
}

for (const file of ["src/background.js", "src/ai-utils.js", "src/sidepanel.js"]) {
  const checked = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (checked.status !== 0) throw new Error(checked.stderr);
}

const tests = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["test"], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit"
});
if (tests.status !== 0) throw new Error("Tests failed");

console.log("VALIDATION=PASS");
