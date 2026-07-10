window.CourseData = {
  day: 1,
  title: "Vibe Coding 與 Agentic Engineering",
  tasks: [
    { id: "podcast-syntax", group: "podcast", title: "語法的消亡：從打字到描述意圖", xp: 8 },
    { id: "podcast-spectrum", group: "podcast", title: "兩種流派：Vibe Coding 與 Agentic Engineering", xp: 8 },
    { id: "podcast-context", group: "podcast", title: "上下文工程與 Context rot", xp: 8 },
    { id: "podcast-lifecycle", group: "podcast", title: "生命週期巨變與模型只佔 10%", xp: 8 },
    { id: "podcast-orchestration", group: "podcast", title: "指揮家、80% 問題與代幣經濟學", xp: 8 },
    { id: "whitepaper-01-06", group: "whitepaper", title: "閱讀 01-06：Agents 與 Vibe Coding 光譜", xp: 12 },
    { id: "whitepaper-07-12", group: "whitepaper", title: "閱讀 07-12：Tests、Context 與 Agent Skills", xp: 12 },
    { id: "whitepaper-13-18", group: "whitepaper", title: "閱讀 13-18：新 SDLC、品質與部署", xp: 12 },
    { id: "whitepaper-19-24", group: "whitepaper", title: "閱讀 19-24：維護、Factory 與 Harness", xp: 12 },
    { id: "whitepaper-25-30", group: "whitepaper", title: "閱讀 25-30：Orchestrator、經濟學與行動", xp: 12 },
    { id: "assignment-podcast", group: "assignment", title: "完成 Unit 1 Podcast 收聽", xp: 15 },
    { id: "assignment-whitepaper", group: "assignment", title: "完成 Day 1 白皮書閱讀", xp: 15 },
    { id: "assignment-antigravity", group: "assignment", title: "完成 Kaggle Codelabs：Antigravity", xp: 20 },
    { id: "assignment-cloud-run", group: "assignment", title: "用 Google AI Studio / Cloud Run 完成實作", xp: 25 }
  ],
  groups: {
    podcast: { label: "Podcast", description: "完整閱讀十個主題，理解軟體開發的典範轉移。" },
    whitepaper: { label: "Whitepaper", description: "以 30 頁圖解簡報閱讀 Day 1 正式教材。" },
    assignment: { label: "Assignment", description: "完成 Unit 1 的閱讀、Codelab 與部署任務。" }
  }
};
