import { UserInterface } from "./User";

export interface UpdateUserInterface extends UserInterface {
  namespaces: number[],
  avatar: Buffer,
}