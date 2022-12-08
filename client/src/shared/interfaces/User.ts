import type { UserHasNamespace } from "@/shared/interfaces/UserHasNamespace";

export interface User {
  id: number;
  pseudo: string;
  email: string;
  password: string;
  description: string;
  admin: boolean;
  status: string | null;
  avatarUrl: string;
  statusCode?: number;
  loadMore: boolean;
  UserHasNamespace: UserHasNamespace;
}
