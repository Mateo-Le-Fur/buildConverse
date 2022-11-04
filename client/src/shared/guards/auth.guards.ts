import { useUser } from "@/shared/stores";
import { useSocket } from "@/shared/stores/socketStore";

let initSocket: boolean = false;

export function isAuthenticatedGaurd() {
  const userStore = useUser();
  if (!userStore.isAuthenticated) {
    return "/connexion";
  }
}

export function isNotAuthenticatedGaurd() {
  const userStore = useUser();
  if (userStore.isAuthenticated) {
    return "/home";
  }
}

export function initNamespace() {
  if (!initSocket) {
    const socketStore = useSocket();
    socketStore.init();
    socketStore.initNamespaces();

    initSocket = true;
  }
}
