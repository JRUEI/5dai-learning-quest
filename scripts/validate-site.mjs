import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const htmlFiles = ["index.html", "day1.html", "day2.html", "day3.html", "day4.html", "day5.html", "podcast.html", "podcast-day2.html", "assignment.html", "assignment-day2.html", "whitepaper.html", "whitepaper-day2.html"];
const jsFiles = ["course-data.js", "progress.js", "material.js", "day1.js", "home.js"];
const errors = [];

for (const file of [...htmlFiles, ...jsFiles, "firebase-sync.js", "site.css", "reader.css"]) {
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
  if (!html.includes('type="module" src="firebase-sync.js"')) errors.push(`${file}: Firebase sync module is not loaded`);
}

for (const file of jsFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  try { new vm.Script(fs.readFileSync(fullPath, "utf8"), { filename: file }); }
  catch (error) { errors.push(`${file}: ${error.message}`); }
}

for (const file of ["podcast.html", "podcast-day2.html", "assignment.html", "assignment-day2.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const modeControls = (html.match(/data-reader-mode=/g) || []).length;
  if (modeControls !== 2) errors.push(`${file}: expected article/card controls, found ${modeControls}`);
  if (!html.includes('src="material.js"')) errors.push(`${file}: material.js is not loaded`);
}

const materialScript = fs.readFileSync(path.join(root, "material.js"), "utf8");
if (!materialScript.includes("matchMedia") || !materialScript.includes("5dai-reader-mode")) {
  errors.push("material.js: automatic or persistent reader mode is missing");
}
if (!materialScript.includes("card-lightbox") || !materialScript.includes("touchstart") || !materialScript.includes("touchend")) {
  errors.push("material.js: mobile card zoom or swipe navigation is missing");
}
if (!materialScript.includes("IntersectionObserver") || !materialScript.includes("markPodcastSection")) {
  errors.push("material.js: automatic Podcast reading progress is missing");
}
if (materialScript.includes("mark-material-done")) errors.push("material.js: obsolete manual Podcast completion is still present");
if (!materialScript.includes("isPodcastIntro") || !materialScript.includes("isPodcastEnding")) {
  errors.push("material.js: Podcast cover/ending exclusion from CHAPTERS is missing");
}

const firebaseSync = fs.readFileSync(path.join(root, "firebase-sync.js"), "utf8");
for (const feature of ["dai-learning-quest", "signInWithPopup", "getDoc", "setDoc", "5dai-cloud-loaded"]) {
  if (!firebaseSync.includes(feature)) errors.push(`firebase-sync.js: missing sync feature ${feature}`);
}

const dayOne = fs.readFileSync(path.join(root, "day1.html"), "utf8");
if (!dayOne.includes("day-material-grid")) errors.push("day1.html: materials are not promoted to the top section");
if (/<textarea|REFLECTION LOG|學習筆記/i.test(dayOne)) errors.push("day1.html: obsolete notes UI is still present");
if (!dayOne.includes('src="day1.js"')) errors.push("day1.html: collapsible progress dashboard is not loaded");
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (/核心教材導讀|核心教材|CORE READING/.test(html)) errors.push(`${file}: Whitepaper uses an obsolete invented label`);
}
const dayOneScript = fs.readFileSync(path.join(root, "day1.js"), "utf8");
if (!dayOneScript.includes('["assignment", "podcast", "whitepaper"]') || !dayOneScript.includes("reading-progress")) {
  errors.push("day1.js: required material order or reading progress panels are missing");
}

for (const file of ["index.html", "day1.html", "day2.html", "day3.html", "day4.html", "day5.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const day of [1, 2, 3, 4, 5]) {
    if (!html.includes(`href="day${day}.html"`)) errors.push(`${file}: global navigation is missing Day ${day}`);
  }
}

const whitepaper = fs.readFileSync(path.join(root, "whitepaper.html"), "utf8");
const slideCount = (whitepaper.match(/\{k:'/g) || []).length;
if (slideCount !== 32) errors.push(`whitepaper.html: expected 32 slides, found ${slideCount}`);
for (const control of ['id="first"', 'id="page-number"', 'id="last"', "PageDown", "touchend", "wheel"]) {
  if (!whitepaper.includes(control)) errors.push(`whitepaper.html: missing PDF-style navigation control ${control}`);
}
if (!whitepaper.includes('id="deck-progress"') || !whitepaper.includes("deckProgressBar.style.width")) {
  errors.push("whitepaper.html: visible reading progress bar is missing");
}
for (const image of ["evolution-timeline.jpg", "agent-loop.jpg", "spectrum-table.jpg", "vibe-spectrum.jpg", "context-architecture.jpg", "new-sdlc.jpg", "factory-model.jpg", "harness-model.jpg", "developer-modes.jpg", "economics.jpg"]) {
  if (!fs.existsSync(path.join(root, "assets", "whitepaper", image))) errors.push(`Missing whitepaper diagram: ${image}`);
}
for (const caption of ["Figure 1:", "Figure 2:", "Table 1:", "Figure 3:", "Figure 4:", "Figure 5:", "Figure 6:", "Figure 7:", "Figure 8:", "Figure 9:"]) {
  if (!whitepaper.includes(caption)) errors.push(`whitepaper.html: missing original PDF caption ${caption}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Site validation passed: ${htmlFiles.length} pages, ${slideCount} whitepaper slides.`);
