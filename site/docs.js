function copyText(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const original = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = original;
    }, 1200);
  }).catch(() => {
    button.textContent = "Copy failed";
  });
}

for (const button of document.querySelectorAll("[data-copy-target]")) {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    copyText(target.textContent.trim(), button);
  });
}

for (const switcher of document.querySelectorAll(".human-machine-switcher")) {
  for (const button of switcher.querySelectorAll("[data-mode-button]")) {
    button.addEventListener("click", () => {
      const mode = button.dataset.modeButton;
      switcher.dataset.mode = mode;
      for (const option of switcher.querySelectorAll("[data-mode-button]")) {
        const active = option.dataset.modeButton === mode;
        option.setAttribute("aria-pressed", active ? "true" : "false");
        option.textContent = `${active ? "●" : "○"} ${option.dataset.modeButton.toUpperCase()}`;
      }
    });
  }
}
