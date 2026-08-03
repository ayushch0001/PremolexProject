import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const TOKEN_KEY = 'premolex_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken(),
  );
  private readonly loggedInSubject = new BehaviorSubject<boolean>(
    this.hasStoredToken(),
  );

  /** Observable that emits the current auth state (true = logged in). */
  readonly isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  /** Observable that emits the current JWT (or null). */
  readonly token$: Observable<string | null> = this.tokenSubject.asObservable();

  /**
   * Calls POST /auth/login on the backend and stores the returned JWT.
   * Emits the updated auth state immediately on success.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.token);
        }),
      );
  }

  /** Clears the stored token and updates auth state. */
  logout(): void {
    this.clearToken();
  }

  /** Returns the current JWT, or null if not authenticated. */
  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  /** Returns true if a token is currently stored. */
  isAuthenticated(): boolean {
    return this.hasStoredToken();
  }

  // ------------------------------------------------------------------ private

  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this.tokenSubject.next(token);
    this.loggedInSubject.next(true);
  }

  private clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    this.tokenSubject.next(null);
    this.loggedInSubject.next(false);
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private hasStoredToken(): boolean {
    return this.getStoredToken() !== null;
  }
}