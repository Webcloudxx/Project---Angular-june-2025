import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service.js';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn$.pipe(map(ok => ok ? true : router.parseUrl('/login')));
};

export const GuestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn$.pipe(map(ok => ok ? router.parseUrl('/') : true));
};