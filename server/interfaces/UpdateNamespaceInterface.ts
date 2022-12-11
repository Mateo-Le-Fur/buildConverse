import { NamespaceInterface } from "./Namespace";

export interface UpdateNamespaceInterface {
  namespaceId: number;

  values: Partial<NamespaceInterface>

  avatar?: Buffer;
}