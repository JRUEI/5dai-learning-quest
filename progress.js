(function () {
  const KEY = "5dai-learning-quest-v3";
  const blank = () => ({ version: 3, done: {}, notes: "", whitepaperSlide: 0 });
  const parse = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  };
  const state = Object.assign(blank(), parse(localStorage.getItem(KEY), {}));

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
    return {
      total: all.length,
      completed: done.length,
      percent: all.length ? Math.round(done.length / all.length * 100) : 0,
      xp: done.reduce((sum, task) => sum + task.xp, 0)
    };
  };
  const setDone = (id, value = true) => { state.done[id] = Boolean(value); save(); };
  const setNotes = value => { state.notes = value; save(); };
  const setWhitepaperSlide = index => {
    state.whitepaperSlide = Math.max(state.whitepaperSlide, Number(index) || 0);
    const ranges = [6, 12, 18, 24, 31];
    const ids = ["whitepaper-01-06", "whitepaper-07-12", "whitepaper-13-18", "whitepaper-19-24", "whitepaper-25-30"];
    ranges.forEach((end, i) => { if (state.whitepaperSlide >= end) state.done[ids[i]] = true; });
    if (state.whitepaperSlide >= 31) state.done["assignment-whitepaper"] = true;
    save();
  };
  const reset = () => { Object.assign(state, blank()); save(); };

  window.ProgressStore = { state, snapshot, summary, setDone, setNotes, setWhitepaperSlide, reset, save };
  save();
})();
