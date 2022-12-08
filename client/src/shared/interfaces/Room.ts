import type { Namespace } from "@/shared/interfaces/Namespace";

export interface RoomInterface {
  id: number;
  name: string;
  index: string;
  namespaceId: number;
  namespaces: Namespace;
  createdAt: string;
  updatedAt: string;
}
