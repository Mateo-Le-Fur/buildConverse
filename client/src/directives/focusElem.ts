import type { App } from "vue";

export default function focusElem(app: App) {
  app.directive("focus", {
    mounted(el: HTMLInputElement) {
      el.focus();
    },
  });
}
