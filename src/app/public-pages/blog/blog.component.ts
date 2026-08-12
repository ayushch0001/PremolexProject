import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreDataService } from '../../services/firestore-data.service';
import { BlogPost } from '../../admin/models/blog.model';
import { BlogCardComponent } from '../../components/blog-card/blog-card.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, BlogCardComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent {
  private readonly firestoreService = inject(FirestoreDataService);

  readonly allPosts = signal<BlogPost[]>([]);
  readonly isLoading = signal<boolean>(true);

  readonly publishedPosts = computed<BlogPost[]>(() =>
    this.allPosts()
      .filter((p) => p.status === 'published')
      .sort((a, b) => {
        const aTime = new Date(a.publishedAt ?? a.createdAt).getTime();
        const bTime = new Date(b.publishedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      }),
  );

  constructor() {
    this.firestoreService.getBlogs().subscribe({
      next: (docs) => {
        this.allPosts.set(docs as BlogPost[]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[BlogPage] Failed to load blogs:', err);
        this.isLoading.set(false);
      },
    });
  }
}