import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.js';

export interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrl: string | null;
  authorId: string;
  authorName: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/posts`;

  list(q?: string): Observable<Post[]> {
    const url = q ? `${this.base}?q=${encodeURIComponent(q)}` : this.base;
    return this.http.get<Post[]>(url);
  }

  byAuthor(authorId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.base}?authorId=${encodeURIComponent(authorId)}`);
  }

  get(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.base}/${id}`);
  }

  create(payload: { title: string; content: string; mediaUrl?: string | null }): Observable<Post> {
    return this.http.post<Post>(this.base, {
      title: payload.title,
      content: payload.content,
      mediaUrl: payload.mediaUrl ?? null,
    });
  }

  update(id: string, changes: Partial<Pick<Post, 'title' | 'content' | 'mediaUrl'>>): Observable<Post> {
    return this.http.patch<Post>(`${this.base}/${id}`, changes);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  likeToggle(id: string) {
    return this.http.post<Post>(`${this.base}/${id}/like`, {});
  }

  all() { 
    return this.list(); 
  }

  
}