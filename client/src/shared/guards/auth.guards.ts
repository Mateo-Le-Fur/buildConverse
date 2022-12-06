import { useUser } from "@/shared/stores";

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
