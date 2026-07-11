(() => {
  const root = document.querySelector("#tasks");
  const day = Number(document.body.dataset.day || window.CourseData?.day || 1);
  const OPEN_KEY = `5dai-day${day}-open-groups`;
  const groupOrder = ["assignment", "podcast", "whitepaper"];
  const hrefs = { assignment: "assignment.html", podcast: "podcast.html", whitepaper: "whitepaper.html" };
  const actions = { assignment: "繼續閱讀 Assignment", podcast: "繼續閱讀 Podcast", whitepaper: "繼續閱讀 Whitepaper" };
  const dayTwoGroups = {
    assignment: { label: "Assignment", description: "自動記錄 4 個內容 section；封面與結尾不計入閱讀進度。" },
    podcast: { label: "Podcast", description: "自動記錄 6 個主題；封面與結尾不計入閱讀進度。" },
    whitepaper: { label: "Whitepaper", description: "自動記錄 18 頁圖解內容的閱讀進度。" }
  };
  const savedOpen = (() => {
    try { return JSON.parse(localStorage.getItem(OPEN_KEY) || "null"); }
    catch { return null; }
  })();
  const panels = new Map();

  const readObjectProgress = key => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); }
    catch { return {}; }
  };
  const progressData = (completed, total) => ({
    completed,
    total,
    percent: total ? Math.round(completed / total * 100) : 0
  });
  const readingSummary = () => {
    if (day === 1) return ProgressStore.readingSummary();
    const assignment = Object.values(readObjectProgress("5dai-assignment-day2-progress")).filter(Boolean).length;
    const podcast = Object.values(readObjectProgress("5dai-podcast-day2-progress")).filter(Boolean).length;
    const whitepaper = Math.min(18, Number(localStorage.getItem("5dai-day2-whitepaper-slide")) || 0);
    return {
      assignment: progressData(assignment, 4),
      podcast: progressData(podcast, 6),
      whitepaper: progressData(whitepaper, 18)
    };
  };

  const saveOpenGroups = () => {
    const state = {};
    panels.forEach((panel, groupId) => { state[groupId] = panel.open; });
    localStorage.setItem(OPEN_KEY, JSON.stringify(state));
  };

  const panelShell = (groupId, index) => {
    const group = day === 1 ? CourseData.groups[groupId] : dayTwoGroups[groupId];
    const panel = document.createElement("details");
    panel.className = "task-group";
    panel.dataset.group = groupId;
    panel.open = savedOpen ? savedOpen[groupId] !== false : index === 0;
    panel.innerHTML = `<summary><span><b>${index + 1}. ${group.label}</b><small>${group.description}</small></span><span class="group-progress"><span class="group-count"></span><i></i></span></summary>`;
    panel.addEventListener("toggle", saveOpenGroups);
    panels.set(groupId, panel);
    root.append(panel);
    return panel;
  };

  const setPanelProgress = (groupId, completed, total) => {
    const panel = panels.get(groupId);
    const percent = total ? completed / total * 100 : 0;
    panel.querySelector(".group-count").textContent = `${completed} / ${total}`;
    panel.querySelector(".group-progress i").style.setProperty("--group-percent", `${percent}%`);
    panel.classList.toggle("complete", completed === total);
  };

  const buildReadingPanel = (panel, groupId) => {
    const card = document.createElement("div");
    card.className = "reading-progress";
    card.innerHTML = `<div><strong class="reading-status"></strong><div class="reading-bar"><i></i></div><small>瀏覽到教材段落時自動記錄，不需要手動打勾。</small></div><a href="${hrefs[groupId]}">${actions[groupId]} →</a>`;
    panel.append(card);
  };

  const buildDeliverables = panel => {
    const tasks = CourseData.tasks.filter(task => task.group === "assignment");
    if (!tasks.length) return;
    const heading = document.createElement("p");
    heading.className = "deliverable-heading";
    panel.append(heading);
    tasks.forEach(task => {
      const label = document.createElement("label");
      label.className = "task";
      label.innerHTML = `<input type="checkbox" data-id="${task.id}" ${ProgressStore.state.done[task.id] ? "checked" : ""}><span><b>${task.title}</b></span>`;
      label.querySelector("input").addEventListener("change", event => {
        ProgressStore.setDone(task.id, event.target.checked);
        renderDashboard();
      });
      panel.append(label);
    });
  };

  groupOrder.forEach((groupId, index) => {
    const panel = panelShell(groupId, index);
    buildReadingPanel(panel, groupId);
    if (day === 1 && groupId === "assignment") buildDeliverables(panel);
  });

  function renderReading(groupId, data) {
    const panel = panels.get(groupId);
    panel.querySelector(".reading-status").textContent = `已閱讀 ${data.completed} / ${data.total}`;
    panel.querySelector(".reading-bar i").style.width = `${data.percent}%`;
    setPanelProgress(groupId, data.completed, data.total);
    const card = document.querySelector(`[data-material-card="${groupId}"]`);
    if (card) {
      const unit = groupId === "podcast" ? "TOPICS" : groupId === "whitepaper" ? "PAGES" : "SECTIONS";
      card.querySelector(".material-progress-label").textContent = `${data.completed} / ${data.total} ${unit}`;
      card.querySelector(".material-progress-bar i").style.width = `${data.percent}%`;
      card.classList.toggle("complete", data.completed === data.total);
    }
  }

  function renderDashboard() {
    const reading = readingSummary();
    groupOrder.forEach(groupId => renderReading(groupId, reading[groupId]));
    const overall = Math.round(groupOrder.reduce((sum, groupId) => sum + reading[groupId].percent, 0) / groupOrder.length);
    document.querySelector("#progress").textContent = `${overall}%`;
    document.querySelector("#progress-bar").style.width = `${overall}%`;
    if (day === 1) {
      const tasks = CourseData.tasks.filter(task => task.group === "assignment");
      const done = tasks.filter(task => ProgressStore.state.done[task.id]).length;
      const heading = document.querySelector(".deliverable-heading");
      if (heading) heading.textContent = `實作驗收 ${done} / ${tasks.length}`;
    }
  }

  document.querySelector("#reset").addEventListener("click", () => {
    if (!confirm(`確定清除 Day ${day} 的完成狀態與閱讀進度？`)) return;
    if (day === 1) ProgressStore.reset();
    else {
      localStorage.removeItem("5dai-assignment-day2-progress");
      localStorage.removeItem("5dai-podcast-day2-progress");
      localStorage.removeItem("5dai-day2-whitepaper-slide");
    }
    location.reload();
  });
  window.addEventListener("5dai-progress", renderDashboard);
  window.addEventListener("pageshow", renderDashboard);
  renderDashboard();
})();
