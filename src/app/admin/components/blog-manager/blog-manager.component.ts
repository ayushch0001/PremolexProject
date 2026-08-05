import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BlogPost } from '../../models/blog.model';
import { FirestoreDataService, FirestoreBlog } from '../../../services/firestore-data.service';
import { BlogFormComponent } from '../blog-form/blog-form.component';

@Component({
  selector: 'app-blog-manager',
  standalone: true,
  imports: [BlogFormComponent],
  templateUrl: './blog-manager.component.html',
  styleUrls: ['./blog-manager.component.css'],
})
export class BlogManagerComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);

  readonly showForm = signal(false);
  readonly editingPost = signal<BlogPost | null>(null);

  /** Search query for filtering the table. */
  readonly search = signal('');

  /** Status filter: 'all' | 'published' | 'draft'. */
  readonly statusFilter = signal<'all' | 'published' | 'draft'>('all');

  /** Loading state while fetching from Firestore. */
  readonly isLoading = signal(false);

  /** Loading state while saving/deleting. */
  readonly isSaving = signal(false);

  /** Error message from Firestore operations. */
  readonly errorMessage = signal<string | null>(null);

  private readonly posts = signal<BlogPost[]>([]);
  private readonly subscriptions = new Subscription();

  readonly rows = computed<BlogPost[]>(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.posts().filter((p) => {
      if (status !== 'all' && p.status !== status) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      );
    });
  });

  readonly totalPosts = computed<number>(() => this.posts().length);
  readonly publishedCount = computed<number>(() => this.posts().filter((p) => p.status === 'published').length);
  readonly draftCount = computed<number>(() => this.posts().filter((p) => p.status === 'draft').length);

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
      this.firestoreService.getBlogs().subscribe({
        next: (docs) => {
          this.posts.set(docs as BlogPost[]);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'all' | 'published' | 'draft');
  }

  openAddForm(): void {
    this.editingPost.set(null);
    this.showForm.set(true);
  }

  openEditForm(post: BlogPost): void {
    this.editingPost.set(post);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingPost.set(null);
  }

  onSaved(post: BlogPost): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const { id, ...data } = post;

    if (id) {
      // Update existing blog post in Firestore.
      this.subscriptions.add(
        this.firestoreService.updateBlog(id, data as Partial<Omit<FirestoreBlog, 'id' | 'createdAt'>>).subscribe({
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
      // Add new blog post to Firestore.
      this.subscriptions.add(
        this.firestoreService.addBlog(data as Omit<FirestoreBlog, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
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

  onDelete(post: BlogPost): void {
    if (!post.id) {
      return;
    }
    if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteBlog(post.id).subscribe({
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

  /** Formats an ISO date string as a readable date (e.g. "Jan 15, 2026"). */
  formatDate(iso: string | null): string {
    if (!iso) {
      return '—';
    }
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}