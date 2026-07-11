(function () {
  const KEY = "5dai-learning-quest-v3";
  const blank = () => ({ version: 4, done: {}, notes: "", whitepaperSlide: 0, whitepaperOpened: false, podcastSections: {} });
  const parse = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  };
  const state = Object.assign(blank(), parse(localStorage.getItem(KEY), {}));
  state.podcastSections = state.podcastSections || {};
  state.whitepaperOpened = Boolean(state.whitepaperOpened || state.whitepaperSlide > 0);

  if (!localStorage.getItem(KEY)) {
    const oldDashboard = parse(localStorage.getItem("5dai-learning-quest-day-1"), {});
    const oldDay = parse(localStorage.getItem("5dai-day1-v2"), {});
    const legacyTitles = {
      "語法的消亡：從打字到描述意圖": "podcast-syntax",
      "兩種流派：Vibe Coding 與 Agentic Engineering": "podcast-spectrum",
      "上下文工程與 Context rot": "podcast-context",
      "生命週期巨變與模型只佔 10%": "podcast-lifecycle",
      "指揮家、80% 問題與代幣經濟學": "podcast-orchestration",
      "完成 Unit 1 Podcast 收聽": "assignment-podcast",
      "完成 Day 1 白皮書閱讀": "assignment-whitepaper",
      "完成 Kaggle Codelabs：Antigravity": "assignment-antigravity",
      "用 Google AI Studio / Cloud Run 完成一個實作": "assignment-cloud-run"
    };
    Object.assign(state.done, oldDashboard.done || {});
    Object.entries(oldDay).forEach(([title, value]) => {
      if (value && legacyTitles[title]) state.done[legacyTitles[title]] = true;
    });
    state.notes = oldDashboard.notes || localStorage.getItem("5dai-day1-notes") || "";
    state.whitepaperSlide = Number(localStorage.getItem("5dai-whitepaper-slide")) || 0;
  }

  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("5dai-progress", { detail: snapshot() }));
  };
  const snapshot = () => JSON.parse(JSON.stringify(state));
  const tasks = () => window.CourseData?.tasks || [];
  const completed = () => tasks().filter(task => state.done[task.id]);
  const summary = () => {
    const all = tasks();
    const done = completed();
    const podcastCompleted = Object.values(state.podcastSections).filter(Boolean).length;
    const whitepaperCompleted = state.whitepaperOpened ? Math.min(32, state.whitepaperSlide + 1) : 0;
    const assignmentPercent = all.length ? done.length / all.length * 100 : 100;
    const podcastPercent = podcastCompleted / 10 * 100;
    const whitepaperPercent = whitepaperCompleted / 32 * 100;
    return {
      total: 3,
      completed: [assignmentPercent, podcastPercent, whitepaperPercent].filter(value => value === 100).length,
      percent: Math.round((assignmentPercent + podcastPercent + whitepaperPercent) / 3)
    };
  };
  const setDone = (id, value = true) => { state.done[id] = Boolean(value); save(); };
  const setNotes = value => { state.notes = value; save(); };
  const setWhitepaperSlide = index => {
    state.whitepaperSlide = Math.max(state.whitepaperSlide, Number(index) || 0);
    state.whitepaperOpened = true;
    save();
  };
  const markPodcastSection = index => {
    state.podcastSections[String(index)] = true;
    save();
  };
  const readingSummary = () => {
    const podcastCompleted = Object.values(state.podcastSections).filter(Boolean).length;
    const whitepaperCompleted = state.whitepaperOpened ? Math.min(32, state.whitepaperSlide + 1) : 0;
    return {
      podcast: { completed: podcastCompleted, total: 10, percent: Math.round(podcastCompleted / 10 * 100) },
      whitepaper: { completed: whitepaperCompleted, total: 32, percent: Math.round(whitepaperCompleted / 32 * 100) }
    };
  };
  const reset = () => { Object.assign(state, blank()); save(); };

  window.ProgressStore = { state, snapshot, summary, readingSummary, setDone, setNotes, setWhitepaperSlide, markPodcastSection, reset, save };
  save();
})();
