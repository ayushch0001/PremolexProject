import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreCareer,
  FirestoreJobApplication,
} from '../../services/firestore-data.service';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.css'],
})
export class CareersComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly careers = signal<FirestoreCareer[]>([]);
  readonly expandedId = signal<string | null>(null);

  // Apply form state
  readonly showApplyForm = signal(false);
  readonly applyingJob = signal<FirestoreCareer | null>(null);
  readonly isSubmitting = signal(false);
  readonly isSubmitted = signal(false);
  readonly submitError = signal<string | null>(null);

  private readonly subscriptions = new Subscription();

  /** Only show open job postings. */
  readonly openJobs = computed<FirestoreCareer[]>(() =>
    this.careers().filter((job) => job.status === 'open'),
  );

  readonly applyForm: FormGroup = this.fb.group({
    applicantName: ['', [Validators.required, Validators.minLength(2)]],
    applicantEmail: ['', [Validators.required, Validators.email]],
    applicantPhone: ['', [Validators.required, Validators.pattern(/^[+\d\s-]{10,15}$/)]],
    coverLetter: ['', [Validators.required, Validators.minLength(20)]],
  });

  ngOnInit(): void {
    this.loadCareers();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleAccordion(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  isExpanded(id: string): boolean {
    return this.expandedId() === id;
  }

  /** Sanitizes the requirements HTML for safe rendering. */
  sanitizeRequirements(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /** Opens the apply form for a specific job. */
  openApplyForm(job: FirestoreCareer): void {
    this.applyingJob.set(job);
    this.showApplyForm.set(true);
    this.isSubmitted.set(false);
    this.submitError.set(null);
    this.applyForm.reset();
  }

  /** Closes the apply form. */
  closeApplyForm(): void {
    this.showApplyForm.set(false);
    this.applyingJob.set(null);
    this.isSubmitted.set(false);
    this.submitError.set(null);
  }

  /** Submits the job application to Firestore. */
  onSubmitApplication(): void {
    if (this.applyForm.invalid) {
      Object.keys(this.applyForm.controls).forEach((key) => {
        this.applyForm.get(key)?.markAsTouched();
      });
      return;
    }

    const job = this.applyingJob();
    if (!job?.id) return;

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const application: Omit<FirestoreJobApplication, 'id' | 'createdAt' | 'updatedAt'> = {
      jobId: job.id,
      jobTitle: job.title,
      applicantName: this.applyForm.value.applicantName,
      applicantEmail: this.applyForm.value.applicantEmail,
      applicantPhone: this.applyForm.value.applicantPhone,
      coverLetter: this.applyForm.value.coverLetter,
      resumeUrl: null,
      status: 'new',
      notes: '',
    };

    this.subscriptions.add(
      this.firestoreService.addJobApplication(application).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isSubmitted.set(true);
          this.applyForm.reset();
        },
        error: (err: Error) => {
          this.isSubmitting.set(false);
          this.submitError.set(err.message);
        },
      }),
    );
  }

  get f() {
    return this.applyForm.controls;
  }

  private loadCareers(): void {
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
}