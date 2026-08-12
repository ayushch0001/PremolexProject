import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreContactQuery,
} from '../../../services/firestore-data.service';

@Component({
  selector: 'app-contact-queries-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-queries-manager.component.html',
  styleUrls: ['./contact-queries-manager.component.css'],
})
export class ContactQueriesManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly selectedQuery = signal<FirestoreContactQuery | null>(null);
  readonly showDetail = signal(false);

  readonly queries = signal<FirestoreContactQuery[]>([]);
  private readonly subscriptions = new Subscription();

  readonly statusForm: FormGroup = this.fb.group({
    status: ['new', [Validators.required]],
    notes: [''],
  });

  readonly rows = computed<FirestoreContactQuery[]>(() => this.queries());

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
      this.firestoreService.getContactQueries().subscribe({
        next: (docs) => {
          this.queries.set(docs);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  openDetail(query: FirestoreContactQuery): void {
    this.selectedQuery.set(query);
    this.statusForm.patchValue({
      status: query.status,
      notes: query.notes,
    });
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.selectedQuery.set(null);
  }

  onUpdateStatus(): void {
    const query = this.selectedQuery();
    if (!query?.id) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const data = {
      status: this.statusForm.value.status,
      notes: this.statusForm.value.notes,
    };

    this.subscriptions.add(
      this.firestoreService.updateContactQuery(query.id, data).subscribe({
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

  onDelete(query: FirestoreContactQuery): void {
    if (!query.id) return;
    if (window.confirm(`Delete query from ${query.name}? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteContactQuery(query.id).subscribe({
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
      case 'closed': return 'status-closed';
      default: return 'status-new';
    }
  }
}