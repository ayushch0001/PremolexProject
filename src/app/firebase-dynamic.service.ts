import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';
import { environment } from '../environments/environment';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY = 'premolex_firebase_config';

/**
 * FirebaseDynamicService
 *
 * Initializes Firebase using the hardcoded credentials from `environment.firebaseConfig`
 * (public keys — safe to ship in the client). A localStorage config can optionally
 * override the environment config (legacy dynamic-setup support).
 *
 * Uses the standard Firebase JS Web SDK (`firebase/app`, `firebase/firestore`)
 * instead of `@angular/fire` to avoid environment injection errors.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseDynamicService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Reactive connection state (true = Firebase is connected). */
  readonly isConnected = signal<boolean>(false);

  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private storage: FirebaseStorage | null = null;
  private auth: Auth | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFirebase();
    }
  }

  /**
   * Initializes Firebase. Priority:
   *   1. localStorage config (if present) — legacy dynamic setup override.
   *   2. environment.firebaseConfig (default, hardcoded public keys).
   */
  initializeFirebase(): boolean {
    let config: FirebaseConfig | null = this.getLocalStorageConfig();
    if (!config) {
      config = environment.firebaseConfig as FirebaseConfig;
    }
    if (!config) {
      this.isConnected.set(false);
      return false;
    }

    try {
      // Initialize only once — reuse an existing app if already created.
      this.app = getApps().length ? getApp() : initializeApp(config);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      this.auth = getAuth(this.app);
      this.isConnected.set(true);
      console.log('[FirebaseDynamicService] Firebase initialized.');
      return true;
    } catch (error) {
      console.error('[FirebaseDynamicService] Firebase initialization failed:', error);
      this.isConnected.set(false);
      return false;
    }
  }

  /**
   * Saves a config override to localStorage and re-initializes Firebase.
   * Pass `null` to clear the override and fall back to environment config.
   */
  saveConfig(config: FirebaseConfig | null): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      if (config) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return this.initializeFirebase();
    } catch (error) {
      console.error('[FirebaseDynamicService] Failed to save config:', error);
      this.isConnected.set(false);
      return false;
    }
  }

  /** Returns the current effective Firebase config (env default, overridden by localStorage). */
  getConfig(): FirebaseConfig {
    return this.getLocalStorageConfig() ?? (environment.firebaseConfig as FirebaseConfig);
  }

  /** Reads the optional localStorage override, or null. */
  getLocalStorageConfig(): FirebaseConfig | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as FirebaseConfig;
    } catch (error) {
      console.error('[FirebaseDynamicService] Invalid config in localStorage:', error);
      return null;
    }
  }

  /** Removes the localStorage override and re-initializes with environment config. */
  clearConfig(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Re-initialize from the environment config instead of disconnecting.
    this.initializeFirebase();
  }

  /** Returns the Firestore instance, or null if not connected. */
  getFirestoreInstance(): Firestore | null {
    return this.db;
  }

  /** Returns the Storage instance, or null if not connected. */
  getStorageInstance(): FirebaseStorage | null {
    return this.storage;
  }

  /** Returns the Auth instance, or null if not connected. */
  getAuthInstance(): Auth | null {
    return this.auth;
  }

  /** Returns true if Firebase is currently connected. */
  isFirebaseConnected(): boolean {
    return this.app !== null;
  }
}