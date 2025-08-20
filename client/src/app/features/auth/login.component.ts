import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service.js';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    try {
      const { email, password } = this.form.getRawValue();
      console.log('[login] submit', email);
      await firstValueFrom(this.auth.login(email, password));
      console.log('[login] success, navigating /');
      await this.router.navigate(['/']);
    } catch (err: any) {
      console.error('[login] error', err);
      alert('Login failed: ' + (err?.error?.message ?? err?.message ?? 'Unknown error'));
    } finally {
      this.loading = false;
    }
  }
}