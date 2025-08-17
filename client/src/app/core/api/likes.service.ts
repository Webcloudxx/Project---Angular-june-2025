import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, deleteDoc, getDoc, updateDoc, increment } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class LikesService {
  private fs = inject(Firestore);

  likeKey(postId: string, uid: string) { return `posts/${postId}/likes/${uid}`; }

  async toggle(postId: string, uid: string) {
    const ref = doc(this.fs, this.likeKey(postId, uid));
    const exists = (await getDoc(ref)).exists();
    if (exists) {
      await deleteDoc(ref);
      await updateDoc(doc(this.fs, 'posts', postId), { likeCount: increment(-1) });
      return { liked: false };
    } else {
      await setDoc(ref, { createdAt: Date.now(), uid });
      await updateDoc(doc(this.fs, 'posts', postId), { likeCount: increment(1) });
      return { liked: true };
    }
  }
}