import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseDynamicService, FirebaseConfig } from '../../firebase-dynamic.service';

@Component({
  selector: 'app-firebase-setup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './firebase-setup.component.html',
  styleUrls: ['./firebase-setup.component.css'],
})
export class FirebaseSetupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly firebaseService = inject(FirebaseDynamicService);

  readonly setupForm = this.fb.nonNullable.group({
    apiKey: ['', Validators.required],
    authDomain: ['', Validators.required],
    projectId: ['', Validators.required],
    storageBucket: ['', Validators.required],
    messagingSenderId: ['', Validators.required],
    appId: ['', Validators.required],
  });

  readonly isSaving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  /** Reactive connection state from the service. */
  readonly isConnected = this.firebaseService.isConnected;

  ngOnInit(): void {
    // Pre-fill the form if a config already exists in localStorage.
    const existing = this.firebaseService.getConfig();
    if (existing) {
      this.setupForm.patchValue(existing);
    }
  }

  onSubmit(): void {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const config: FirebaseConfig = this.setupForm.getRawValue();

    // Small delay so the spinner is visible and the UI feels responsive.
    setTimeout(() => {
      const success = this.firebaseService.saveConfig(config);
      this.isSaving.set(false);

      if (success) {
        this.successMessage.set('Firebase connected successfully. Credentials saved to localStorage.');
      } else {
        this.errorMessage.set('Failed to connect to Firebase. Please verify your credentials and try again.');
      }
    }, 600);
  }

  onDisconnect(): void {
    if (window.confirm('Are you sure you want to remove the Firebase configuration? You will need to re-enter your credentials.')) {
      this.firebaseService.clearConfig();
      this.setupForm.reset();
      this.successMessage.set(null);
      this.errorMessage.set(null);
    }
  }
}