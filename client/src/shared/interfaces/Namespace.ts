import type { RoomInterface } from "@/shared/interfaces/Room";
import type { User } from "@/shared/interfaces/User";
import type { UserHasNamespace } from "@/shared/interfaces/UserHasNamespace";

export interface Namespace {
  id: number;
  name: string;
  inviteCode: string;
  img_url: string;
  rooms: RoomInterface[];
  UserHasNamespace: UserHasNamespace;
  created_at: string;
  updated_at: string;
}
