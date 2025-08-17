import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.js';
import { Post } from '../models/post.js';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/posts`;

  list(): Observable<Post[]> {
    return this.http.get<Post[]>(this.base);
  }

  byId(id: string): Observable<Post> {
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

  update(id: string, patch: Partial<Post>) {
    return this.http.put<Post>(`${this.base}/${id}`, { ...patch, updatedAt: Date.now() });
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}