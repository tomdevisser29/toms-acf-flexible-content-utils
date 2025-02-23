class FlexibleContentUtils {
  layouts = {};
  currentFlexibleContent = null;

  constructor() {
    this.init();
  }

  init() {
    if (!window.acf) return;

    document.addEventListener("DOMContentLoaded", () => {
      this.addCustomLayoutControls();
      this.addCustomLayoutActions();
    });
  }

  addCustomLayoutActions() {
    const postboxHeader = document.querySelector(
      ".acf-postbox .handle-actions"
    );

    if (postboxHeader) {
      const button = document.createElement("button");
      button.className = "dashicons acf-paste-icon acf-js-tooltip";
      button.dataset.name = "paste-layouts";
      button.title = "Paste layouts from clipboard";

      // Add an event listener for the button
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this.pasteLayout();
      });

      postboxHeader.insertBefore(button, postboxHeader.firstChild);
    }
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

        button.addEventListener("click", this.copyLayout.bind(this));

        layoutControls.insertBefore(button, layoutControls.firstChild);
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

  pasteLayout() {
    const data = prompt("Paste in the copied layout you'd like to insert.");
    if (!data) return;

    try {
      const { domain, acfFieldKey, layout } = JSON.parse(data);

      // const layoutHtml = layout.closest("[data-layout]");
      const container = document.createElement("div");
      container.innerHTML = layout;

      const layoutsHtml = container.querySelectorAll("[data-layout]");

      const layoutGroupKey = document.querySelector(
        ".acf-field-flexible-content"
      ).dataset.key;

      const flexibleContentModel = acf.models.FlexibleContentField.prototype;
      flexibleContentModel.$el = this.layouts[layoutGroupKey].$el;
      flexibleContentModel.cid = this.layouts[layoutGroupKey].cid;
      this.currentFlexibleContent = flexibleContentModel;

      const validatedLayouts = [];

      layoutsHtml.forEach((layoutHtml) => {
        const layoutName = layoutHtml.dataset.layout;
        validatedLayouts.push(layoutHtml);
      });

      validatedLayouts.forEach((layoutHtml) => {
        const dataId = layoutHtml.dataset.id;
        const targetGroup = flexibleContentModel
          .$control()
          .find("input[type=hidden]")
          .attr("name");

        const uniqId = acf.uniqid();
      });
    } catch (e) {
      console.error("Error while pasting layout: ", e);
    }
  }
}

new FlexibleContentUtils();
