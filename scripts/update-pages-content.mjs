import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SITE_ENTRIES = ["index.html", "assets", "css", "days", "js"];

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : "";
}

function resolved(value) {
  return path.resolve(process.cwd(), value);
}

function assertPublishCheckout(publishDir) {
  if (!fs.existsSync(path.join(publishDir, ".git"))) {
    throw new Error(`Refusing to update a directory that is not a Git checkout: ${publishDir}`);
  }
}

function copySite(sourceDir, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });
  for (const entry of SITE_ENTRIES) {
    const source = path.join(sourceDir, entry);
    if (!fs.existsSync(source)) throw new Error(`Missing site entry: ${source}`);
    fs.cpSync(source, path.join(destinationDir, entry), { recursive: true });
  }
  fs.writeFileSync(path.join(destinationDir, ".nojekyll"), "", "utf8");
}

function clearProductionRoot(publishDir) {
  for (const entry of fs.readdirSync(publishDir)) {
    if (entry === ".git" || entry === "previews") continue;
    fs.rmSync(path.join(publishDir, entry), { recursive: true, force: true });
  }
}

function previewNumber(name) {
  const match = /^pr-(\d+)$/.exec(name);
  return match ? Number(match[1]) : 0;
}

function writePreviewIndex(publishDir) {
  const previewRoot = path.join(publishDir, "previews");
  fs.mkdirSync(previewRoot, { recursive: true });
  const previews = fs.readdirSync(previewRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && previewNumber(entry.name))
    .sort((left, right) => previewNumber(left.name) - previewNumber(right.name));
  const links = previews.length
    ? previews.map(entry => `<li><a href="./${entry.name}/">PR #${previewNumber(entry.name)} preview</a></li>`).join("\n")
    : "<li>No active previews.</li>";
  fs.writeFileSync(path.join(previewRoot, "index.html"), `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>5DAI PR Previews</title>
<style>body{margin:0;padding:40px;background:#09111f;color:#e7eef9;font:16px system-ui,sans-serif}main{max-width:720px;margin:auto}h1{font-size:28px}a{color:#8fc8ff}li{margin:14px 0}</style></head>
<body><main><h1>5DAI PR Previews</h1><p>開啟中的網站預覽：</p><ul>${links}</ul><p><a href="../">返回正式網站</a></p></main></body></html>`, "utf8");
}

export function updatePagesContent({ sourceDir, publishDir, eventName, eventAction, prNumber }) {
  assertPublishCheckout(publishDir);
  if (sourceDir === publishDir) throw new Error("Source and publish directories must be different");

  if (eventName === "push" || eventName === "workflow_dispatch") {
    clearProductionRoot(publishDir);
    copySite(sourceDir, publishDir);
  } else if (eventName === "pull_request") {
    if (!/^\d+$/.test(String(prNumber))) throw new Error("A numeric PR number is required");
    const previewRoot = path.join(publishDir, "previews");
    const target = path.resolve(previewRoot, `pr-${prNumber}`);
    if (!target.startsWith(path.resolve(previewRoot) + path.sep)) throw new Error("Unsafe preview path");
    fs.rmSync(target, { recursive: true, force: true });
    if (eventAction !== "closed") copySite(sourceDir, target);
  } else {
    throw new Error(`Unsupported event: ${eventName}`);
  }

  fs.writeFileSync(path.join(publishDir, ".nojekyll"), "", "utf8");
  writePreviewIndex(publishDir);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  updatePagesContent({
    sourceDir: resolved(argument("source")),
    publishDir: resolved(argument("publish")),
    eventName: argument("event"),
    eventAction: argument("action"),
    prNumber: argument("pr")
  });
}
