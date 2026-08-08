import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreCertificate,
} from '../../services/firestore-data.service';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css'],
})
export class CertificatesComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly certificates = signal<FirestoreCertificate[]>([]);
  readonly lightboxCert = signal<FirestoreCertificate | null>(null);

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadCertificates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openLightbox(cert: FirestoreCertificate): void {
    this.lightboxCert.set(cert);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxCert.set(null);
    document.body.style.overflow = '';
  }

  private loadCertificates(): void {
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
}