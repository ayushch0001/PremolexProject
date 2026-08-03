import { Component, inject, signal, computed } from '@angular/core';
import { BlogPost } from '../../models/blog.model';
import { BlogService } from '../../services/blog.service';
import { BlogFormComponent } from '../blog-form/blog-form.component';

@Component({
  selector: 'app-blog-manager',
  standalone: true,
  imports: [BlogFormComponent],
  templateUrl: './blog-manager.component.html',
  styleUrls: ['./blog-manager.component.css'],
})
export class BlogManagerComponent {
  private readonly blogService = inject(BlogService);

  readonly showForm = signal(false);
  readonly editingPost = signal<BlogPost | null>(null);

  /** Search query for filtering the table. */
  readonly search = signal('');

  /** Status filter: 'all' | 'published' | 'draft'. */
  readonly statusFilter = signal<'all' | 'published' | 'draft'>('all');

  private readonly posts = signal<BlogPost[]>([]);

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

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.posts.set(this.blogService.getPosts());
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

  onSaved(): void {
    this.closeForm();
    this.refresh();
  }

  onDelete(post: BlogPost): void {
    if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
      this.blogService.deletePost(post.id);
      this.refresh();
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