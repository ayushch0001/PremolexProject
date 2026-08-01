import { Component, inject, signal, computed } from '@angular/core';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
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
export class ProductManagerComponent {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  readonly showForm = signal(false);
  readonly editingProduct = signal<Product | null>(null);

  /** Search query for filtering the table. */
  readonly search = signal('');

  /** Status filter: 'all' | 'active' | 'draft'. */
  readonly statusFilter = signal<'all' | 'active' | 'draft'>('all');

  private readonly products = signal<Product[]>([]);

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

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.products.set(this.productService.getProducts());
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

  onSaved(): void {
    this.closeForm();
    this.refresh();
  }

  onDelete(product: Product): void {
    if (window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
      this.productService.deleteProduct(product.id);
      this.refresh();
    }
  }
}