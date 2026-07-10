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
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFOXetaBHpooDxn5rk0WKxZmevnj8sZyo",
  authDomain: "dai-learning-quest.firebaseapp.com",
  projectId: "dai-learning-quest",
  storageBucket: "dai-learning-quest.firebasestorage.app",
  messagingSenderId: "469676957995",
  appId: "1:469676957995:web:b99b26e6c5924731ca656e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let currentUser = null;
let applyingCloud = false;
let syncTimer = null;

const style = document.createElement("style");
style.textContent = `.sync-dock{position:fixed;z-index:99998;top:10px;right:10px;display:flex;align-items:center;gap:8px;padding:7px 8px 7px 11px;border:1px solid #3a557dcc;border-radius:12px;background:#09111fee;color:#dbe8f8;box-shadow:0 10px 30px #0007;backdrop-filter:blur(12px);font:12px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif}.sync-dock[data-state="synced"] .sync-status{color:#85e0b9}.sync-dock[data-state="error"] .sync-status{color:#ff9b91}.sync-dock button{border:0!important;border-radius:8px!important;padding:7px 9px!important;background:#263d5d!important;color:#eef4ff!important;font:600 11px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif!important;cursor:pointer!important;transform:none!important}.sync-dock button:hover{background:#36547d!important}@media(max-width:760px){.sync-dock{top:auto;right:8px;bottom:8px;max-width:calc(100% - 16px)}.sync-status{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}`;
document.head.append(style);

const dock = document.createElement("div");
dock.className = "sync-dock";
dock.dataset.state = "local";
dock.innerHTML = `<span class="sync-status">僅儲存在本機</span><button type="button">Google 登入同步</button>`;
document.body.append(dock);
const status = dock.querySelector(".sync-status");
const accountButton = dock.querySelector("button");

function setStatus(text, state = "local") {
  status.textContent = text;
  dock.dataset.state = state;
}

function localPayload() {
  const assignments = {};
  (window.CourseData?.tasks || []).filter(task => task.group === "assignment").forEach(task => {
    assignments[task.id] = Boolean(ProgressStore.state.done[task.id]);
  });
  return {
    assignments,
    podcastSections: { ...ProgressStore.state.podcastSections },
    whitepaperSlide: Number(ProgressStore.state.whitepaperSlide) || 0,
    whitepaperOpened: Boolean(ProgressStore.state.whitepaperOpened),
    version: 1,
    updatedAt: serverTimestamp()
  };
}

function progressRef(user) {
  return doc(db, "users", user.uid, "progress", "day1");
}

async function pushProgress() {
  if (!currentUser || applyingCloud) return;
  setStatus("同步中…", "syncing");
  try {
    await setDoc(progressRef(currentUser), localPayload(), { merge: true });
    setStatus(`已同步 · ${currentUser.email || "Google"}`, "synced");
  } catch (error) {
    console.error("Firebase progress sync failed", error);
    setStatus("同步失敗，請檢查規則", "error");
    dock.title = error.message;
  }
}

function schedulePush() {
  if (!currentUser || applyingCloud) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(pushProgress, 500);
}

async function loadAndMerge(user) {
  setStatus("讀取雲端進度…", "syncing");
  try {
    const snapshot = await getDoc(progressRef(user));
    if (snapshot.exists()) {
      const cloud = snapshot.data();
      applyingCloud = true;
      Object.entries(cloud.assignments || {}).forEach(([id, value]) => {
        ProgressStore.state.done[id] = Boolean(value);
      });
      ProgressStore.state.podcastSections = {
        ...ProgressStore.state.podcastSections,
        ...(cloud.podcastSections || {})
      };
      ProgressStore.state.whitepaperSlide = Math.max(
        Number(ProgressStore.state.whitepaperSlide) || 0,
        Number(cloud.whitepaperSlide) || 0
      );
      ProgressStore.state.whitepaperOpened = Boolean(
        ProgressStore.state.whitepaperOpened || cloud.whitepaperOpened
      );
      ProgressStore.save();
      applyingCloud = false;
      window.dispatchEvent(new CustomEvent("5dai-cloud-loaded"));
    }
    await pushProgress();
  } catch (error) {
    applyingCloud = false;
    console.error("Firebase progress load failed", error);
    setStatus("無法讀取雲端進度", "error");
    dock.title = error.message;
  }
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
window.addEventListener("online", schedulePush);

try {
  await setPersistence(auth, browserLocalPersistence);
  onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (!user) {
      setStatus("僅儲存在本機", "local");
      accountButton.textContent = "Google 登入同步";
      return;
    }
    accountButton.textContent = "登出";
    await loadAndMerge(user);
  });
} catch (error) {
  console.error("Firebase initialization failed", error);
  setStatus("Firebase 初始化失敗", "error");
  dock.title = error.message;
}
