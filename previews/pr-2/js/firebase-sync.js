import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import {
  blankSyncState,
  captureLocalProgress,
  effectiveProgress,
  mergeSyncStates,
  normalizeSyncState
} from "./progress-sync-core.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFOXetaBHpooDxn5rk0WKxZmevnj8sZyo",
  authDomain: "dai-learning-quest.firebaseapp.com",
  projectId: "dai-learning-quest",
  storageBucket: "dai-learning-quest.firebasestorage.app",
  messagingSenderId: "469676957995",
  appId: "1:469676957995:web:b99b26e6c5924731ca656e"
};

const META_KEY = "5dai-cloud-progress-v2";
const DAY2_ASSIGNMENT_KEY = "5dai-assignment-day2-progress";
const DAY2_PODCAST_KEY = "5dai-podcast-day2-progress";
const DAY2_WHITEPAPER_KEY = "5dai-day2-whitepaper-slide";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let currentUser = null;
let applyingCloud = false;
let syncTimer = null;
let unsubscribeProgress = null;
let localRecords = loadMeta();
let pendingRecords = null;

const style = document.createElement("style");
style.textContent = `.sync-dock{display:flex;align-items:center;flex:0 0 auto;gap:7px;padding:5px 6px 5px 9px;border:1px solid #3a557dcc;border-radius:10px;background:#111f34;color:#dbe8f8;font:11px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif}.sync-dock.sync-floating{position:fixed;z-index:99998;right:10px;bottom:10px;box-shadow:0 10px 30px #0007}.sync-dock[data-state="synced"] .sync-status{color:#85e0b9}.sync-dock[data-state="error"] .sync-status{color:#ff9b91}.sync-dock button{border:0!important;border-radius:7px!important;padding:6px 8px!important;background:#263d5d!important;color:#eef4ff!important;font:600 11px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif!important;white-space:nowrap!important;cursor:pointer!important;transform:none!important}.sync-dock button:hover{background:#36547d!important}.nav>.sync-dock{margin-left:auto}@media(max-width:760px){.sync-dock{padding:4px 5px}.sync-status{max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.site-nav .sync-status,.nav>.sync-dock .sync-status{display:none}.nav>.sync-dock{margin-left:0}.sync-dock button{padding:6px!important}.sync-dock.sync-floating{right:8px;bottom:8px}}`;
document.head.append(style);

const dock = document.createElement("div");
dock.className = "sync-dock";
dock.dataset.state = "local";
dock.innerHTML = `<span class="sync-status">僅儲存在此裝置</span><button type="button">Google 登入同步</button>`;
const syncHost = document.querySelector(".site-nav, .reader-links, .nav");
if (syncHost) syncHost.append(dock);
else {
  dock.classList.add("sync-floating");
  document.body.append(dock);
}
const status = dock.querySelector(".sync-status");
const accountButton = dock.querySelector("button");

function parse(value, fallback = {}) {
  try { return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

function loadMeta() {
  return normalizeSyncState(parse(localStorage.getItem(META_KEY), blankSyncState()));
}

function saveMeta(value) {
  localStorage.setItem(META_KEY, JSON.stringify(normalizeSyncState(value)));
}

function readLocalProgress() {
  return {
    day1: {
      assignments: { ...(window.ProgressStore?.state?.done || {}) },
      assignmentSections: { ...(window.ProgressStore?.state?.assignmentSections || {}) },
      podcastSections: { ...(window.ProgressStore?.state?.podcastSections || {}) },
      whitepaper: {
        slide: Number(window.ProgressStore?.state?.whitepaperSlide) || 0,
        opened: Boolean(window.ProgressStore?.state?.whitepaperOpened)
      }
    },
    day2: {
      assignments: {},
      assignmentSections: parse(localStorage.getItem(DAY2_ASSIGNMENT_KEY)),
      podcastSections: parse(localStorage.getItem(DAY2_PODCAST_KEY)),
      whitepaper: {
        slide: Number(localStorage.getItem(DAY2_WHITEPAPER_KEY)) || 0,
        opened: Number(localStorage.getItem(DAY2_WHITEPAPER_KEY)) > 0
      }
    }
  };
}

function setStatus(text, state = "local") {
  status.textContent = text;
  dock.dataset.state = state;
}

function progressRef(user) {
  return doc(db, "users", user.uid, "progress", "day1");
}

function applySyncedProgress(value) {
  const normalized = normalizeSyncState(value);
  const progress = effectiveProgress(normalized);
  applyingCloud = true;
  try {
    localRecords = normalized;
    saveMeta(localRecords);

    if (window.ProgressStore) {
      const assignmentIds = new Set([
        ...Object.keys(window.ProgressStore.state.done || {}),
        ...Object.keys(progress.day1.assignments),
        ...(window.CourseData?.tasks || []).filter(task => task.group === "assignment").map(task => task.id)
      ]);
      assignmentIds.forEach(id => {
        window.ProgressStore.state.done[id] = Boolean(progress.day1.assignments[id]);
      });
      window.ProgressStore.state.assignmentSections = { ...progress.day1.assignmentSections };
      window.ProgressStore.state.podcastSections = { ...progress.day1.podcastSections };
      window.ProgressStore.state.whitepaperSlide = progress.day1.whitepaper.slide;
      window.ProgressStore.state.whitepaperOpened = progress.day1.whitepaper.opened;
      window.ProgressStore.save();
    }

    localStorage.setItem(DAY2_ASSIGNMENT_KEY, JSON.stringify(progress.day2.assignmentSections));
    localStorage.setItem(DAY2_PODCAST_KEY, JSON.stringify(progress.day2.podcastSections));
    localStorage.setItem(DAY2_WHITEPAPER_KEY, String(progress.day2.whitepaper.slide));
    window.dispatchEvent(new CustomEvent("5dai-cloud-loaded", { detail: progress }));
  } finally {
    applyingCloud = false;
  }
}

function capturePendingProgress() {
  localRecords = captureLocalProgress(localRecords, readLocalProgress(), Date.now());
  pendingRecords = pendingRecords ? mergeSyncStates(pendingRecords, localRecords) : localRecords;
  saveMeta(localRecords);
}

async function pushProgress() {
  if (!currentUser || applyingCloud || !pendingRecords) return;
  const pending = pendingRecords;
  pendingRecords = null;
  setStatus("正在同步…", "syncing");
  try {
    const merged = await runTransaction(db, async transaction => {
      const reference = progressRef(currentUser);
      const snapshot = await transaction.get(reference);
      const result = mergeSyncStates(snapshot.exists() ? snapshot.data() : blankSyncState(), pending);
      transaction.set(reference, { ...result, updatedAt: serverTimestamp() });
      return result;
    });
    applySyncedProgress(merged);
    setStatus(`已同步 ${currentUser.email || "Google"}`, "synced");
  } catch (error) {
    pendingRecords = pendingRecords ? mergeSyncStates(pendingRecords, pending) : pending;
    console.error("Firebase progress sync failed", error);
    setStatus("同步失敗，將自動重試", "error");
    dock.title = error.message;
  }
}

function schedulePush() {
  if (!currentUser || applyingCloud) return;
  capturePendingProgress();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushProgress, 350);
}

async function connectProgress(user) {
  setStatus("正在合併裝置進度…", "syncing");
  capturePendingProgress();
  await pushProgress();
  unsubscribeProgress?.();
  unsubscribeProgress = onSnapshot(progressRef(user), snapshot => {
    if (!snapshot.exists()) return;
    const incoming = normalizeSyncState(snapshot.data());
    applySyncedProgress(pendingRecords ? mergeSyncStates(incoming, pendingRecords) : incoming);
    setStatus(`已同步 ${user.email || "Google"}`, "synced");
  }, error => {
    console.error("Firebase live progress sync failed", error);
    setStatus("即時同步中斷，將自動重試", "error");
    dock.title = error.message;
  });
}

accountButton.addEventListener("click", async () => {
  accountButton.disabled = true;
  try {
    if (currentUser) await signOut(auth);
    else await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Firebase authentication failed", error);
    setStatus(error.code === "auth/unauthorized-domain" ? "網域尚未授權" : "登入失敗", "error");
    dock.title = error.message;
  } finally {
    accountButton.disabled = false;
  }
});

window.addEventListener("5dai-progress", schedulePush);
window.addEventListener("online", () => {
  if (pendingRecords) pushProgress();
});

try {
  await setPersistence(auth, browserLocalPersistence);
  onAuthStateChanged(auth, async user => {
    currentUser = user;
    clearTimeout(syncTimer);
    unsubscribeProgress?.();
    unsubscribeProgress = null;
    if (!user) {
      pendingRecords = null;
      setStatus("僅儲存在此裝置", "local");
      accountButton.textContent = "Google 登入同步";
      return;
    }
    accountButton.textContent = "登出";
    try {
      await connectProgress(user);
    } catch (error) {
      console.error("Firebase progress connection failed", error);
      setStatus("無法連接雲端進度", "error");
      dock.title = error.message;
    }
  });
} catch (error) {
  console.error("Firebase initialization failed", error);
  setStatus("Firebase 初始化失敗", "error");
  dock.title = error.message;
}
