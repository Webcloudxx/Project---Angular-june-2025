import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, orderBy, doc, updateDoc, increment } from '@angular/fire/firestore';
import { Comment } from '../models/comment.js';
import { map, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private fs = inject(Firestore);
  private col = collection(this.fs, 'comments');

  listForPost(postId: string) {
    const q = query(this.col, where('postId','==', postId), orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(map(x => x as Comment[]), shareReplay(1));
  }

  async add(c: Omit<Comment, 'id'|'createdAt'>) {
    await addDoc(this.col, { ...c, createdAt: Date.now() });
    await updateDoc(doc(this.fs, 'posts', c.postId), { commentCount: increment(1) });
  }
}