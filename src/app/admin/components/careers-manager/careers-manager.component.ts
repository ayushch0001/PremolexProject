import { Component, inject, signal, computed, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreCareer,
} from '../../../services/firestore-data.service';

@Component({
  selector: 'app-careers-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './careers-manager.component.html',
  styleUrls: ['./careers-manager.component.css'],
})
export class CareersManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly showForm = signal(false);
  readonly editingCareer = signal<FirestoreCareer | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly careers = signal<FirestoreCareer[]>([]);
  private readonly subscriptions = new Subscription();

  /** Reference to the contenteditable requirements editor. */
  @ViewChild('requirementsEditor') requirementsEditorRef?: ElementRef<HTMLDivElement>;

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    department: ['', [Validators.required]],
    location: ['', [Validators.required]],
    shortDescription: ['', [Validators.required, Validators.maxLength(300)]],
    requirements: ['', [Validators.required, Validators.minLength(20)]],
    status: ['open' as 'open' | 'closed', [Validators.required]],
  });

  readonly rows = computed<FirestoreCareer[]>(() => this.careers());

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
      this.firestoreService.getCareers().subscribe({
        next: (docs) => {
          this.careers.set(docs);
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
    this.editingCareer.set(null);
    this.form.reset({
      title: '',
      department: '',
      location: '',
      shortDescription: '',
      requirements: '',
      status: 'open',
    });
    this.showForm.set(true);
    setTimeout(() => this.syncRequirementsFromControl(), 0);
  }

  openEditForm(career: FirestoreCareer): void {
    this.editingCareer.set(career);
    this.form.patchValue({
      title: career.title,
      department: career.department,
      location: career.location,
      shortDescription: career.shortDescription,
      requirements: career.requirements,
      status: career.status,
    });
    this.showForm.set(true);
    setTimeout(() => this.syncRequirementsFromControl(), 0);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCareer.set(null);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const career = this.editingCareer();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (career?.id) {
      // Update existing job posting.
      this.subscriptions.add(
        this.firestoreService.updateCareer(career.id, value as Partial<Omit<FirestoreCareer, 'id' | 'createdAt'>>).subscribe({
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
      // Add new job posting.
      this.subscriptions.add(
        this.firestoreService.addCareer(value as Omit<FirestoreCareer, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
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

  onDelete(career: FirestoreCareer): void {
    if (!career.id) return;
    if (window.confirm(`Delete job posting "${career.title}"? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteCareer(career.id).subscribe({
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

  // ---- Rich text editor helpers for Requirements ----

  execCmd(command: string, value?: string): void {
    this.requirementsEditorRef?.nativeElement.focus();
    document.execCommand(command, false, value);
    this.syncRequirementsToControl();
  }

  setBlock(tag: string): void {
    this.requirementsEditorRef?.nativeElement.focus();
    document.execCommand('formatBlock', false, tag);
    this.syncRequirementsToControl();
  }

  insertLink(): void {
    const url = window.prompt('Enter URL:');
    if (url) {
      this.execCmd('createLink', url);
    }
  }

  onRequirementsInput(): void {
    this.syncRequirementsToControl();
  }

  private syncRequirementsToControl(): void {
    const html = this.requirementsEditorRef?.nativeElement.innerHTML ?? '';
    this.form.get('requirements')?.setValue(html);
  }

  private syncRequirementsFromControl(): void {
    const html = this.form.get('requirements')?.value ?? '';
    if (this.requirementsEditorRef) {
      this.requirementsEditorRef.nativeElement.innerHTML = html;
    }
  }
}