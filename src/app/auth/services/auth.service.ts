import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { FirebaseDynamicService } from '../../firebase-dynamic.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

const TOKEN_KEY = 'premolex_admin_token';

/**
 * AuthService
 *
 * Handles authentication using Firebase Auth (Email/Password).
 * Stores the Firebase ID token in localStorage and exposes reactive
 * auth state via BehaviorSubjects.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebaseService = inject(FirebaseDynamicService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken(),
  );
  private readonly loggedInSubject = new BehaviorSubject<boolean>(
    this.hasStoredToken(),
  );
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  /** Observable that emits the current auth state (true = logged in). */
  readonly isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  /** Observable that emits the current Firebase ID token (or null). */
  readonly token$: Observable<string | null> = this.tokenSubject.asObservable();

  /** Observable that emits the current Firebase User (or null). */
  readonly user$: Observable<User | null> = this.userSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.listenToAuthState();
    }
  }

  /**
   * Signs in with Firebase Auth (Email/Password).
   * On success, stores the Firebase ID token in localStorage.
   */
  login(credentials: LoginCredentials): Observable<UserCredential> {
    const auth = this.firebaseService.getAuthInstance();
    if (!auth) {
      throw new Error('Database not connected. Please visit /firebase-setup.');
    }

    return from(signInWithEmailAndPassword(auth, credentials.email, credentials.password)).pipe(
      tap((credential) => {
        this.userSubject.next(credential.user);
        // Fetch the ID token and store it.
        credential.user.getIdToken().then((token) => {
          this.setToken(token);
        });
      }),
    );
  }

  /** Signs out of Firebase Auth and clears the stored token. */
  logout(): void {
    const auth = this.firebaseService.getAuthInstance();
    if (auth) {
      signOut(auth).catch((err) => console.error('[AuthService] Sign out failed:', err));
    }
    this.clearToken();
    this.userSubject.next(null);
  }

  /** Returns the current Firebase ID token, or null if not authenticated. */
  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  /** Returns the current Firebase User, or null. */
  getUser(): User | null {
    return this.userSubject.getValue();
  }

  /** Returns true if a token is currently stored. */
  isAuthenticated(): boolean {
    return this.hasStoredToken();
  }

  // ------------------------------------------------------------------ private

  /** Listens to Firebase Auth state changes and updates the reactive state. */
  private listenToAuthState(): void {
    const auth = this.firebaseService.getAuthInstance();
    if (!auth) {
      return;
    }

    onAuthStateChanged(auth, (user) => {
      this.userSubject.next(user);
      if (user) {
        user.getIdToken().then((token) => {
          this.setToken(token);
        });
      } else {
        this.clearToken();
      }
    });
  }

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