import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly currentYear = new Date().getFullYear();

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin']);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(err));
      },
    });
  }

  private getErrorMessage(err: unknown): string {
    // Firebase Identity Toolkit REST API error responses.
    if (err instanceof HttpErrorResponse) {
      const errorBody = err.error as { error?: { message?: string } } | null;
      const code = errorBody?.error?.message ?? '';

      switch (code) {
        case 'EMAIL_NOT_FOUND':
        case 'INVALID_PASSWORD':
        case 'INVALID_LOGIN_CREDENTIALS':
          return 'Invalid email or password. Please try again.';
        case 'INVALID_EMAIL':
          return 'Please enter a valid email address.';
        case 'USER_DISABLED':
          return 'This account has been disabled. Please contact support.';
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
          return 'Too many failed attempts. Please try again later.';
        default:
          if (err.status === 0) {
            return 'Unable to reach the server. Please check your connection and try again.';
          }
          const fallback = (err.error as { error?: { message?: string } } | null)?.error?.message;
          return fallback || 'An unexpected error occurred. Please try again later.';
      }
    }

    // Fallback for non-HTTP errors.
    const error = err as Error | null;
    if (error && error.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again later.';
  }
}