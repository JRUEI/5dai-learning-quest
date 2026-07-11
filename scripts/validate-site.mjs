import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const htmlFiles = [
  "index.html",
  "days/day1/index.html", "days/day1/podcast.html", "days/day1/assignment.html", "days/day1/whitepaper.html",
  "days/day2/index.html", "days/day2/podcast.html", "days/day2/assignment.html", "days/day2/whitepaper.html",
  "days/day3/index.html", "days/day4/index.html", "days/day5/index.html"
];
const templateFiles = ["templates/home-database-template.html", "templates/day-database-template.html"];
const jsFiles = ["js/course-data.js", "js/progress.js", "js/material.js", "js/day1.js", "js/home.js"];
const errors = [];

for (const file of [".github/workflows/publish-previews.yml", "scripts/update-pages-content.mjs", "docs/WORKFLOW.md"]) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing preview workflow file: ${file}`);
}

for (const file of [...htmlFiles, ...jsFiles, "js/firebase-sync.js", "js/progress-sync-core.js", "css/site.css", "css/reader.css"]) {
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
    if (clean && !fs.existsSync(path.resolve(path.dirname(fullPath), clean))) errors.push(`${file}: broken local reference ${target}`);
  }
  if (!/type="module" src="[^"]*firebase-sync\.js"/.test(html)) errors.push(`${file}: Firebase sync module is not loaded`);
}

for (const file of templateFiles) {
  const fullPath = path.join(root, file);
  const html = fs.readFileSync(fullPath, "utf8");
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|#|data:|mailto:)/.test(target) || target.includes("${")) continue;
    const clean = target.split(/[?#]/)[0];
    if (clean && !fs.existsSync(path.resolve(path.dirname(fullPath), clean))) errors.push(`${file}: broken local reference ${target}`);
  }
}

for (const file of jsFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  try { new vm.Script(fs.readFileSync(fullPath, "utf8"), { filename: file }); }
  catch (error) { errors.push(`${file}: ${error.message}`); }
}

for (const file of ["days/day1/podcast.html", "days/day2/podcast.html", "days/day1/assignment.html", "days/day2/assignment.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const modeControls = (html.match(/data-reader-mode=/g) || []).length;
  if (modeControls !== 2) errors.push(`${file}: expected article/card controls, found ${modeControls}`);
  if (!/src="[^"]*material\.js"/.test(html)) errors.push(`${file}: material.js is not loaded`);
}

const materialScript = fs.readFileSync(path.join(root, "js/material.js"), "utf8");
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
if (
  !materialScript.includes("const isIntro = index === 0") ||
  !materialScript.includes("const isEnding = index === cards.length - 1") ||
  !materialScript.includes("if (isIntro || isEnding) return")
) {
  errors.push("material.js: Podcast cover/ending exclusion from CHAPTERS is missing");
}

const firebaseSync = fs.readFileSync(path.join(root, "js/firebase-sync.js"), "utf8");
for (const feature of ["dai-learning-quest", "signInWithPopup", "runTransaction", "onSnapshot", "captureLocalProgress", "5dai-cloud-loaded"]) {
  if (!firebaseSync.includes(feature)) errors.push(`firebase-sync.js: missing sync feature ${feature}`);
}
if (!firebaseSync.includes('from "./progress-sync-core.js"')) {
  errors.push("firebase-sync.js: shared cross-device merge core is not loaded");
}
if (!materialScript.includes('detail: { day: 2, material, section: sectionNumber }')) {
  errors.push("material.js: Day 2 reading changes do not notify cloud sync");
}

const syncCore = await import(pathToFileURL(path.join(root, "js/progress-sync-core.js")));
const emptyLocal = () => ({
  day1: { assignments: {}, assignmentSections: {}, podcastSections: {}, whitepaper: { slide: 0, opened: false } },
  day2: { assignments: {}, assignmentSections: {}, podcastSections: {}, whitepaper: { slide: 0, opened: false } }
});
const deviceALocal = emptyLocal();
deviceALocal.day1.assignmentSections["1"] = true;
deviceALocal.day1.whitepaper = { slide: 4, opened: true };
deviceALocal.day2.podcastSections["1"] = true;
const deviceA = syncCore.captureLocalProgress(syncCore.blankSyncState(), deviceALocal, 100);
const deviceBLocal = emptyLocal();
deviceBLocal.day1.podcastSections["2"] = true;
deviceBLocal.day2.assignmentSections["3"] = true;
deviceBLocal.day2.whitepaper = { slide: 7, opened: true };
const deviceB = syncCore.captureLocalProgress(syncCore.blankSyncState(), deviceBLocal, 200);
const mergedProgress = syncCore.effectiveProgress(syncCore.mergeSyncStates(deviceA, deviceB));
if (!mergedProgress.day1.assignmentSections["1"] || !mergedProgress.day1.podcastSections["2"] ||
    !mergedProgress.day2.podcastSections["1"] || !mergedProgress.day2.assignmentSections["3"] ||
    mergedProgress.day2.whitepaper.slide !== 7) {
  errors.push("progress-sync-core.js: independent device progress does not merge correctly");
}
const resetProgress = syncCore.captureLocalProgress(syncCore.mergeSyncStates(deviceA, deviceB), emptyLocal(), 300);
const staleMerge = syncCore.effectiveProgress(syncCore.mergeSyncStates(resetProgress, deviceA));
if (Object.keys(staleMerge.day1.assignmentSections).length || Object.keys(staleMerge.day2.podcastSections).length ||
    staleMerge.day1.whitepaper.opened || staleMerge.day2.whitepaper.opened) {
  errors.push("progress-sync-core.js: reset progress is resurrected by an older device snapshot");
}
const checkedLocal = emptyLocal();
checkedLocal.day1.assignments["assignment-cloud-run"] = true;
const checked = syncCore.captureLocalProgress(syncCore.blankSyncState(), checkedLocal, 400);
const uncheckedLocal = emptyLocal();
uncheckedLocal.day1.assignments["assignment-cloud-run"] = false;
const unchecked = syncCore.captureLocalProgress(checked, uncheckedLocal, 500);
if (syncCore.effectiveProgress(syncCore.mergeSyncStates(checked, unchecked)).day1.assignments["assignment-cloud-run"]) {
  errors.push("progress-sync-core.js: latest manual Assignment checkbox value does not win");
}
const legacy = syncCore.effectiveProgress(syncCore.normalizeSyncState({
  assignments: { "assignment-cloud-run": true },
  podcastSections: { "1": true },
  whitepaperSlide: 6,
  whitepaperOpened: true
}));
if (!legacy.day1.assignments["assignment-cloud-run"] || !legacy.day1.podcastSections["1"] || legacy.day1.whitepaper.slide !== 6) {
  errors.push("progress-sync-core.js: legacy Day 1 cloud progress migration failed");
}
const dayTwoWhitepaper = fs.readFileSync(path.join(root, "days/day2/whitepaper.html"), "utf8");
if (!dayTwoWhitepaper.includes("5dai-progress")) errors.push("days/day2/whitepaper.html: Day 2 Whitepaper does not publish cloud progress");
if (/5dai-cloud-loaded[\s\S]{0,120}\bgo\s*\(/.test(dayTwoWhitepaper)) errors.push("days/day2/whitepaper.html: cloud sync still forces visible page navigation");
if (/location\.hash[\s\S]{0,120}localStorage\.getItem\('5dai-day2-whitepaper-slide'\)/.test(dayTwoWhitepaper)) errors.push("days/day2/whitepaper.html: saved progress still overrides the opening page");
if (!dayTwoWhitepaper.includes("{passive:false}")) errors.push("days/day2/whitepaper.html: desktop wheel navigation does not prevent document scrolling");

const dayOne = fs.readFileSync(path.join(root, "days/day1/index.html"), "utf8");
if (!dayOne.includes("day-material-grid")) errors.push("day1.html: materials are not promoted to the top section");
if (/<textarea|REFLECTION LOG|學習筆記/i.test(dayOne)) errors.push("day1.html: obsolete notes UI is still present");
if (!/src="[^"]*day1\.js(?:\?[^"]*)?"/.test(dayOne)) errors.push("days/day1/index.html: collapsible progress dashboard is not loaded");
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (/核心教材導讀|核心教材|CORE READING/.test(html)) errors.push(`${file}: Whitepaper uses an obsolete invented label`);
}
const dayOneScript = fs.readFileSync(path.join(root, "js/day1.js"), "utf8");
if (!dayOneScript.includes('["assignment", "podcast", "whitepaper"]') || !dayOneScript.includes("reading-progress")) {
  errors.push("day1.js: required material order or reading progress panels are missing");
}
if (!dayOneScript.includes('input.checked = Boolean(ProgressStore.state.done[input.dataset.id])')) {
  errors.push("day1.js: cloud Assignment checkbox changes are not reflected in the dashboard");
}

const previewWorkflow = fs.readFileSync(path.join(root, ".github/workflows/publish-previews.yml"), "utf8");
for (const feature of ["pull_request:", "gh-pages", "update-pages-content.mjs", "upload-pages-artifact", "deploy-pages"]) {
  if (!previewWorkflow.includes(feature)) errors.push(`publish-previews.yml: missing preview feature ${feature}`);
}

for (const file of ["index.html", "days/day1/index.html", "days/day2/index.html", "days/day3/index.html", "days/day4/index.html", "days/day5/index.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const day of [1, 2, 3, 4, 5]) {
    const expected = file === "index.html" ? `href="days/day${day}/index.html"` : `href="../day${day}/index.html"`;
    if (!html.includes(expected)) errors.push(`${file}: global navigation is missing Day ${day}`);
  }
}

const whitepaper = fs.readFileSync(path.join(root, "days/day1/whitepaper.html"), "utf8");
const slideCount = (whitepaper.match(/\{k:'/g) || []).length;
if (slideCount !== 32) errors.push(`whitepaper.html: expected 32 slides, found ${slideCount}`);
for (const control of ['id="first"', 'id="page-number"', 'id="last"', "PageDown", "touchend", "wheel"]) {
  if (!whitepaper.includes(control)) errors.push(`whitepaper.html: missing PDF-style navigation control ${control}`);
}
if (!whitepaper.includes('id="deck-progress"') || !whitepaper.includes("deckProgressBar.style.width")) {
  errors.push("whitepaper.html: visible reading progress bar is missing");
}
if (/5dai-cloud-loaded[\s\S]{0,120}\bgoTo\s*\(/.test(whitepaper) || whitepaper.includes("ProgressStore.state.whitepaperSlide+1")) {
  errors.push("whitepaper.html: saved or cloud progress still forces visible page navigation");
}
if (!whitepaper.includes("{passive:false}")) errors.push("whitepaper.html: desktop wheel navigation does not prevent document scrolling");
for (const file of ["days/day1/whitepaper.html", "days/day2/whitepaper.html"]) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (/page\.textContent=`PAGE|page-number">PAGE/.test(html)) errors.push(`${file}: page number still uses a PAGE prefix`);
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
