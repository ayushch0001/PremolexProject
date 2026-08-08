import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreCareer,
} from '../../services/firestore-data.service';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.css'],
})
export class CareersComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly careers = signal<FirestoreCareer[]>([]);
  readonly expandedId = signal<string | null>(null);

  private readonly subscriptions = new Subscription();

  /** Only show open job postings. */
  readonly openJobs = computed<FirestoreCareer[]>(() =>
    this.careers().filter((job) => job.status === 'open'),
  );

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

  /** Builds a mailto: link with the job title in the subject. */
  getApplyLink(job: FirestoreCareer): string {
    const subject = encodeURIComponent(`Application for ${job.title} - ${job.department}`);
    return `mailto:careers@premolex.com?subject=${subject}`;
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