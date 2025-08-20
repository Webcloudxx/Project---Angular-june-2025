import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (req.method !== 'GET') {
    console.log('[AuthInterceptor]', req.method, req.url, token ? 'token ✓' : 'token ✗');
  }

  return token
    ? next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
    : next(req);
};