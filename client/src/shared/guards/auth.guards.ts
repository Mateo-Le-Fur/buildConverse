import { useUser } from "@/shared/stores";
import { useSocket } from "@/shared/stores/socketStore";

const initSocket: boolean = false;

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
  const socketStore = useSocket();
  const userStore = useUser();
  //
  // if (!initSocket && userStore.currentUser) {
  //   socketStore.init();
  //   socketStore.initNamespaces();
  //   initSocket = true;
  // } else {
  //   initSocket = false;
  // }
}
