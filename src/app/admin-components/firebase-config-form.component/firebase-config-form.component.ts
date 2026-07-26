import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseConfigService } from '../../firebase-config.service';

@Component({
  selector: 'app-firebase-config-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './firebase-config-form.component.html'
})
export class FirebaseConfigFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public firebaseService = inject(FirebaseConfigService);

  configForm: FormGroup = this.fb.group({
    apiKey: ['', Validators.required],
    authDomain: ['', Validators.required],
    projectId: ['', Validators.required],
    storageBucket: ['', Validators.required],
    messagingSenderId: ['', Validators.required],
    appId: ['', Validators.required]
  });

  ngOnInit(): void {
    // Populate form if keys already exist in LocalStorage
    const existingConfig = this.firebaseService.getConfig();
    if (existingConfig) {
      this.configForm.patchValue(existingConfig);
    }
  }

  onSaveConfig(): void {
    if (this.configForm.valid) {
      const success = this.firebaseService.connectFirebase(this.configForm.value);
      if (success) {
        alert('Database connected and credentials saved to LocalStorage!');
      } else {
        alert('Failed to connect to Firebase. Check your keys.');
      }
    }
  }

  onDisconnect(): void {
    if (confirm('Are you sure you want to remove the database configuration?')) {
      this.firebaseService.clearConfig();
    }
  }
}