import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service.js';
import { PostsService } from '../../core/api/posts.service.js';

@Component({
  standalone: true,
  selector: 'app-post-editor',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2>{{ id ? 'Edit post' : 'Create post' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Title
        <input formControlName="title" />
      </label>
      <label>Content
        <textarea rows="6" formControlName="content"></textarea>
      </label>
      <label>Media URL (optional)
        <input formControlName="mediaUrl" />
      </label>

      <div style="display:flex; gap:8px; margin-top:10px;">
        <button type="submit" [disabled]="form.invalid">{{ id ? 'Update' : 'Create' }}</button>
        <a class="btn-ghost" routerLink="/me">Cancel</a>
      </div>
    </form>
  `
})
export class PostEditorComponent {
  private fb = inject(FormBuilder);
  private posts = inject(PostsService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id = this.route.snapshot.paramMap.get('id');

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    mediaUrl: ['']
  });

  constructor() {
      if (this.id) {
    this.posts.byId(this.id).subscribe(p => this.form.patchValue(p));
      }
  }

  async save() {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) { alert('You must be logged in.'); return; }

    const v = this.form.getRawValue();
    const payload = {
      title: v.title!,
      content: v.content!,
      mediaUrl: v.mediaUrl?.trim() || undefined,
      authorId: String(user.id),
      authorName: user.email || 'User'
    };

    if (this.id) {
      await firstValueFrom(this.posts.update(this.id, payload));
    } else {
      await firstValueFrom(this.posts.create(payload as any));
    }
    this.router.navigate(['/me']);
  }
}