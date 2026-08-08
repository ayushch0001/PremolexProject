import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreCertificate,
} from '../../../services/firestore-data.service';

@Component({
  selector: 'app-certificate-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './certificate-manager.component.html',
  styleUrls: ['./certificate-manager.component.css'],
})
export class CertificateManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly showForm = signal(false);
  readonly editingCertificate = signal<FirestoreCertificate | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly certificates = signal<FirestoreCertificate[]>([]);
  private readonly subscriptions = new Subscription();

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    issueYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
    imageUrl: [null as string | null],
    imageName: [null as string | null],
  });

  readonly rows = computed<FirestoreCertificate[]>(() => this.certificates());

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.subscriptions.add(
      this.firestoreService.getCertificates().subscribe({
        next: (docs) => {
          this.certificates.set(docs);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  openAddForm(): void {
    this.editingCertificate.set(null);
    this.form.reset({
      title: '',
      description: '',
      issueYear: new Date().getFullYear(),
      imageUrl: null,
      imageName: null,
    });
    this.showForm.set(true);
  }

  openEditForm(cert: FirestoreCertificate): void {
    this.editingCertificate.set(cert);
    this.form.patchValue({
      title: cert.title,
      description: cert.description,
      issueYear: cert.issueYear,
      imageUrl: cert.imageUrl,
      imageName: cert.imageName,
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCertificate.set(null);
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Store as a data URL (local preview / placeholder for Firebase Storage upload).
      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          this.form.patchValue({
            imageUrl: dataUrl,
            imageName: file.name,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(): void {
    this.form.patchValue({ imageUrl: null, imageName: null });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const cert = this.editingCertificate();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (cert?.id) {
      // Update existing certificate.
      this.subscriptions.add(
        this.firestoreService.updateCertificate(cert.id, value as Partial<Omit<FirestoreCertificate, 'id' | 'createdAt'>>).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.closeForm();
            this.refresh();
          },
          error: (err: Error) => {
            this.isSaving.set(false);
            this.errorMessage.set(err.message);
          },
        }),
      );
    } else {
      // Add new certificate.
      this.subscriptions.add(
        this.firestoreService.addCertificate(value as Omit<FirestoreCertificate, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.closeForm();
            this.refresh();
          },
          error: (err: Error) => {
            this.isSaving.set(false);
            this.errorMessage.set(err.message);
          },
        }),
      );
    }
  }

  onDelete(cert: FirestoreCertificate): void {
    if (!cert.id) return;
    if (window.confirm(`Delete certificate "${cert.title}"? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteCertificate(cert.id).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.refresh();
          },
          error: (err: Error) => {
            this.isSaving.set(false);
            this.errorMessage.set(err.message);
          },
        }),
      );
    }
  }
}