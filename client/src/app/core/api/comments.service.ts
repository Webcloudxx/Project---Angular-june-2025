import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: string | number;
  postId: string | number;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);
  private base = 'http://localhost:4000/api/comments';;

  listForPost(postId: string | number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.base}?postId=${postId}`);
  }

  add(c: Omit<Comment, 'id'|'createdAt'>) {
    return this.http.post<Comment>(this.base, { ...c, createdAt: Date.now() });
  }
}