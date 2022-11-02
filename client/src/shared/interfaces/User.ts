export interface User {
  pseudo: string;
  admin: boolean;
  status: string | null;
  avatar_url: string;
  statusCode?: number;
  user_has_namespace: { namespace_id: number; user_id: number };
}
