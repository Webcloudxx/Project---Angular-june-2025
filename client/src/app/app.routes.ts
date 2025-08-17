import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard.js'; //'./core/auth/auth.guard'
import { GuestGuard } from './core/auth/guest.guard.js';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/catalog/catalog.component.js').then(m => m.CatalogComponent) },
  { path: 'posts/:id', loadComponent: () => import('./features/details/post-details.component.js').then(m => m.PostDetailsComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search.component.js').then(m => m.SearchComponent) },
  { path: 'me', canActivate: [AuthGuard], loadComponent: () => import('./features/my-posts/my-posts.component.js').then(m => m.MyPostsComponent) },
  { path: 'create', canActivate: [AuthGuard], loadComponent: () => import('./features/editor/post-editor.component.js').then(m => m.PostEditorComponent) },
  { path: 'edit/:id', canActivate: [AuthGuard], loadComponent: () => import('./features/editor/post-editor.component.js').then(m => m.PostEditorComponent) },
  { path: 'login', canActivate: [GuestGuard], loadComponent: () => import('./features/auth/login.component.js').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [GuestGuard], loadComponent: () => import('./features/auth/register.component.js').then(m => m.RegisterComponent) },
  { path: '**', redirectTo: '' }
];