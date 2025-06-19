(function () {
  const darkThemeTogglePlugin = function (hook, vm) {
    const TOGGLE_ID = `${vm.config.name}-docsify-dark-theme-toggle`,
      dom = Docsify.dom,
      darkThemeStyleSheet = dom.find('link[href$="dark.css"]'),
      toggleEl = dom.create("div", "<span />"),
      applyTheme = (swap = false) => {
        const isDark = (localStorage[TOGGLE_ID] = Boolean(
          swap ^ (localStorage[TOGGLE_ID] == "true")
        ));
        darkThemeStyleSheet.disabled = !isDark;
        dom.toggleClass(dom.body, isDark ? "add" : "remove", "dark");
      },
      toggleStyle = `#${TOGGLE_ID} {
  position: absolute;
  display: inline-block;
  width: 52px;
  height: 28px;
  margin-left: 2rem;
  margin-top: 1.5rem;
  left: 0;
  top: 0;
  z-index: 0;
  cursor: pointer;
}
.sidebar > .app-name {
  position: relative;
}
.app-name > #${TOGGLE_ID} {
  margin-right: 1rem;
  margin-top: 0;
  right: 0;
  left: unset;
}
#${TOGGLE_ID}::before, #${TOGGLE_ID}::after {
  position: absolute;
  top: 0.1em;
  font-size: 16px;
  transition: opacity 0.3s;
}
#${TOGGLE_ID}::before {
  content: "🌙";
  left: 0.1em;
  opacity: 0;
  z-index: 1;
}
#${TOGGLE_ID}::after {
  content: "🌞";
  right: 0.1em;
  opacity: 1;
}
#${TOGGLE_ID} > span {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--theme-color, #42b983);
  border-radius: 28px;
  transition: background-color 0.3s;
}
#${TOGGLE_ID} > span::before {
  content: "";
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  top: 3px;
  z-index: 1;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}
.dark #${TOGGLE_ID}::after {
  opacity: 0;
}
.dark #${TOGGLE_ID}::before {
  opacity: 1;
}
.dark #${TOGGLE_ID} > span {
  background-color: var(--theme-color, #ea6f5a);
}
.dark #${TOGGLE_ID} > span::before {
  transform: translateX(24px);
}`;
    localStorage[TOGGLE_ID] ??= matchMedia("(prefers-color-scheme: dark)").matches;
    toggleEl.id = TOGGLE_ID;
    dom.on(toggleEl, "click", applyTheme.bind(this, true));
    hook.init(applyTheme);
    hook.doneEach(() => {
      const targetEl = dom.find(".cover.show") || dom.find(".sidebar > .app-name");
      dom.before(targetEl, toggleEl);
    });
    dom.style(toggleStyle);
  };
  $docsify = $docsify || {};
  $docsify.plugins = [].concat($docsify.plugins || [], darkThemeTogglePlugin);
})();
