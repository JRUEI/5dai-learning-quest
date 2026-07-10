import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const htmlFiles = ["index.html", "day1.html", "podcast.html", "assignment.html", "whitepaper.html"];
const jsFiles = ["course-data.js", "progress.js", "material.js"];
const errors = [];

for (const file of [...htmlFiles, ...jsFiles, "site.css", "reader.css"]) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

for (const file of htmlFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  const html = fs.readFileSync(fullPath, "utf8");
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${file}: missing title`);
  if (!/name="viewport"/i.test(html)) errors.push(`${file}: missing viewport meta`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|#|data:|mailto:)/.test(target) || target.includes("${")) continue;
    const clean = target.split(/[?#]/)[0];
    if (clean && !fs.existsSync(path.join(root, clean))) errors.push(`${file}: broken local reference ${target}`);
  }
}

for (const file of jsFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  try { new vm.Script(fs.readFileSync(fullPath, "utf8"), { filename: file }); }
  catch (error) { errors.push(`${file}: ${error.message}`); }
}

const whitepaper = fs.readFileSync(path.join(root, "whitepaper.html"), "utf8");
const slideCount = (whitepaper.match(/k:'(?:DAY 1|\d{2} \/ 30)/g) || []).length;
if (slideCount !== 30) errors.push(`whitepaper.html: expected 30 slides, found ${slideCount}`);
for (const image of ["agent-loop.jpg", "vibe-spectrum.jpg", "context-architecture.jpg", "new-sdlc.jpg", "factory-model.jpg", "harness-model.jpg", "developer-modes.jpg", "economics.jpg"]) {
  if (!fs.existsSync(path.join(root, "assets", "whitepaper", image))) errors.push(`Missing whitepaper diagram: ${image}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Site validation passed: ${htmlFiles.length} pages, ${slideCount} whitepaper slides.`);
