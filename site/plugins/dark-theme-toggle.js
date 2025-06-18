(function () {
  const darkThemeTogglePlugin = function (hook, vm) {
    const CHECKBOX_ID = "dark-theme-input";
    const STORAGE_KEY = "docsify-toggle-dark-theme";
    localStorage[STORAGE_KEY] ??= matchMedia("(prefers-color-scheme: dark)").matches;
    const initialValue = localStorage[STORAGE_KEY] === "true";
    const dom = Docsify.dom;
    const darkThemeStyleSheet = dom.find('link[href$="dark.css"]');
    const toggleDarkMode = (isDark) => (darkThemeStyleSheet.disabled = !isDark);
    const pluginStyleEl = dom.create("style");
    pluginStyleEl.textContent = `#${CHECKBOX_ID} {
			display: none;
		}
		.dark-theme-label {
			position: absolute;
			display: inline-block;
			width: 52px;
			height: 28px;
			margin-left: 2rem;
			margin-top: 2rem;
			z-index: 0;
			cursor: pointer;
		}
		.dark-theme-label::before, .dark-theme-label::after {
			position: absolute;
			top: 0.1em;
			font-size: 16px;
			transition: opacity 0.3s;
		}
		.dark-theme-label::after {
			content: "🌞";
			right: 0.1em;
			opacity: 1;
		}
		.dark-theme-label::before {
			content: "🌙";
			left: 0.1em;
			opacity: 0;
			z-index: 1;
		}
		.slider {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: var(--theme-color, #42b983);
			border-radius: 28px;
			transition: background-color 0.3s;
		}
		.slider::before {
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
		#${CHECKBOX_ID}:checked + .dark-theme-label::after {
			opacity: 0;
		}
		#${CHECKBOX_ID}:checked + .dark-theme-label::before {
			opacity: 1;
		}
		#${CHECKBOX_ID}:checked + .dark-theme-label .slider {
			background-color: var(--theme-color, #ea6f5a);
		}
		#${CHECKBOX_ID}:checked + .dark-theme-label .slider::before {
			transform: translateX(24px);
		}
		#${CHECKBOX_ID}:checked ~ section.cover.show {
			background-color: rgb(79 58 120) !important;
		}
		section.cover.show {
			z-index: -1;
		}`;
    dom.head.appendChild(pluginStyleEl);
    hook.init(() => toggleDarkMode(initialValue));
    hook.ready(() => {
      const body = dom.body;
      const checkbox = dom.create("input");
      checkbox.id = CHECKBOX_ID;
      checkbox.type = "checkbox";
      checkbox.checked = initialValue;
      checkbox.addEventListener("change", () => {
        toggleDarkMode((localStorage[STORAGE_KEY] = checkbox.checked));
      });
      const label = dom.create("label");
      label.setAttribute("for", CHECKBOX_ID);
      label.className = "dark-theme-label";
      const slider = dom.create("span");
      slider.className = "slider";
      label.appendChild(slider);
      body.prepend(label);
      body.prepend(checkbox);
    });
  };

  $docsify = $docsify || {};
  $docsify.plugins = [].concat($docsify.plugins || [], darkThemeTogglePlugin);
})();
