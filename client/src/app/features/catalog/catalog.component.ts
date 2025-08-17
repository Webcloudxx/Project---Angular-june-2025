import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { PostsService } from '../../core/api/posts.service.js';
import { AsyncPipe, NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe.js';

@Component({
  standalone: true,
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  imports: [NgIf, NgFor, AsyncPipe, RouterLink, DatePipe, TruncatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit {
  private posts = inject(PostsService);
  vm$ = this.posts.list();              
  ngOnInit() {}                         
}