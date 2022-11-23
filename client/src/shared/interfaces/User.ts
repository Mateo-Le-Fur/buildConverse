export interface User {
  id: number;
  pseudo: string;
  email: string;
  password: string;
  admin: boolean;
  status: string | null;
  avatar_url: string;
  statusCode?: number;
  UserHasNamespace: { namespace_id: number; user_id: number; admin: boolean };
}
