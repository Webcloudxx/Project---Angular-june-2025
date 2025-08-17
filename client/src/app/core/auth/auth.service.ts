import { inject, Injectable } from '@angular/core';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { map, shareReplay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  user$ = authState(this.auth).pipe(shareReplay({ bufferSize:1, refCount:true }));
  isLoggedIn$ = this.user$.pipe(map(u => !!u));
  get uid() { return this.auth.currentUser?.uid ?? null; }

  login(email: string, pass: string) { return signInWithEmailAndPassword(this.auth, email, pass); }
  register(email: string, pass: string) { return createUserWithEmailAndPassword(this.auth, email, pass); }
  logout() { return signOut(this.auth); }
}