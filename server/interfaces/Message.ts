export interface MessageInterface {
  user_id: any;
  id: number;
  data: string;
  dataType: "text" | "file" | "image";
  authorName: string;
  avatarAuthor: string;
  userId: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}
