import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService, Post } from '../../core/api/posts.service.js';

@Component({
  standalone: true,
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  imports: [NgFor, NgIf, AsyncPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent {
  private posts = inject(PostsService);
  vm$ = this.posts.all();
}