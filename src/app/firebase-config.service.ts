import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {

  private readonly STORAGE_KEY = 'premolex_firebase_config';
  private readonly platformId = inject(PLATFORM_ID);

  // Application state
  isConfigured = signal<boolean>(false);

  private app: FirebaseApp | null = null;
  db: Firestore | null = null;
  storage: FirebaseStorage | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initFromLocalStorage();
    }
  }

  /**
   * Initialize Firebase automatically if config exists
   */
  private initFromLocalStorage(): void {
    const savedConfig = this.getConfig();

    if (savedConfig) {
      this.connectFirebase(savedConfig);
    }
  }

  /**
   * Get Firebase config from localStorage
   */
  getConfig(): FirebaseConfig | null {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const config = localStorage.getItem(this.STORAGE_KEY);

    if (!config) {
      return null;
    }

    try {
      return JSON.parse(config) as FirebaseConfig;
    } catch (error) {
      console.error('Invalid Firebase config found in localStorage.', error);
      return null;
    }
  }

  /**
   * Initialize Firebase
   */
  connectFirebase(config: FirebaseConfig): boolean {

    try {

      // Initialize only once
      this.app = getApps().length
        ? getApp()
        : initializeApp(config);

      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);

      // Save config only in browser
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(config)
        );
      }

      this.isConfigured.set(true);

      console.log('Firebase initialized successfully.');

      return true;

    } catch (error) {

      console.error('Firebase initialization failed:', error);

      this.isConfigured.set(false);

      return false;
    }
  }

  /**
   * Clear saved Firebase configuration
   */
  clearConfig(): void {

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }

    this.app = null;
    this.db = null;
    this.storage = null;

    this.isConfigured.set(false);

    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  /**
   * Get Firestore instance
   */
  getFirestoreInstance(): Firestore | null {
    return this.db;
  }

  /**
   * Get Storage instance
   */
  getStorageInstance(): FirebaseStorage | null {
    return this.storage;
  }

  /**
   * Check whether Firebase is initialized
   */
  isFirebaseConnected(): boolean {
    return this.app !== null;
  }

}