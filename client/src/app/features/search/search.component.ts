import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgFor, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../core/api/posts.service.js';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-search',
  imports: [ReactiveFormsModule, NgFor, AsyncPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h1>Search</h1>
      <input [formControl]="q" placeholder="Search titles..." />
      <ul>
        <li *ngFor="let p of (vm$ | async)">
          <a [routerLink]="['/posts', p.id]"><strong>{{ p.title }}</strong></a>
        </li>
      </ul>
    </section>
  `
})
export class SearchComponent {
  q = new FormControl('');
  vm$ = this.q.valueChanges.pipe(
    startWith(''),
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(text => this.posts.list().pipe(
      map(items =>
        (text ? items.filter(i => i.title?.toLowerCase().includes(text!.toLowerCase())) : items)
      )
    ))
  );
  constructor(private posts: PostsService) {}
}