import type { Namespace } from "@/shared/interfaces/Namespace";

export interface RoomInterface {
  id: number;
  name: string;
  index: string;
  namespace_id: number;
  namespaces: Namespace;
  created_at: string;
  updated_at: string;
}
