window.CourseData = {
  day: 1,
  title: "Vibe Coding 與 Agentic Engineering",
  tasks: [
    { id: "assignment-antigravity", group: "assignment", title: "完成 Kaggle Codelabs：Antigravity" },
    { id: "assignment-cloud-run", group: "assignment", title: "用 Google AI Studio / Cloud Run 完成實作" }
  ],
  groups: {
    assignment: { label: "Assignment", description: "只保留需要實際完成的 Codelab 與部署實作。" },
    podcast: { label: "Podcast", description: "自動記錄十個主題的實際閱讀進度。" },
      whitepaper: { label: "核心教材導讀", description: "自動記錄 32 頁圖解教材的閱讀進度。" }
  }
};
