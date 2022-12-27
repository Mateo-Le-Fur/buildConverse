import { NamespaceInterface } from "./Namespace";

export interface UpdateNamespaceInterface {
  namespaceId: number;

  name: string;
  inviteCode: string;
  imgBuffer?: Buffer;
}
