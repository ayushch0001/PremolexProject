import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
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
    // Firebase Auth error codes.
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          return 'Invalid email or password. Please try again.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
          return 'Unable to reach the server. Please check your connection and try again.';
        default:
          return err.message || 'An unexpected error occurred. Please try again later.';
      }
    }

    // Fallback for non-Firebase errors (e.g. database not connected).
    if (err instanceof Error) {
      return err.message;
    }

    return 'An unexpected error occurred. Please try again later.';
  }
}