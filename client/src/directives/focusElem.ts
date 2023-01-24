import type { App } from "vue";
import type { input } from "zod";

export default function focusElem(app: App) {
  app.directive("focus", {
    mounted(el: HTMLInputElement) {
      el.focus();
    },
  });
}
