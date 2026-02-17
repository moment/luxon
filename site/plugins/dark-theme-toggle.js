(() => {
  const darkThemeTogglePlugin = (hook, vm) => {
    const TOGGLE_ID = "docsify-dark-theme-toggle",
      dom = Docsify.dom,
      darkThemeStyleSheet = dom.find('link[href$="dark.css"]'),
      toggleEl = dom.create("div", "<span />"),
      applyTheme = (swap = false) => {
        const isDark = Boolean(swap ^ (localStorage[TOGGLE_ID] == "true"));
        localStorage[TOGGLE_ID] = isDark;
        darkThemeStyleSheet.disabled = !isDark;
        dom.toggleClass(dom.body, isDark ? "add" : "remove", "dark");
      };
    localStorage[TOGGLE_ID] ??= matchMedia("(prefers-color-scheme: dark)").matches;
    toggleEl.id = TOGGLE_ID;
    dom.on(toggleEl, "click", () => applyTheme(true));
    hook.init(applyTheme);

    //hook.doneEach(() => dom.before(dom.find(".sidebar > .app-name"), toggleEl));

    hook.doneEach(() => {
      const cover = dom.find(".cover.show");
      const sidebarTarget = dom.find(".sidebar > .app-name");

      if (!sidebarTarget) return;

      const moveToSidebar = () => {
        dom.before(sidebarTarget, toggleEl);
      };

      const moveToCover = () => {
        if (cover) {
          dom.before(cover, toggleEl);
        }
      };

      if (cover) {
        const observer = new IntersectionObserver(
          (entries) => {
            const isVisible = entries[0].isIntersecting;

            if (isVisible) {
              moveToCover();
            } else {
              moveToSidebar();
            }
          },
          { threshold: 0.1 }
        );

        observer.observe(cover);
      } else {
        // On non-home pages
        moveToSidebar();
      }
    });
  };
  $docsify ??= {};
  $docsify.plugins = [...($docsify.plugins ?? []), darkThemeTogglePlugin];
})();
