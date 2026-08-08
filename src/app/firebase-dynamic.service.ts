import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const STORAGE_KEY = 'premolex_firebase_config';

/**
 * FirebaseDynamicService
 *
 * Dynamically initializes Firebase from credentials stored in localStorage.
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
      this.initializeDynamicFirebase();
    }
  }

  /**
   * Reads the config from localStorage and initializes Firebase if present.
   * Called automatically on app load (constructor).
   */
  initializeDynamicFirebase(): boolean {
    const config = this.getConfig();
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
      console.log('[FirebaseDynamicService] Firebase initialized from localStorage.');
      return true;
    } catch (error) {
      console.error('[FirebaseDynamicService] Firebase initialization failed:', error);
      this.isConnected.set(false);
      return false;
    }
  }

  /**
   * Saves the Firebase config to localStorage and initializes Firebase.
   * Returns true on success.
   */
  saveConfig(config: FirebaseConfig): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return this.initializeDynamicFirebase();
    } catch (error) {
      console.error('[FirebaseDynamicService] Failed to save config:', error);
      this.isConnected.set(false);
      return false;
    }
  }

  /** Returns the saved Firebase config from localStorage, or null. */
  getConfig(): FirebaseConfig | null {
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

  /** Removes the config from localStorage and disconnects Firebase. */
  clearConfig(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.app = null;
    this.db = null;
    this.storage = null;
    this.auth = null;
    this.isConnected.set(false);
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