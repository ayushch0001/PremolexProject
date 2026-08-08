import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FirestoreDataService, FirestoreSitePage } from '../../services/firestore-data.service';

@Component({
  selector: 'app-infrastructure',
  standalone: true,
  templateUrl: './infrastructure.component.html',
  styleUrls: ['./infrastructure.component.css'],
})
export class InfrastructureComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly pageTitle = signal('Infrastructure');
  readonly pageContent = signal<SafeHtml>('');

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadPage();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadPage(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.subscriptions.add(
      this.firestoreService.getSitePage('infrastructure').subscribe({
        next: (page: FirestoreSitePage | null) => {
          this.isLoading.set(false);
          if (page) {
            this.pageTitle.set(page.title);
            this.pageContent.set(this.sanitizer.bypassSecurityTrustHtml(page.content));
          } else {
            this.pageContent.set(this.sanitizer.bypassSecurityTrustHtml(
              '<p>Infrastructure content is being prepared. Please check back soon.</p>',
            ));
          }
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }
}