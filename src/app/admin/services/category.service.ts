import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category, CategoryTreeNode } from '../models/category.model';
import { FirestoreDataService, FirestoreCategory } from '../../services/firestore-data.service';

/**
 * CategoryService
 *
 * Persists categories to Firebase Firestore via `FirestoreDataService`
 * (Firestore REST v1 API). Keeps an in-memory signal cache for synchronous
 * reads (tree building, dropdowns) and refreshes it from Firestore.
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly firestoreService = inject(FirestoreDataService);
  private readonly categories = signal<Category[]>([]);

  constructor() {
    this.refresh();
  }

  /** Refreshes the in-memory cache from Firestore. */
  refresh(): void {
    this.firestoreService.getCategories().subscribe({
      next: (docs) => {
        this.categories.set(docs as Category[]);
      },
      error: (err) => {
        console.error('[CategoryService] Failed to load categories:', err);
      },
    });
  }

  /** Returns the flat list of categories (from the in-memory cache). */
  getCategories(): Category[] {
    return this.categories();
  }

  /** Returns categories arranged as a tree (top-level + nested subcategories). */
  getCategoryTree(): CategoryTreeNode[] {
    const flat = this.categories();
    const map = new Map<string, CategoryTreeNode>();

    flat.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: CategoryTreeNode[] = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /** Returns only top-level categories (for the Parent dropdown). */
  getTopLevelCategories(): Category[] {
    return this.categories().filter((c) => c.parentId === null);
  }

  /** Creates a category in Firestore and refreshes the cache. */
  createCategory(data: Omit<Category, 'id' | 'createdAt'>): Observable<Category> {
    return this.firestoreService
      .addCategory(data as Omit<FirestoreCategory, 'id' | 'createdAt' | 'updatedAt'>)
      .pipe(
        map((doc) => {
          this.refresh();
          return doc as Category;
        }),
      );
  }

  /** Updates a category in Firestore and refreshes the cache. */
  updateCategory(
    id: string,
    data: Partial<Omit<Category, 'id' | 'createdAt'>>,
  ): Observable<Category> {
    return this.firestoreService
      .updateCategory(id, data as Partial<Omit<FirestoreCategory, 'id' | 'createdAt'>>)
      .pipe(
        map((doc) => {
          this.refresh();
          return doc as Category;
        }),
      );
  }

  /** Deletes a category (and its subcategories) from Firestore and refreshes the cache. */
  deleteCategory(id: string): Observable<void> {
    // Remove the category and any subcategories that reference it as parent.
    const subIds = this.categories()
      .filter((c) => c.parentId === id)
      .map((c) => c.id);

    // Delete subcategories first, then the parent.
    const deletes: Observable<void>[] = [
      ...subIds.map((subId) => this.firestoreService.deleteCategory(subId)),
      this.firestoreService.deleteCategory(id),
    ];

    return new Observable<void>((subscriber) => {
      let completed = 0;
      deletes.forEach((del) => {
        del.subscribe({
          next: () => {
            completed++;
            if (completed === deletes.length) {
              this.refresh();
              subscriber.next();
              subscriber.complete();
            }
          },
          error: (err) => subscriber.error(err),
        });
      });
    });
  }
}