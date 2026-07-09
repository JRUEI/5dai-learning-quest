const STORAGE_KEY = "5dai-learning-quest-day-1";
const slides = [
  ["軟體開發的典範轉移", "Vibe coding 讓人能以自然語言驅動開發；重點從手寫每行語法，轉向清楚表達意圖與驗證成果。", "PARADIGM"],
  ["從語法到意圖", "開發者的價值不只在產生程式碼，而在拆解問題、定義需求、建立可驗證的交付標準。", "INTENT"],
  ["兩種工作流", "快速探索適合以 Vibe coding 展開；可靠的產品工程仍需明確規格、測試與審查。", "WORKFLOWS"],
  ["上下文工程", "模型需要正確的背景、限制與範例。好的上下文是代理能否持續做對事的基礎。", "CONTEXT"],
  ["代理化工程", "把任務拆成可交接的小步驟，讓代理負責執行、人類負責方向、判斷與品質把關。", "AGENTS"],
  ["新的 SDLC", "模型只是系統的一部分；流程、工具、評估與團隊知識，才共同決定可持續的開發能力。", "TAKEAWAY"]
];
const items = [
  {id:"podcast-syntax", title:"Podcast：語法的消亡", note:"理解從寫語法到描述意圖的轉變", type:"PODCAST", xp:8},
  {id:"podcast-context", title:"Podcast：上下文工程的崛起", note:"辨識高品質上下文對代理的影響", type:"PODCAST", xp:8},
  {id:"podcast-lifecycle", title:"Podcast：生命週期的巨變", note:"掌握代理化工程如何改變開發流程", type:"PODCAST", xp:8},
  {id:"podcast-orchestration", title:"Podcast：指揮家與編排者", note:"思考人類在代理工作流中的新角色", type:"PODCAST", xp:8},
  {id:"reading-whitepaper", title:"閱讀白皮書摘要", note:"完成 The New SDLC with Vibe Coding 的核心概念卡", type:"READING", xp:40},
  {id:"assignment-listen", title:"完成 Unit 1 Podcast 收聽", note:"回顧本單元 Podcast，標記仍需釐清的概念", type:"ASSIGNMENT", xp:15},
  {id:"assignment-read", title:"完成 Unit 1 白皮書閱讀", note:"閱讀正式教材並記錄至少一個實作啟發", type:"ASSIGNMENT", xp:15},
  {id:"assignment-codelab", title:"進行 Hands-On Codelab", note:"依課程頁面的 Codelab 指示動手實作", type:"ASSIGNMENT", xp:20}
];
items.push(
  {id:"podcast-spectrum", title:"Podcast：Vibe Coding 與代理化工程", note:"比較探索式開發與具備規格、測試、CI 的工程流程。", type:"PODCAST", xp:8},
  {id:"podcast-context-rot", title:"Podcast：上下文工程與上下文腐敗", note:"理解精準脈絡、動態載入與代理技能的重要性。", type:"PODCAST", xp:8},
  {id:"podcast-economics", title:"Podcast：Token 經濟與世代傳承", note:"思考 harness 的成本效益與初階工程師的學習缺口。", type:"PODCAST", xp:8},
  {id:"assignment-antigravity", title:"Codelab：Antigravity 2.0、IDE 與 CLI", note:"依 Kaggle Day 1 Codelab 練習 Vibe coding 的第一個應用。", type:"ASSIGNMENT", xp:20},
  {id:"assignment-cloud-run", title:"Codelab：以 Google AI Studio 部署 Cloud Run", note:"將 Vibe coded app 部署並分享。", type:"ASSIGNMENT", xp:20}
);
const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
state.done ||= {}; state.notes ||= ""; state.slide ||= 0; state.filter ||= "all";
const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const completed = () => items.filter(item => state.done[item.id]);
const progress = () => Math.round((completed().length / items.length) * 100);
function renderMap(){const p=progress();$("day-map").innerHTML=[1,2,3,4,5].map(day=>{const current=day===1;const locked=day>1&&p<100;return `<article class="day-card ${current?"current":""} ${locked?"locked":""}"><span class="day-number">DAY ${day}${locked?" · LOCKED":""}</span><strong>${day===1?"Vibe Coding":"Coming soon"}</strong><small>${day===1?`${p}% complete`:(locked?"完成前一日解鎖":"Ready")}</small><div class="card-progress"><i style="width:${day===1?p:locked?0:100}%"></i></div></article>`}).join("")}
function renderItems(){const tpl=$("item-template");const holder=$("learning-items");holder.innerHTML="";items.filter(i=>state.filter==="all"||i.type===state.filter).forEach(item=>{const node=tpl.content.cloneNode(true);const input=node.querySelector("input");input.checked=!!state.done[item.id];input.dataset.id=item.id;node.querySelector(".item-copy strong").textContent=item.title;node.querySelector(".item-copy small").textContent=item.note;node.querySelector(".type-tag").textContent=item.type;const status=node.querySelector(".status-tag");status.textContent=input.checked?"DONE":"TO DO";status.classList.toggle("done",input.checked);node.querySelector(".item-xp").textContent=`+${item.xp}`;holder.append(node)});holder.querySelectorAll("input").forEach(input=>input.addEventListener("change",()=>{state.done[input.dataset.id]=input.checked;save();render()}))}
function renderSlide(){const [title,copy,kicker]=slides[state.slide];$("slide-track").innerHTML=`<small>${kicker}</small><h4>${title}</h4><p>${copy}</p>`;$("slide-counter").textContent=`${state.slide+1} / ${slides.length}`}
function render(){const p=progress(), done=completed(), xp=done.reduce((sum,item)=>sum+item.xp,0)+(p===100?30:0);$("total-progress").textContent=`${p}%`;$("progress-orbit").style.background=`conic-gradient(var(--amber) ${p*3.6}deg,#304158 0deg)`;$("xp").textContent=xp;$("done-count").textContent=`${done.length} / ${items.length}`;$("day-percent").textContent=`${p}%`;$("side-progress").style.width=`${p}%`;$("side-progress-label").textContent=`${p}% COMPLETE`;$("day-status").textContent=p===100?"DAY 1 COMPLETE":p>0?"IN PROGRESS":"NOT STARTED";$("badge-count").textContent=p===100?"1":"0";$("badge-caption").textContent=p===100?"Unit 1 Explorer":"完成 Day 1 以解鎖";renderMap();renderItems();renderSlide()}
$("today").textContent=new Intl.DateTimeFormat("zh-TW",{month:"short",day:"numeric",weekday:"short"}).format(new Date());$("notes-input").value=state.notes;$("notes-input").addEventListener("input",e=>{state.notes=e.target.value;save()});$("prev-slide").addEventListener("click",()=>{state.slide=(state.slide-1+slides.length)%slides.length;save();renderSlide()});$("next-slide").addEventListener("click",()=>{state.slide=(state.slide+1)%slides.length;save();renderSlide()});$("filter-toggle").addEventListener("click",()=>{const order=["all","PODCAST","READING","ASSIGNMENT"];state.filter=order[(order.indexOf(state.filter)+1)%order.length];$("filter-toggle").textContent=`顯示：${state.filter==="all"?"全部":state.filter} ▾`;renderItems();save()});$("reset-progress").addEventListener("click",()=>{if(confirm("確定要清除 Day 1 的完成狀態與筆記嗎？")){localStorage.removeItem(STORAGE_KEY);location.reload()}});render();
