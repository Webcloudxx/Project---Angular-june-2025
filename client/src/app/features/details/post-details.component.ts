import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { PostsService, Post } from '../../core/api/posts.service.js';
import { AuthService } from '../../core/auth/auth.service.js';

@Component({
  standalone: true,
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailsComponent {
  private route = inject(ActivatedRoute);
  private posts = inject(PostsService);
  private auth = inject(AuthService);

  id: string = this.route.snapshot.paramMap.get('id')!;

  post$: Observable<Post> = this.posts.get(this.id);

  me$ = this.auth.user$ as Observable<{ id?: string; email?: string } | null>;

  async toggleLike() {
    const p = await firstValueFrom(this.post$);
    if (!p?.id) return;
    this.post$ = this.posts.likeToggle(p.id);
  }
}