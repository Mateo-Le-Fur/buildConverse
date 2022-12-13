import { UserInterface } from "./User";

export interface UpdateUserInterface extends UserInterface {
  namespaces: number[],

  friends: number[],
  avatar: Buffer,
}