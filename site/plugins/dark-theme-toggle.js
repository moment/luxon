(() => {
  const darkThemeTogglePlugin = (hook, vm) => {
    const TOGGLE_ID = "docsify-dark-theme-toggle",
      dom = Docsify.dom,
      darkThemeStyleSheet = dom.find('link[href$="dark.css"]'),
      applyTheme = (swap = false) => {
        const isDark = Boolean(swap ^ (localStorage[TOGGLE_ID] == "true"));
        localStorage[TOGGLE_ID] = isDark;
        darkThemeStyleSheet.disabled = !isDark;
        dom.toggleClass(dom.body, isDark ? "add" : "remove", "dark");
      };
    localStorage[TOGGLE_ID] ??= matchMedia("(prefers-color-scheme: dark)").matches;
    hook.init(applyTheme);
    hook.doneEach(() => {
      dom.findAll(".cover.show, .sidebar > .app-name").forEach((target) => {
        let toggleEl = dom.find(target, `.${TOGGLE_ID}`);
        if (null == toggleEl) {
          toggleEl = dom.create("div", "<span />");
          toggleEl.className = TOGGLE_ID;
          dom.on(toggleEl, "click", () => applyTheme(true));
        }
        dom.before(target, toggleEl);
      });
    });
  };
  $docsify ??= {};
  $docsify.plugins = [...($docsify.plugins ?? []), darkThemeTogglePlugin];
})();
