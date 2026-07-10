(function () {
  const material = document.body.dataset.material;
  const modeKey = "5dai-reader-mode";
  const cards = [...document.querySelectorAll(".card-wrapper")];
  const storedMode = localStorage.getItem(modeKey);
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  let updatePodcastProgress = () => {};

  function markPodcastTopic(topicNumber) {
    if (material !== "podcast" || topicNumber < 1 || topicNumber > 10) return;
    if (!ProgressStore.state.podcastSections[String(topicNumber)]) {
      ProgressStore.markPodcastSection(topicNumber);
    }
    updatePodcastProgress();
  }

  function cleanClone(node) {
    const clone = node.cloneNode(true);
    clone.removeAttribute("style");
    clone.removeAttribute("class");
    clone.querySelectorAll("*").forEach(element => {
      element.removeAttribute("style");
      element.removeAttribute("class");
      element.removeAttribute("id");
    });
    clone.querySelectorAll("strong").forEach(strong => {
      if (strong.textContent.trim().length < 24) return;
      const emphasis = document.createElement("span");
      emphasis.className = "article-emphasis";
      emphasis.textContent = strong.textContent.trim();
      strong.replaceWith(emphasis);
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
    const isDayTwo = material === "podcast-day2";
    const title = material === "podcast" ? "軟體開發的典範轉移" : isDayTwo ? "AI 代理人與自主商務" : "Day 1 Assignment";
    const subtitle = material === "podcast" ? "Podcast 完整文章版 · 10 個主題" : isDayTwo ? "Podcast 完整文章版 · 6 個主題" : "Unit 1 完整文章版 · 6 個段落";
    content.innerHTML = `<header class="article-intro"><span class="kicker">DAY ${isDayTwo ? "2" : "1"} · ${material.toUpperCase()}</span><h1>${title}</h1><p>${subtitle}。內容與圖卡版相同，僅改變閱讀排版。</p></header>`;

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

  function buildLightbox() {
    const overlay = document.createElement("div");
    overlay.className = "card-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "圖卡放大檢視");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `<div class="lightbox-bar"><strong class="lightbox-counter"></strong><button type="button" data-lightbox-close>關閉 ✕</button></div><div class="lightbox-stage"><div class="lightbox-frame"></div><div class="lightbox-nav"><button type="button" data-lightbox-prev aria-label="上一張">←</button><button type="button" data-lightbox-next aria-label="下一張">→</button></div><span class="lightbox-hint">左右滑動切換圖卡</span></div>`;
    document.body.append(overlay);
    const frame = overlay.querySelector(".lightbox-frame");
    const counter = overlay.querySelector(".lightbox-counter");
    const stage = overlay.querySelector(".lightbox-stage");
    let current = 0;
    let touchStartX = null;
    let returnFocus = null;

    function fitCard() {
      const card = frame.firstElementChild;
      if (!card) return;
      const maxWidth = Math.max(240, window.innerWidth - 24);
      const maxHeight = Math.max(360, window.innerHeight - 82);
      const scale = Math.min(maxWidth / 1080, maxHeight / 1920);
      frame.style.width = `${1080 * scale}px`;
      frame.style.height = `${1920 * scale}px`;
      frame.style.setProperty("--lightbox-scale", String(scale));
    }

    function show(index) {
      current = (index + cards.length) % cards.length;
      const source = cards[current].querySelector('[id^="card-"]');
      const clone = source.cloneNode(true);
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
      frame.replaceChildren(clone);
      counter.textContent = `${current + 1} / ${cards.length}`;
      markPodcastTopic(current);
      requestAnimationFrame(fitCard);
    }

    function open(index, trigger) {
      if (!mobileQuery.matches || !document.body.classList.contains("mode-card")) return;
      returnFocus = trigger;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      show(index);
      overlay.querySelector("[data-lightbox-close]").focus();
    }

    function close() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      returnFocus?.focus();
    }

    cards.forEach((wrapper, index) => {
      wrapper.classList.add("card-zoomable");
      wrapper.setAttribute("role", "button");
      wrapper.setAttribute("tabindex", "0");
      wrapper.setAttribute("aria-label", `放大第 ${index + 1} 張圖卡`);
      wrapper.addEventListener("click", () => open(index, wrapper));
      wrapper.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(index, wrapper);
        }
      });
    });
    overlay.querySelector("[data-lightbox-close]").addEventListener("click", close);
    overlay.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(current - 1));
    overlay.querySelector("[data-lightbox-next]").addEventListener("click", () => show(current + 1));
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
    stage.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", event => {
      if (touchStartX === null) return;
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
    stage.addEventListener("pointerdown", event => {
      if (event.pointerType !== "touch") touchStartX = event.clientX;
    });
    stage.addEventListener("pointerup", event => {
      if (event.pointerType === "touch" || touchStartX === null) return;
      const distance = event.clientX - touchStartX;
      if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
      touchStartX = null;
    });
    document.addEventListener("keydown", event => {
      if (!overlay.classList.contains("open")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
    window.addEventListener("resize", fitCard);
  }

  function setupPodcastProgress() {
    if (material !== "podcast") return;
    const indicator = document.querySelector("#material-progress");
    updatePodcastProgress = () => {
      const progress = ProgressStore.readingSummary().podcast;
      indicator.textContent = `已閱讀 ${progress.completed} / ${progress.total}`;
      indicator.style.setProperty("--material-percent", `${progress.percent}%`);
    };
    const articleTopics = [...document.querySelectorAll(".article-section")].slice(1);
    const cardTopics = cards.slice(1);
    articleTopics.forEach((element, index) => { element.dataset.topicNumber = String(index + 1); });
    cardTopics.forEach((element, index) => { element.dataset.topicNumber = String(index + 1); });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          markPodcastTopic(Number(entry.target.dataset.topicNumber));
        }
      });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    articleTopics.forEach(section => observer.observe(section));
    cardTopics.forEach(card => observer.observe(card));
    window.addEventListener("5dai-progress", updatePodcastProgress);
    updatePodcastProgress();
  }

  buildArticleView();
  setupPodcastProgress();
  buildLightbox();
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

})();
