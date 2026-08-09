import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FirestoreDataService } from '../../services/firestore-data.service';
import { BlogPost } from '../../admin/models/blog.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
})
export class BlogDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly post = signal<BlogPost | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadPost(slug);
    } else {
      this.error.set('Invalid blog post URL');
      this.isLoading.set(false);
    }
  }

  private loadPost(slug: string): void {
    this.firestoreService.getBlogs().subscribe({
      next: (posts) => {
        const found = (posts as BlogPost[]).find((p) => p.slug === slug);
        if (found) {
          this.post.set(found);
        } else {
          this.error.set('Blog post not found');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('[BlogDetail] Failed to load post:', err);
        this.error.set('Failed to load blog post');
        this.isLoading.set(false);
      },
    });
  }

  readonly formattedDate = computed(() => {
    const p = this.post();
    if (!p) return '';
    const date = new Date(p.publishedAt ?? p.createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
}