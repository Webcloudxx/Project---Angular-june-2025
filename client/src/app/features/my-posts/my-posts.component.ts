import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service.js';
import { PostsService } from '../../core/api/posts.service.js';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-my-posts',
  templateUrl: './my-posts.component.html',
  imports: [NgIf, NgFor, AsyncPipe, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyPostsComponent implements OnInit {
  private auth = inject(AuthService);
  private posts = inject(PostsService);

  vm$!: Observable<any[]>;

  ngOnInit() {
    this.vm$ = this.auth.user$.pipe(
      switchMap(u => u ? this.posts.byAuthor(u.uid) : of([])),
      map(items => items ?? [])
    );
  }

  async delete(id: string) {
    if (!confirm('Delete this post?')) return;
    await this.posts.delete(id);
  }
}