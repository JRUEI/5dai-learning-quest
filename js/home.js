(() => {
  function renderHomeProgress() {
    const summary = ProgressStore.summary();
    document.querySelector("#home-progress-bar").style.width = `${summary.percent}%`;
    document.querySelector("#home-progress-label").textContent = `${summary.percent}% COMPLETE`;
    document.querySelector("#home-task-count").textContent = `${summary.completed} / ${summary.total} completed`;
  }
  window.addEventListener("5dai-progress", renderHomeProgress);
  renderHomeProgress();
})();
