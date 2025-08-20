import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

export interface AuthUser { id: string; email: string }
const API = 'http://localhost:4000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user$ = new BehaviorSubject<AuthUser | null>(null);

  user$ = this._user$.asObservable();
  isLoggedIn$ = this.user$.pipe(tap());

  constructor() {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (raw && token) this._user$.next(JSON.parse(raw));
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${API}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._user$.next(res.user);
      })
    );
  }

  register(email: string, password: string) {
    return this.http.post<{ token: string; user: AuthUser }>(`${API}/register`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._user$.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user$.next(null);
  }

  get token(): string | null { return localStorage.getItem('token'); }
  get currentUser(): AuthUser | null { return this._user$.value; }
}
