import type { RoomInterface } from "@/shared/interfaces/Room";
import type { User } from "@/shared/interfaces/User";

export interface Namespace {
  id: number;
  name: string;
  inviteCode: string;
  img_url: string;
  rooms: RoomInterface[];
  namespaceHasUser: User[];
  created_at: string;
  updated_at: string;
}
