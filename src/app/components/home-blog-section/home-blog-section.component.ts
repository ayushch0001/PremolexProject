import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlogPost } from '../../admin/models/blog.model';
import { FirestoreDataService, FirestoreBlog } from '../../services/firestore-data.service';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-home-blog-section',
  standalone: true,
  imports: [RouterLink, BlogCardComponent],
  templateUrl: './home-blog-section.component.html',
  styleUrls: ['./home-blog-section.component.css'],
})
export class HomeBlogSectionComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);

  private readonly allPosts = signal<BlogPost[]>([]);
  private readonly subscriptions = new Subscription();

  /** The 3 most recently published blog posts. */
  readonly recentPosts = computed<BlogPost[]>(() =>
    this.allPosts()
      .filter((p) => p.status === 'published')
      .sort((a, b) => {
        const aTime = new Date(a.publishedAt ?? a.createdAt).getTime();
        const bTime = new Date(b.publishedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 3),
  );

  ngOnInit(): void {
    this.subscriptions.add(
      this.firestoreService.getBlogs().subscribe({
        next: (docs) => {
          this.allPosts.set(docs as BlogPost[]);
        },
        error: (err) => {
          console.error('[HomeBlogSection] Failed to load blogs:', err);
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}