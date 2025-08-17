import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../core/api/posts.service.js';
import { AuthService } from '../../core/auth/auth.service.js';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Post } from '../../core/models/post.js';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './post-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private posts = inject(PostsService);
  private auth = inject(AuthService);

  id = this.route.snapshot.paramMap.get('id');
  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    mediaUrl: ['']
  });

  ngOnInit() {
    if (this.id) this.posts.byId(this.id).subscribe(p => p && this.form.patchValue(p));
  }

  async save() {
  const user = await this.auth.user$.pipe(switchMap(u => of(u))).toPromise();
  if (!user) return;

  const v = this.form.value;
  const payload = {
    title: v.title ?? '',
    content: v.content ?? '',
    mediaUrl: v.mediaUrl?.trim() ? v.mediaUrl.trim() : undefined,
    authorId: user.uid,
    authorName: user.email ?? 'User'
  } as Omit<Post, 'id'|'createdAt'|'updatedAt'|'likeCount'|'commentCount'>;

  if (this.id) await this.posts.update(this.id, payload);
  else await this.posts.create(payload);
  this.router.navigate(['/me']);
}
}