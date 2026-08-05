import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { FirestoreDataService, FirestoreProduct } from '../../../services/firestore-data.service';
import { ProductFormComponent } from '../product-form/product-form.component';

interface ProductRow extends Product {
  categoryName: string;
  subcategoryName: string;
}

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.css'],
})
export class ProductManagerComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);
  private readonly categoryService = inject(CategoryService);

  readonly showForm = signal(false);
  readonly editingProduct = signal<Product | null>(null);

  /** Search query for filtering the table. */
  readonly search = signal('');

  /** Status filter: 'all' | 'active' | 'draft'. */
  readonly statusFilter = signal<'all' | 'active' | 'draft'>('all');

  /** Loading state while fetching from Firestore. */
  readonly isLoading = signal(false);

  /** Loading state while saving/deleting. */
  readonly isSaving = signal(false);

  /** Error message from Firestore operations. */
  readonly errorMessage = signal<string | null>(null);

  private readonly products = signal<Product[]>([]);
  private readonly subscriptions = new Subscription();

  readonly rows = computed<ProductRow[]>(() => {
    const cats = this.categoryService.getCategories();
    const byId = new Map<string, Category>(cats.map((c) => [c.id, c]));
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.products()
      .filter((p) => {
        if (status !== 'all' && p.status !== status) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
        );
      })
      .map((p) => ({
        ...p,
        categoryName: byId.get(p.categoryId)?.name ?? '—',
        subcategoryName: p.subcategoryId ? byId.get(p.subcategoryId)?.name ?? '—' : '—',
      }));
  });

  readonly totalProducts = computed<number>(() => this.products().length);
  readonly activeCount = computed<number>(() => this.products().filter((p) => p.status === 'active').length);
  readonly draftCount = computed<number>(() => this.products().filter((p) => p.status === 'draft').length);

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
      this.firestoreService.getProducts().subscribe({
        next: (docs) => {
          this.products.set(docs as Product[]);
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
    this.statusFilter.set((event.target as HTMLSelectElement).value as 'all' | 'active' | 'draft');
  }

  openAddForm(): void {
    this.editingProduct.set(null);
    this.showForm.set(true);
  }

  openEditForm(product: Product): void {
    this.editingProduct.set(product);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  onSaved(product: Product): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    const { id, ...data } = product;

    if (id) {
      // Update existing product in Firestore.
      this.subscriptions.add(
        this.firestoreService.updateProduct(id, data as Partial<Omit<FirestoreProduct, 'id' | 'createdAt'>>).subscribe({
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
      // Add new product to Firestore.
      this.subscriptions.add(
        this.firestoreService.addProduct(data as Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
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

  onDelete(product: Product): void {
    if (!product.id) {
      return;
    }
    if (window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteProduct(product.id).subscribe({
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
}