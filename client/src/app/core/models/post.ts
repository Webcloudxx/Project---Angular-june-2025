export interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  likeCount: number;
  commentCount: number;
}