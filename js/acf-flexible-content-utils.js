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

  /**
   * These global actions are added to the postbox header of the layout group.
   */
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

  /**
   * These custom controls are added to each layout in the flexible content field.
   */
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

  /**
   * Copies the layout to the clipboard.
   */
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

  /**
   * Pastes the copied layout to the current flexible content field.
   */
  pasteLayout() {
    const data = prompt("Paste in the copied layout you'd like to insert.");
    if (!data) return;

    try {
      const { domain, acfFieldKey, layout } = JSON.parse(data);

      const layoutGroupKey = document.querySelector(
        ".acf-field-flexible-content"
      ).dataset.key;

      const flexibleContentModel = acf.models.FlexibleContentField.prototype;
      flexibleContentModel.$el = this.layouts[layoutGroupKey].$el;
      flexibleContentModel.cid = this.layouts[layoutGroupKey].cid;
      this.currentFlexibleContent = flexibleContentModel;

      const container = document.createElement("div");
      container.innerHTML = layout;

      const pastesLayoutsHtml = container.querySelectorAll("[data-layout]");
      if (!pastesLayoutsHtml.length) {
        alert("No layouts found in the pasted data.");
        return;
      }

      const acfLayoutsList = flexibleContentModel.$popup().html();
      const currentLayouts = flexibleContentModel.$layouts();

      const countLayouts = (name) => {
        return currentLayouts.filter(
          (layout) => currentLayouts[layout].dataset.layout === name
        ).length;
      };

      const validatedLayouts = [];

      pastesLayoutsHtml.forEach((layoutHtml) => {
        const layoutName = layoutHtml.dataset.layout;
        const layoutCount = countLayouts(layoutName);

        const getLayoutClone = flexibleContentModel.$clone(layoutName);
        if (!getLayoutClone) {
          alert(`Layout ${layoutName} is not allowed in this group.`);
          return;
        }

        validatedLayouts.push(layoutHtml);
      });

      if (!validatedLayouts.length) {
        alert("No valid layouts found in the pasted data.");
        return;
      }

      validatedLayouts.forEach((layoutHtml) => {
        const layoutId = layoutHtml.dataset.id;
        const fieldIdentifier = `${acfFieldKey}[${layoutId}]`;
        const targetGroup = flexibleContentModel
          .$control()
          .find("> input[type=hidden]")
          .attr("name");

        this.insertLayout({
          layoutHtml,
          fieldIdentifier,
          targetGroup,
        });
      });
    } catch (e) {
      console.error("Error while pasting layout: ", e);
    }
  }

  /**
   * Inserts the layout into the flexible content field.
   */
  insertLayout({ layoutHtml, fieldIdentifier, targetGroup }) {
    const flexibleContentModel = this.currentFlexibleContent;
    if (!flexibleContentModel.allowAdd()) {
      alert("You cannot add any more layouts.");
      return;
    }

    const uniqid = acf.uniqid();
    let newIdentifier = "";

    if (targetGroup) {
      if (!fieldIdentifier) {
        fieldIdentifier = `${targetGroup}[${layoutHtml.dataset.id}]`;
      }
      newIdentifier = `${targetGroup}[${uniqid}]`;
    }

    acf.doAction("before_duplicate", layoutHtml);

    const duplicatedLayout = layoutHtml.cloneNode(true);

    acf.rename({
      target: jQuery(duplicatedLayout),
      search: fieldIdentifier,
      replace: newIdentifier,
    });

    acf.doAction(
      "after_duplicate",
      jQuery(layoutHtml),
      jQuery(duplicatedLayout)
    );

    const appendLayout = flexibleContentModel.proxy((duplicatedLayout) => {
      duplicatedLayout = jQuery(duplicatedLayout);

      duplicatedLayout.addClass("strl-appended-layout");
      duplicatedLayout.attr("data-id", uniqid);

      flexibleContentModel.$layoutsWrap().append(duplicatedLayout);

      acf.enable(duplicatedLayout, flexibleContentModel.cid);
      flexibleContentModel.render();
    });

    appendLayout(duplicatedLayout);

    acf.doAction("append", jQuery(duplicatedLayout));

    // Trigger a change event for validation purposes.
    flexibleContentModel.$input().trigger("change");
  }
}

new FlexibleContentUtils();
