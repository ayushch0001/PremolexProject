import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response shape from the Firebase Identity Toolkit endpoint
 * `accounts:signInWithPassword` (the "createdLoginCredentials" cURL).
 */
export interface LoginResponse {
  kind: string;
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  registered: boolean;
  refreshToken: string;
  expiresIn: string;
}

const TOKEN_KEY = 'premolex_admin_token';

/**
 * AuthService
 *
 * Authenticates against the Firebase Identity Toolkit REST API
 * (`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<API_KEY>`).
 *
 * On success the returned `idToken` is stored in localStorage (key
 * `premolex_admin_token`) and used for route guarding + HTTP interception.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken(),
  );
  private readonly loggedInSubject = new BehaviorSubject<boolean>(
    this.hasStoredToken(),
  );

  /** Observable that emits the current auth state (true = logged in). */
  readonly isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  /** Observable that emits the current Firebase ID token (or null). */
  readonly token$: Observable<string | null> = this.tokenSubject.asObservable();

  /** The Firebase web API key used for the Identity Toolkit call. */
  private readonly apiKey = environment.firebaseConfig.apiKey;

  /** Base URL for the Firebase Identity Toolkit v1 API. */
  private readonly identityToolkitUrl =
    'https://identitytoolkit.googleapis.com/v1';

  /**
   * Signs in using the Firebase Identity Toolkit REST endpoint.
   * On success, stores the returned `idToken` in localStorage.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const url = `${this.identityToolkitUrl}/accounts:signInWithPassword?key=${this.apiKey}`;

    return this.http
      .post<LoginResponse>(url, {
        email: credentials.email,
        password: credentials.password,
        returnSecureToken: true,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.idToken);
        }),
      );
  }

  /** Clears the stored token and resets auth state. */
  logout(): void {
    this.clearToken();
  }

  /** Returns the current Firebase ID token, or null if not authenticated. */
  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  /** Returns true if a token is currently stored. */
  isAuthenticated(): boolean {
    return this.hasStoredToken();
  }

  // ------------------------------------------------------------------ private

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    this.tokenSubject.next(token);
    this.loggedInSubject.next(true);
  }

  private clearToken(): void {
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
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