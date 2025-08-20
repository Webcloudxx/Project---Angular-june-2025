import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AuthUser { id: number; email: string; }
interface AuthResponse { accessToken: string; user: AuthUser; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:3000'; // same as server.mjs
  private _user$ = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly user$ = this._user$.asObservable();
  readonly isLoggedIn$ = this.user$.pipe(map(u => !!u));
  get uid() { return this._user$.value ? String(this._user$.value.id) : null; }

  constructor(private http: HttpClient) {}

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) as AuthUser : null;
  }
  private persist(r: AuthResponse) {
    localStorage.setItem('token', r.accessToken);
    localStorage.setItem('user', JSON.stringify(r.user));
    this._user$.next(r.user);
  }

  async register(email: string, password: string) {
    const res = await this.http.post<AuthResponse>(`${this.api}/register`, { email, password }).toPromise();
    if (res) this.persist(res);
  }

  async login(email: string, password: string) {
    const res = await this.http.post<AuthResponse>(`${this.api}/login`, { email, password }).toPromise();
    if (res) this.persist(res);
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._user$.next(null);
  }
}
