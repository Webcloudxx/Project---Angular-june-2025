import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth/auth.service.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav style="background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 24px;display:flex;gap:12px;position:sticky;top:0;">
      <a routerLink="/">Catalog</a>
      <a routerLink="/search">Search</a>
      <a *ngIf="!(auth.isLoggedIn$ | async)" routerLink="/login">Login</a>
      <a *ngIf="!(auth.isLoggedIn$ | async)" routerLink="/register">Register</a>
      <a *ngIf="auth.isLoggedIn$ | async" routerLink="/me">My Posts</a>
      <a *ngIf="auth.isLoggedIn$ | async" routerLink="/create">Create</a>
      <a *ngIf="auth.isLoggedIn$ | async" (click)="logout()">Logout</a>
    </nav>
    <main class="container"><router-outlet></router-outlet></main>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/']);
  }
}