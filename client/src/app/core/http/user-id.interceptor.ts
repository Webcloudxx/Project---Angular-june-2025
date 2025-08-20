import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service.js';

function getCurrentUserId(): string | undefined {
  try {
    const auth = inject(AuthService);
    const me = (auth as any).currentUserSnapshot?.() ?? (auth as any).currentUserValue ?? undefined;
    if (me?.id) return String(me.id);
    if (me?.uid) return String(me.uid);
  } catch {}
  try {
    const raw = localStorage.getItem('me');
    if (raw) {
      const me = JSON.parse(raw);
      if (me?.id) return String(me.id);
      if (me?.uid) return String(me.uid);
    }
  } catch {}
  return undefined;
}

export const userIdInterceptor: HttpInterceptorFn = (req, next) => {
  const userId = getCurrentUserId();
  const isApi = req.url.startsWith('http://localhost:4000/') || req.url.includes('/api/');
  if (!isApi || !userId) return next(req);

  const cloned = req.clone({
    setHeaders: { 'x-user-id': userId }
  });
  return next(cloned);
};