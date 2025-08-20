import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PostsService, Post } from '../../core/api/posts.service.js';
import { CommentsService } from '../../core/api/comments.service.js';
import { AuthService } from '../../core/auth/auth.service.js';

@Component({
  standalone: true,
  selector: 'app-post-details',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailsComponent {
  private route = inject(ActivatedRoute);
  private posts = inject(PostsService);
  private comments = inject(CommentsService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  id = this.route.snapshot.paramMap.get('id')!;
  post$ = this.posts.byId(this.id);
  comments$ = this.comments.listForPost(this.id);

  form = this.fb.nonNullable.group({
    text: ['', [Validators.required, Validators.minLength(2)]]
  });

  async toggleLike() {
    const p = await firstValueFrom(this.post$);
    await firstValueFrom(
      this.posts.update(p.id, { likeCount: (p.likeCount ?? 0) + 1 })
    );
    this.post$ = this.posts.byId(this.id);
  }

  async addComment() {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) { alert('Please login to comment.'); return; }

    const raw = (this.form.controls.text.value ?? '').trim();
    if (!raw) return;

    await firstValueFrom(this.comments.add({
      postId: this.id,
      text: raw,
      authorId: String(user.id),
      authorName: user.email || 'User'
    }));

    this.form.reset({ text: '' });
    this.comments$ = this.comments.listForPost(this.id);
  }
}