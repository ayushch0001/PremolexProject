import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreJobApplication,
} from '../../../services/firestore-data.service';

@Component({
  selector: 'app-job-applications-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-applications-manager.component.html',
  styleUrls: ['./job-applications-manager.component.css'],
})
export class JobApplicationsManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedApplication = signal<FirestoreJobApplication | null>(null);
  readonly showDetail = signal(false);

  readonly applications = signal<FirestoreJobApplication[]>([]);
  private readonly subscriptions = new Subscription();

  readonly statusForm: FormGroup = this.fb.group({
    status: ['new', [Validators.required]],
    notes: [''],
  });

  readonly rows = computed<FirestoreJobApplication[]>(() => this.applications());

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
      this.firestoreService.getJobApplications().subscribe({
        next: (docs) => {
          this.applications.set(docs);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  openDetail(app: FirestoreJobApplication): void {
    this.selectedApplication.set(app);
    this.statusForm.patchValue({
      status: app.status,
      notes: app.notes,
    });
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.selectedApplication.set(null);
  }

  onUpdateStatus(): void {
    const app = this.selectedApplication();
    if (!app?.id) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const data = {
      status: this.statusForm.value.status,
      notes: this.statusForm.value.notes,
    };

    this.subscriptions.add(
      this.firestoreService.updateJobApplication(app.id, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeDetail();
          this.refresh();
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  onDelete(app: FirestoreJobApplication): void {
    if (!app.id) return;
    if (window.confirm(`Delete application from ${app.applicantName}? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteJobApplication(app.id).subscribe({
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'new': return 'status-new';
      case 'reviewed': return 'status-reviewed';
      case 'contacted': return 'status-contacted';
      case 'rejected': return 'status-rejected';
      case 'hired': return 'status-hired';
      default: return 'status-new';
    }
  }
}