import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, tap } from 'rxjs';

export interface AuthUser { id: string; email: string; }
interface AuthResponse { accessToken: string; user: AuthUser; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = 'http://localhost:4000/api';

  private _user$ = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this._user$.asObservable();
  isLoggedIn$ = this.user$.pipe(map(u => !!u));

  private loadUser(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }

  private persist(r: AuthResponse) {
    localStorage.setItem('token', r.accessToken);
    localStorage.setItem('user', JSON.stringify(r.user));
    this._user$.next(r.user);
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/login`, { email, password })
      .pipe(tap(r => this.persist(r)));
  }

  register(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/register`, { email, password })
      .pipe(tap(r => this.persist(r)));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user$.next(null);
  }

  get currentUser() { return this._user$.value; }
  get token() { return localStorage.getItem('token'); }
}
