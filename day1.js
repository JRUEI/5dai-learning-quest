(() => {
  const root = document.querySelector("#tasks");
  const OPEN_KEY = "5dai-checklist-open-groups";
  const groupOrder = ["assignment", "podcast", "whitepaper"];
  const savedOpen = (() => {
    try { return JSON.parse(localStorage.getItem(OPEN_KEY) || "null"); }
    catch { return null; }
  })();
  const panels = new Map();

  const saveOpenGroups = () => {
    const state = {};
    panels.forEach((panel, groupId) => { state[groupId] = panel.open; });
    localStorage.setItem(OPEN_KEY, JSON.stringify(state));
  };

  const panelShell = (groupId, index) => {
    const group = CourseData.groups[groupId];
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

  const buildAssignment = panel => {
    CourseData.tasks.filter(task => task.group === "assignment").forEach(task => {
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

  const buildReadingPanel = (panel, groupId, href, action) => {
    const card = document.createElement("div");
    card.className = "reading-progress";
    card.innerHTML = `<div><strong class="reading-status"></strong><div class="reading-bar"><i></i></div><small>瀏覽到教材段落時自動記錄，不需要手動打勾。</small></div><a href="${href}">${action} →</a>`;
    panel.append(card);
  };

  groupOrder.forEach((groupId, index) => {
    const panel = panelShell(groupId, index);
    if (groupId === "assignment") buildAssignment(panel);
    if (groupId === "podcast") buildReadingPanel(panel, groupId, "podcast.html", "繼續閱讀 Podcast");
    if (groupId === "whitepaper") buildReadingPanel(panel, groupId, "whitepaper.html", "繼續閱讀白皮書");
  });

  function renderReading(groupId, data) {
    const panel = panels.get(groupId);
    panel.querySelector(".reading-status").textContent = `已閱讀 ${data.completed} / ${data.total}`;
    panel.querySelector(".reading-bar i").style.width = `${data.percent}%`;
    setPanelProgress(groupId, data.completed, data.total);
  }

  function renderDashboard() {
    const assignments = CourseData.tasks.filter(task => task.group === "assignment");
    const assignmentDone = assignments.filter(task => ProgressStore.state.done[task.id]).length;
    const reading = ProgressStore.readingSummary();
    const assignmentPercent = assignments.length ? assignmentDone / assignments.length * 100 : 100;
    const overall = Math.round((assignmentPercent + reading.podcast.percent + reading.whitepaper.percent) / 3);

    setPanelProgress("assignment", assignmentDone, assignments.length);
    renderReading("podcast", reading.podcast);
    renderReading("whitepaper", reading.whitepaper);
    document.querySelector("#progress").textContent = `${overall}%`;
    document.querySelector("#progress-bar").style.width = `${overall}%`;
    document.querySelector("#count").textContent = `${assignmentDone} / ${assignments.length}`;
    document.querySelector("#remaining").textContent = `${assignments.length - assignmentDone}`;
  }

  document.querySelector("#reset").addEventListener("click", () => {
    if (confirm("確定清除 Day 1 的完成狀態與閱讀進度？")) {
      ProgressStore.reset();
      location.reload();
    }
  });
  window.addEventListener("5dai-progress", renderDashboard);
  renderDashboard();
})();
