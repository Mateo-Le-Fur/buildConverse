import type { App, DirectiveBinding } from "vue";

interface CustomElement extends Element {
  clickOutsideEvent: any;
}
export default function directive(app: App) {
  app.directive("click-outside", {
    beforeMount(el: CustomElement, binding: DirectiveBinding) {
      el.clickOutsideEvent = (evt: Event) => {
        evt.stopPropagation();
        const target = evt.target as EventTarget;
        if (!(el === target || el.contains(target as Node))) {
          binding.value(evt, el);
        }
      };
      window.requestAnimationFrame(() => {
        document.addEventListener("click", el.clickOutsideEvent);
      });
    },
    unmounted(el) {
      document.removeEventListener("click", el.clickOutsideEvent);
    },
  });
}
