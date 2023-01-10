import type { Namespace } from "@/shared/interfaces/Namespace";

export interface RoomInterface {
  id: number;
  name: string;
  index: number;
  namespaceId: number;
  namespaces: Namespace;
  createdAt: string;
  updatedAt: string;
}
