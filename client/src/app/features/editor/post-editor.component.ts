import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { PostsService, Post } from '../../core/api/posts.service.js';
import { AuthService } from '../../core/auth/auth.service.js';

@Component({
  standalone: true,
  selector: 'app-post-editor',
  templateUrl: './post-editor.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  async ngOnInit() {
    if (this.id) {
      const data = await firstValueFrom(this.posts.get(this.id));
      if (data) this.form.patchValue({
        title: data.title ?? '',
        content: data.content ?? '',
        mediaUrl: data.mediaUrl ?? ''
      });
    }
  }

  async save() {
    const user = this.auth.currentUser;
    if (!user) {
     alert('Please log in to create or edit posts.');
     return;
    }

    if (this.form.invalid) {
     this.form.markAllAsTouched();
     return;
    }

    const { title, content, mediaUrl } = this.form.getRawValue();

  // NOTE: do NOT include authorId/authorName; server takes them from the token.
    const payload: { title: string; content: string; mediaUrl?: string | null } = {
  title,
  content,
  mediaUrl: mediaUrl || null,
};

    try {
     if (this.id) {
       await firstValueFrom(this.posts.update(this.id, payload));
     } else {
       await firstValueFrom(this.posts.create(payload));
     }
     this.router.navigate(['/me']);
    } catch (e) {
     console.error(e);
     alert('Failed to save post. Are you logged in? (401 = missing/invalid token)');
    }
  }
}