class FlexibleContentUtils {
  layouts = {};

  constructor() {
    this.init();
  }

  init() {
    if (!window.acf) return;
    this.addCustomLayoutControls();
  }

  addCustomLayoutControls() {
    acf.addAction("ready_field/type=flexible_content", (field) => {
      this.layouts[field.data.key] = field;

      field.$el.find(".layout").each((index, layout) => {
        const layoutControls = layout.querySelector(".acf-fc-layout-controls");

        const button = document.createElement("a");
        button.href = "#";
        button.className =
          "acf-icon acf-copy-icon -copy small light acf-js-tooltip";
        button.dataset.name = "copy-layout";
        button.title = "Copy layout";

        layoutControls.insertBefore(button, layoutControls.firstChild);
      });

      document.querySelectorAll(".acf-copy-icon").forEach((button) => {
        button.addEventListener("click", this.copyLayout.bind(this));
      });
    });
  }

  copyLayout(e) {
    const target = e.target;
    const layoutEl = target.closest(".layout");
    const acfFieldKey = target
      .closest(".acf-flexible-content")
      .querySelector('input[type="hidden"]')
      .getAttribute("name");

    const data = JSON.stringify({
      domain: window.location.origin,
      acfFieldKey,
      layout: layoutEl.outerHTML,
    });

    this.copyToClipboard(data);
  }

  async copyToClipboard(data) {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(data);
        alert("The layout has been copied to your clipboard.");
      } catch (err) {
        console.error("Failed to copy: ", err);
        alert("Failed to copy to clipboard. Please contact a developer.");
      }
    } else {
      alert("Your browser does not support copying to clipboard.");
    }
  }
}

new FlexibleContentUtils();
