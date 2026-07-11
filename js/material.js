(function () {
  const material = document.body.dataset.material;
  const modeKey = "5dai-reader-mode";
  const cards = [...document.querySelectorAll(".card-wrapper")];
  const storedMode = localStorage.getItem(modeKey);
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const readingConfig = {
    assignment: { total: 4, store: "assignment", storageKey: null },
    "assignment-day2": { total: 4, storageKey: "5dai-assignment-day2-progress" },
    podcast: { total: 10, store: "podcast", storageKey: null },
    "podcast-day2": { total: 6, storageKey: "5dai-podcast-day2-progress" }
  }[material] || null;
  let updateReadingProgress = () => {};

  function markReadingSection(sectionNumber) {
    if (!readingConfig || sectionNumber < 1 || sectionNumber > readingConfig.total) return;
    if (readingConfig.store) {
      const stateKey = `${readingConfig.store}Sections`;
      const markMethod = readingConfig.store === "podcast" ? "markPodcastSection" : "markAssignmentSection";
      if (!ProgressStore.state[stateKey][String(sectionNumber)]) {
        ProgressStore[markMethod](sectionNumber);
      }
    } else {
      const stored = readStoredProgress();
      if (!stored[String(sectionNumber)]) {
        stored[String(sectionNumber)] = true;
        localStorage.setItem(readingConfig.storageKey, JSON.stringify(stored));
        window.dispatchEvent(new CustomEvent("5dai-progress", {
          detail: { day: 2, material, section: sectionNumber }
        }));
      }
    }
    updateReadingProgress();
  }

  function readStoredProgress() {
    if (!readingConfig?.storageKey) return {};
    try {
      return JSON.parse(localStorage.getItem(readingConfig.storageKey)) || {};
    } catch {
      return {};
    }
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
      strong.className = "article-emphasis";
    });
    return clone;
  }

  function paragraphAsList(paragraph) {
    if (!paragraph.querySelector("br")) return null;
    const lines = [document.createDocumentFragment()];
    [...paragraph.childNodes].forEach(node => {
      if (node.nodeName === "BR") lines.push(document.createDocumentFragment());
      else lines[lines.length - 1].append(node.cloneNode(true));
    });
    const populated = lines.filter(line => line.textContent.trim());
    if (populated.length < 2) return null;
    const texts = populated.map(line => line.textContent.trim());
    const marker = texts.every(text => /^•\s*/.test(text))
      ? { tag: "ul", pattern: /^\s*•\s*/ }
      : texts.every(text => /^\d+[.)]\s*/.test(text))
        ? { tag: "ol", pattern: /^\s*\d+[.)]\s*/ }
        : null;
    if (!marker) return null;
    const list = document.createElement(marker.tag);
    populated.forEach(line => {
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let textNode = walker.nextNode();
      while (textNode && !textNode.nodeValue.trim()) textNode = walker.nextNode();
      if (textNode) textNode.nodeValue = textNode.nodeValue.replace(marker.pattern, "");
      const item = document.createElement("li");
      item.append(line);
      list.append(item);
    });
    return list;
  }

  function sourceCallout(block, card) {
    let container = block.parentElement;
    while (container && container !== card) {
      if (/border-left\s*:/i.test(container.getAttribute("style") || "")) return container;
      container = container.parentElement;
    }
    return null;
  }

  function appendArticleBlocks(card, section) {
    const blocks = [...card.querySelectorAll("p, ul, ol")].filter(block => {
      if (block.classList.contains("nowrap")) return false;
      if (block.closest('[style*="border-top"]')) return false;
      if (block.closest("li") && block.tagName === "P") return false;
      return block.textContent.trim().length > 0;
    });
    let calloutSource = null;
    let callout = null;
    blocks.forEach(block => {
      const clone = cleanClone(block);
      const normalized = clone.tagName === "P" ? paragraphAsList(clone) || clone : clone;
      const source = sourceCallout(block, card);
      if (!source) {
        calloutSource = null;
        callout = null;
        section.append(normalized);
        return;
      }
      if (source !== calloutSource) {
        calloutSource = source;
        callout = document.createElement("blockquote");
        callout.className = "article-callout";
        const accent = (source.getAttribute("style") || "").match(/border-left\s*:[^;]*?(#[0-9a-f]{3,8}|rgba?\([^)]+\))/i)?.[1];
        if (accent) callout.style.setProperty("--callout-accent", accent);
        section.append(callout);
      }
      callout.append(normalized);
    });
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
    toc.innerHTML = "<div class=\"chapter-heading\"><strong>CHAPTERS</strong><span class=\"chapter-progress\" id=\"chapter-progress\"></span></div>";
    const content = document.createElement("div");
    content.className = "article-content";
    const isDayTwo = material.endsWith("-day2");
    const isPodcastMaterial = material.startsWith("podcast");
    const title = isPodcastMaterial
      ? (isDayTwo ? "AI 代理人與自主商務" : "軟體開發的典範轉移")
      : `Day ${isDayTwo ? "2" : "1"} Assignment`;
    const subtitle = isPodcastMaterial
      ? `Podcast 完整文章版 · ${readingConfig.total} 個主題`
      : `Assignment 完整文章版 · ${readingConfig.total} 個 section`;
    content.innerHTML = `<header class="article-intro"><span class="kicker">DAY ${isDayTwo ? "2" : "1"} · ${isPodcastMaterial ? "PODCAST" : "ASSIGNMENT"}</span><h1>${title}</h1><p>${subtitle}。內容與圖卡版相同，僅改變閱讀排版。</p></header>`;

    cards.forEach((wrapper, index) => {
      const card = wrapper.querySelector('[id^="card-"]');
      if (!card) return;
      const id = `${material}-section-${index + 1}`;
      const titleText = sectionTitle(card, index);
      const isIntro = index === 0;
      const isEnding = index === cards.length - 1;
      const sectionNumber = isIntro
        ? "INTRO"
        : isEnding
          ? "END"
          : String(index).padStart(2, "0");
      const section = document.createElement("section");
      section.className = "article-section";
      section.id = id;
      section.innerHTML = `<span class="section-number">${sectionNumber}</span><h2>${titleText}</h2>`;
      appendArticleBlocks(card, section);
      content.append(section);
      if (isIntro || isEnding) return;
      const link = document.createElement("a");
      link.href = `#${id}`;
      link.textContent = `${sectionNumber} ${titleText}`;
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
      markReadingSection(current);
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

  function setupReadingProgress() {
    if (!readingConfig) return;
    const indicator = document.querySelector("#material-progress");
    const chapterIndicator = document.querySelector("#chapter-progress");
    const chapterLinks = [...document.querySelectorAll(".article-toc a")];
    updateReadingProgress = () => {
      const sectionState = readingConfig.store
        ? ProgressStore.state[`${readingConfig.store}Sections`]
        : readStoredProgress();
      const completed = Object.values(sectionState).filter(Boolean).length;
      const percent = Math.round(completed / readingConfig.total * 100);
      if (indicator) {
        indicator.textContent = `已閱讀 ${completed} / ${readingConfig.total}`;
        indicator.style.setProperty("--material-percent", `${percent}%`);
      }
      if (chapterIndicator) chapterIndicator.textContent = `${completed} / ${readingConfig.total} SECTIONS`;
      chapterLinks.forEach((link, index) => {
        const isRead = Boolean(sectionState[String(index + 1)]);
        link.classList.toggle("read", isRead);
        if (isRead) link.dataset.readLabel = "已讀";
        else delete link.dataset.readLabel;
      });
    };
    const articleTopics = [...document.querySelectorAll(".article-section")].slice(1, -1);
    const cardTopics = cards.slice(1, -1);
    articleTopics.forEach((element, index) => { element.dataset.topicNumber = String(index + 1); });
    cardTopics.forEach((element, index) => { element.dataset.topicNumber = String(index + 1); });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          markReadingSection(Number(entry.target.dataset.topicNumber));
        }
      });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0 });
    articleTopics.forEach(section => observer.observe(section));
    cardTopics.forEach(card => observer.observe(card));
    window.addEventListener("5dai-progress", updateReadingProgress);
    updateReadingProgress();
  }

  function setupChapterNavigation() {
    const toc = document.querySelector(".article-toc");
    const links = [...toc.querySelectorAll("a")];
    if (!links.length) return;
    const chapters = links.map(link => ({
      link,
      section: document.querySelector(link.getAttribute("href"))
    })).filter(chapter => chapter.section);
    let activeLink = null;

    function setActive(link) {
      if (link === activeLink) return;
      chapters.forEach(chapter => {
        const active = chapter.link === link;
        chapter.link.classList.toggle("active", active);
        if (active) chapter.link.setAttribute("aria-current", "location");
        else chapter.link.removeAttribute("aria-current");
      });
      activeLink = link;
      if (mobileQuery.matches) {
        link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }

    function updateActiveChapter() {
      if (!document.body.classList.contains("mode-article")) return;
      const marker = Math.min(window.innerHeight * 0.35, 260);
      let current = chapters[0];
      chapters.forEach(chapter => {
        if (chapter.section.getBoundingClientRect().top <= marker) current = chapter;
      });
      setActive(current.link);
    }

    links.forEach(link => link.addEventListener("click", () => setActive(link)));
    window.addEventListener("scroll", updateActiveChapter, { passive: true });
    window.addEventListener("resize", updateActiveChapter);
    document.querySelectorAll("[data-reader-mode]").forEach(button => {
      button.addEventListener("click", () => requestAnimationFrame(updateActiveChapter));
    });
    requestAnimationFrame(updateActiveChapter);
  }

  buildArticleView();
  setupReadingProgress();
  setupChapterNavigation();
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
