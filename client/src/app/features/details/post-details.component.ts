import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '../../core/api/posts.service.js';
import { CommentsService } from '../../core/api/comments.service.js';
import { LikesService } from '../../core/api/likes.service.js';
import { AuthService } from '../../core/auth/auth.service.js';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  standalone: true,
  templateUrl: './post-details.component.html',
  imports: [NgIf, NgFor, AsyncPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailsComponent {
  private route = inject(ActivatedRoute);
  private posts = inject(PostsService);
  private comments = inject(CommentsService);
  private likes = inject(LikesService);
  private auth = inject(AuthService);

  id = this.route.snapshot.paramMap.get('id')!;
  post$ = this.posts.byId(this.id);
  comments$ = this.comments.listForPost(this.id);

  async addComment(text: string) {
    const user = await this.auth.user$.pipe(switchMap(u => of(u))).toPromise();
    if (!user) return;
    await this.comments.add({
      postId: this.id,
      authorId: user.uid,
      authorName: user.email ?? 'User',
      text
    });
  }

  async toggleLike() {
    const uid = this.auth.uid; if (!uid) return;
    await this.likes.toggle(this.id, uid);
  }
}