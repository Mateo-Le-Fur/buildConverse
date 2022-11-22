export interface User {
  id: number;
  pseudo: string;
  admin: boolean;
  status: string | null;
  avatar_url: string;
  statusCode?: number;
  UserHasNamespace: { namespace_id: number; user_id: number; admin: boolean };
}
