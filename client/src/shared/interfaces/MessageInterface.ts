export interface MessageInterface {
  id: number;
  data: string;
  dataType: "text" | "file" | "image";
  authorName: string;
  avatarAuthor: string | null;
  userId: number;
  roomId: number;
  separator?: boolean;
  createdAt: string;
  updatedAt: string;
}
