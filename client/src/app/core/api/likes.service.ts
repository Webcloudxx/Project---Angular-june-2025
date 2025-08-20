import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LikesService {
  private http = inject(HttpClient);
  private base = 'http://localhost:3000/likes';

  async toggle(postId: string, uid: string) {
    const id = `${postId}_${uid}`;
    try {
      await this.http.delete(`${this.base}/${id}`).toPromise();
      return { liked: false };
    } catch {
      await this.http.post(this.base, { id, postId, uid, createdAt: Date.now() }).toPromise();
      return { liked: true };
    }
  }
}