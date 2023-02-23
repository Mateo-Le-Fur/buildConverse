export interface AuthorizationsInterface {
  adminServer: Set<number>;
  room: Set<number>;
  namespaceHasRooms: Map<number, Set<number>>;
}
