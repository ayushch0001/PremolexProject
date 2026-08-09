import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product, ProductCategory } from '../models/product.model';
import { FirestoreDataService, FirestoreProduct, FirestoreCategory } from '../../services/firestore-data.service';

/**
 * ProductService (Public)
 *
 * Fetches the public product catalog from Firebase Firestore via
 * `FirestoreDataService` (Firestore REST v1 API). Maps Firestore documents
 * to the public-facing `Product` / `ProductCategory` models.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly firestoreService = inject(FirestoreDataService);

  /** Returns all public product categories from Firestore. */
  getCategories(): Observable<ProductCategory[]> {
    return this.firestoreService.getCategories().pipe(
      map((cats: FirestoreCategory[]) =>
        cats
          .filter((c) => c.parentId === null) // top-level only for the public sidebar
          .map((c) => ({
            id: c.id ?? '',
            name: c.name,
            description: c.description,
          })),
      ),
    );
  }

  /** Returns all active public products from Firestore. */
  getProducts(): Observable<Product[]> {
    return this.firestoreService.getProducts().pipe(
      map((docs: FirestoreProduct[]) =>
        docs
          .filter((p) => p.status === 'active')
          .map((p, index) => this.toPublicProduct(p, index)),
      ),
    );
  }

  /** Returns products filtered by category from Firestore. */
  getProductsByCategory(categoryId: string | null): Observable<Product[]> {
    return this.firestoreService.getProducts().pipe(
      map((docs: FirestoreProduct[]) => {
        const filtered = !categoryId || categoryId === 'all'
          ? docs
          : docs.filter((p) => p.categoryId === categoryId);
        return filtered
          .filter((p) => p.status === 'active')
          .map((p, index) => this.toPublicProduct(p, index));
      }),
    );
  }

  /** Maps a Firestore product document to the public Product model. */
  private toPublicProduct(p: FirestoreProduct, index: number): Product {
    return {
      id: index + 1,
      name: p.title,
      subtitle: p.shortDescription,
      categoryId: p.categoryId,
      category: p.categoryId, // category name resolved by the layout via categories list
      imageUrl: p.imageUrl ?? '',
      specifications: (p.specifications ?? []).map((s) => ({
        label: s.key,
        value: s.value,
      })),
    };
  }
}