import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service.js';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]]
  });

  async submit() {
    if (this.form.invalid || this.loading) return;
    const { email, password, confirm } = this.form.getRawValue();
    if (password !== confirm) { alert('Passwords do not match'); return; }

    this.loading = true;
    try {
      await firstValueFrom(this.auth.register(email, password)); // await so token is saved
      await this.router.navigate(['/']);
    } catch (err: any) {
      console.error('[register] error', err);
      alert('Register failed: ' + (err?.error?.message ?? err?.message ?? 'Unknown error'));
    } finally {
      this.loading = false;
    }
  }
}