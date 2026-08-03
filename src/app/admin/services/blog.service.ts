import { Injectable, signal } from '@angular/core';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, concatMap } from 'rxjs/operators';
import {
  BlogPost,
  BlogStatus,
  CreateBlogPostPayload,
  UpdateBlogPostPayload,
} from '../models/blog.model';

/**
 * Mock upload result returned after a "multipart" file upload completes.
 */
export interface BlogUploadResult {
  url: string;
  name: string;
  size: number;
}

/**
 * Mock BlogService.
 *
 * Structured to mirror a standard REST API so it can be swapped for a real
 * Node.js/Express backend later. Each method maps 1:1 to an HTTP endpoint:
 *   - getPosts()           -> GET    /api/blog
 *   - getPostById(id)      -> GET    /api/blog/:id
 *   - createPost(data)     -> POST   /api/blog
 *   - updatePost(id, d)    -> PUT    /api/blog/:id
 *   - deletePost(id)       -> DELETE /api/blog/:id
 *   - uploadImage(file)    -> POST   /api/blog/upload  (multipart/form-data)
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly posts = signal<BlogPost[]>([]);

  constructor() {
    this.seed();
  }

  /** Returns the flat list of blog posts (newest first). */
  getPosts(): BlogPost[] {
    return [...this.posts()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /** Returns a single blog post by id, or null. */
  getPostById(id: string): BlogPost | null {
    return this.posts().find((p) => p.id === id) ?? null;
  }

  createPost(data: CreateBlogPostPayload): BlogPost {
    const now = new Date().toISOString();
    const post: BlogPost = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.posts.update((list) => [...list, post]);
    return post;
  }

  updatePost(id: string, data: UpdateBlogPostPayload): BlogPost | null {
    let updated: BlogPost | null = null;
    this.posts.update((list) =>
      list.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...data, id, updatedAt: new Date().toISOString() };
          return updated;
        }
        return p;
      }),
    );
    return updated;
  }

  deletePost(id: string): void {
    this.posts.update((list) => list.filter((p) => p.id !== id));
  }

  /**
   * Mock multipart file upload — emits HttpEvents like a real HttpClient request.
   * See ProductService.uploadImage for the full pattern documentation.
   */
  uploadImage(file: File): Observable<HttpEvent<BlogUploadResult>> {
    const total = file.size || 1;
    const ticks = 5;
    const progressEvents: Observable<HttpEvent<BlogUploadResult>>[] = [];

    for (let i = 1; i <= ticks; i++) {
      const loaded = Math.round((total / ticks) * i);
      progressEvents.push(
        of<HttpEvent<BlogUploadResult>>({
          type: HttpEventType.UploadProgress,
          loaded,
          total,
        }).pipe(delay(120)),
      );
    }

    const finalResult: BlogUploadResult = {
      url: this.buildObjectUrl(file),
      name: file.name,
      size: file.size,
    };

    const responseEvent: Observable<HttpEvent<BlogUploadResult>> = of<HttpEvent<BlogUploadResult>>(
      new HttpResponse<BlogUploadResult>({ status: 200, statusText: 'OK', body: finalResult }),
    ).pipe(delay(120));

    const sent$ = of<HttpEvent<BlogUploadResult>>({ type: HttpEventType.Sent }).pipe(delay(80));
    const progress$ = progressEvents.reduce(
      (acc, ev) => acc.pipe(concatMap(() => ev)),
      of<HttpEvent<BlogUploadResult>>({ type: HttpEventType.Sent }),
    );
    return sent$.pipe(concatMap(() => progress$), concatMap(() => responseEvent));
  }

  /** Build a temporary in-browser URL for previewing the uploaded file. */
  private buildObjectUrl(file: File): string {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return '';
    }
    return URL.createObjectURL(file);
  }

  // --------------------------------------------------------------------- seed

  private seed(): void {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

    this.posts.set([
      {
        id: 'blog-1',
        title: 'The Future of HDPE Piping in Infrastructure',
        slug: 'future-of-hdpe-piping-in-infrastructure',
        author: 'Premolex Editorial',
        content:
          '<h2>Why HDPE?</h2><p>High-density polyethylene (HDPE) pipes are rapidly becoming the material of choice for modern infrastructure projects. Their <strong>corrosion resistance</strong>, flexibility, and long service life make them ideal for water supply, drainage, and gas distribution.</p><h3>Key Advantages</h3><ul><li>Leak-free fusion joints</li><li>Resistance to chemical and biological attack</li><li>Lightweight and easy to transport</li></ul>',
        excerpt: 'Exploring why HDPE pipes are becoming the material of choice for modern infrastructure.',
        featuredImageUrl: null,
        featuredImageName: null,
        status: 'published',
        publishedAt: yesterday,
        createdAt: lastWeek,
        updatedAt: yesterday,
      },
      {
        id: 'blog-2',
        title: 'Understanding PVC vs CPVC: Which Is Right for You?',
        slug: 'understanding-pvc-vs-cpvc',
        author: 'Technical Team',
        content:
          '<h2>PVC vs CPVC</h2><p>While both PVC and CPVC are widely used plastic piping materials, they have distinct differences that affect their suitability for different applications.</p>',
        excerpt: 'A comparison of PVC and CPVC piping materials for different applications.',
        featuredImageUrl: null,
        featuredImageName: null,
        status: 'draft',
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'blog-3',
        title: '5 Tips for Proper Pipe Installation',
        slug: '5-tips-for-proper-pipe-installation',
        author: 'Premolex Editorial',
        content:
          '<h2>Installation Best Practices</h2><p>Proper installation is critical to the long-term performance of any piping system. Here are five essential tips every contractor should know.</p>',
        excerpt: 'Essential installation tips for long-lasting piping systems.',
        featuredImageUrl: null,
        featuredImageName: null,
        status: 'published',
        publishedAt: lastWeek,
        createdAt: lastWeek,
        updatedAt: lastWeek,
      },
    ]);
  }
}

