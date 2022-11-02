export interface Message {
  id: number;
  data: string;
  data_type: "text" | "file" | "image";
  author_name: string;
  user_id: number;
  room_id: number;
  created_at: string;
  updated_at: string;
}
