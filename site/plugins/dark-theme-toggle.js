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
    hook.doneEach(() => dom.before(dom.find(".cover.show, .sidebar > .app-name"), toggleEl));
  };
  $docsify ??= {};
  $docsify.plugins = [...($docsify.plugins ?? []), darkThemeTogglePlugin];
})();
