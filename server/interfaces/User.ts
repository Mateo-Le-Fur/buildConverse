export interface UserInterface {
  id: number | undefined;
  pseudo: string;
  email: string;
  password: string;
  description: string;
  admin: boolean;
  status: string | null;
  avatarUrl: string;
  statusCode?: number;
  loadMore: boolean;
  UserHasNamespace: { namespace_id: number; user_id: number; admin: boolean };
}
