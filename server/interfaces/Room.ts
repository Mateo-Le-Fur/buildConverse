import type { NamespaceInterface } from "./Namespace";

export interface RoomInterface {
  id: number;
  roomId: number;
  name: string;
  index: number;
  namespaceId: number;
  namespaces: NamespaceInterface;
  created_at: string;
  updated_at: string;
}
