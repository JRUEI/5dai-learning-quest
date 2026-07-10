(function () {
  const material = document.body.dataset.material;
  const modeKey = "5dai-reader-mode";
  const cards = [...document.querySelectorAll(".card-wrapper")];
  const storedMode = localStorage.getItem(modeKey);
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  function cleanClone(node) {
    const clone = node.cloneNode(true);
    clone.removeAttribute("style");
    clone.removeAttribute("class");
    clone.querySelectorAll("*").forEach(element => {
      element.removeAttribute("style");
      element.removeAttribute("class");
      element.removeAttribute("id");
    });
    return clone;
  }

  function sectionTitle(card, index) {
    const heading = card.querySelector("h1, h2");
    if (heading) return heading.textContent.replace(/\s+/g, " ").trim();
    return index === cards.length - 1 ? "結語" : `段落 ${index + 1}`;
  }

  function buildArticleView() {
    const view = document.createElement("main");
    view.className = "article-view";
    const toc = document.createElement("nav");
    toc.className = "article-toc";
    toc.setAttribute("aria-label", "文章章節");
    toc.innerHTML = "<strong>CHAPTERS</strong>";
    const content = document.createElement("div");
    content.className = "article-content";
    const title = material === "podcast" ? "軟體開發的典範轉移" : "Day 1 Assignment";
    const subtitle = material === "podcast" ? "Podcast 完整文章版 · 10 個主題" : "Unit 1 完整文章版 · 6 個段落";
    content.innerHTML = `<header class="article-intro"><span class="kicker">DAY 1 · ${material.toUpperCase()}</span><h1>${title}</h1><p>${subtitle}。內容與圖卡版相同，僅改變閱讀排版。</p></header>`;

    cards.forEach((wrapper, index) => {
      const card = wrapper.querySelector('[id^="card-"]');
      if (!card) return;
      const id = `${material}-section-${index + 1}`;
      const titleText = sectionTitle(card, index);
      const section = document.createElement("section");
      section.className = "article-section";
      section.id = id;
      section.innerHTML = `<span class="section-number">${String(index + 1).padStart(2, "0")}</span><h2>${titleText}</h2>`;
      const paragraphs = [...card.querySelectorAll("p")].filter(paragraph => {
        if (paragraph.classList.contains("nowrap")) return false;
        if (paragraph.closest('[style*="border-top"]')) return false;
        return paragraph.textContent.trim().length > 0;
      });
      paragraphs.forEach(paragraph => section.append(cleanClone(paragraph)));
      content.append(section);
      const link = document.createElement("a");
      link.href = `#${id}`;
      link.textContent = `${String(index + 1).padStart(2, "0")} ${titleText}`;
      toc.append(link);
    });
    view.append(toc, content);
    document.querySelector(".toolbar").insertAdjacentElement("afterend", view);
  }

  function scaleCards() {
    if (!document.body.classList.contains("mode-card")) return;
    cards.forEach(wrapper => {
      wrapper.style.setProperty("--card-scale", String(wrapper.clientWidth / 1080));
    });
  }

  function setMode(mode, persist) {
    document.body.classList.toggle("mode-card", mode === "card");
    document.body.classList.toggle("mode-article", mode === "article");
    document.querySelectorAll("[data-reader-mode]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.readerMode === mode));
    });
    if (persist) localStorage.setItem(modeKey, mode);
    requestAnimationFrame(scaleCards);
  }

  buildArticleView();
  document.querySelectorAll("[data-reader-mode]").forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.readerMode, true));
  });
  const initialMode = storedMode === "card" || storedMode === "article"
    ? storedMode
    : (mobileQuery.matches ? "card" : "article");
  setMode(initialMode, false);
  window.addEventListener("resize", scaleCards);
  mobileQuery.addEventListener?.("change", event => {
    if (!localStorage.getItem(modeKey)) setMode(event.matches ? "card" : "article", false);
  });

  const completeButton = document.querySelector("#mark-material-done");
  if (completeButton && material === "podcast") {
    const ids = CourseData.tasks.filter(task => task.group === "podcast").map(task => task.id);
    const renderComplete = () => {
      const done = ids.every(id => ProgressStore.state.done[id]);
      completeButton.textContent = done ? "Podcast 已完成 ✓" : "標記 Podcast 已完成";
      completeButton.classList.toggle("done", done);
    };
    completeButton.addEventListener("click", () => {
      ids.forEach(id => { ProgressStore.state.done[id] = true; });
      ProgressStore.state.done["assignment-podcast"] = true;
      ProgressStore.save();
      renderComplete();
    });
    renderComplete();
  }
})();
