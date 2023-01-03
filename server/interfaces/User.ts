import { UserHasPrivateRoomInterface } from "./UserHasPrivateRoom";
import { UserHasNamespaceInterface } from "./UserHasNamespace";

export interface UserInterface {
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
  UserHasNamespace: UserHasNamespaceInterface;

  UserHasPrivateRoom: UserHasPrivateRoomInterface;
}
