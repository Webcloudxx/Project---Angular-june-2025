import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: string | number;
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

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/posts';

  list(): Observable<Post[]> {
    return this.http.get<Post[]>(this.base);
  }
  byId(id: string | number): Observable<Post> {
    return this.http.get<Post>(`${this.base}/${id}`);
  }
  byAuthor(uid: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.base}?authorId=${encodeURIComponent(uid)}`);
  }
  create(body: Omit<Post, 'id'|'createdAt'|'updatedAt'|'likeCount'|'commentCount'>) {
    return this.http.post<Post>(this.base, {
      ...body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      likeCount: 0,
      commentCount: 0
    });
  }
  update(id: string | number, patch: Partial<Post>) {
    return this.http.put<Post>(`${this.base}/${id}`, { ...patch, updatedAt: Date.now() });
  }
  delete(id: string | number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}