import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import { FirestoreDataService, FirestoreProject } from '../../services/firestore-data.service';

export interface ProjectItem {
  title: string;
  category: string;
  image: string;
}

@Component({
  selector: 'app-project-gallery',
  standalone: true,
  imports: [CommonModule, ScrollAnimateDirective],
  templateUrl: './project-gallery.component.html',
  styleUrls: ['./project-gallery.component.css'],
})
export class ProjectGalleryComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);

  private readonly allProjects = signal<FirestoreProject[]>([]);
  private readonly subscriptions = new Subscription();

  /** Projects from Firestore, mapped to the template's expected shape. */
  readonly projects = computed<ProjectItem[]>(() =>
    this.allProjects().map((p) => ({
      title: p.title,
      category: p.category,
      image: p.image,
    })),
  );

  ngOnInit(): void {
    this.subscriptions.add(
      this.firestoreService.getProjects().subscribe({
        next: (docs) => {
          this.allProjects.set(docs);
        },
        error: (err) => {
          console.error('[ProjectGallery] Failed to load projects:', err);
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}