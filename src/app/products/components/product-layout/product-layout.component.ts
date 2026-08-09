import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product, ProductCategory } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CategorySidebarComponent } from '../category-sidebar/category-sidebar.component';
import { ProductGridComponent } from '../product-grid/product-grid.component';

@Component({
  selector: 'app-product-layout',
  standalone: true,
  imports: [CategorySidebarComponent, ProductGridComponent],
  templateUrl: './product-layout.component.html',
  styleUrls: ['./product-layout.component.css'],
})
export class ProductLayoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);

  readonly categories = signal<ProductCategory[]>([]);
  readonly selectedCategoryId = signal<string>('all');
  readonly selectedProduct = signal<Product | null>(null);

  private readonly products = signal<Product[]>([]);
  private readonly fadeTick = signal(0);

  readonly filteredProducts = computed<Product[]>(() => {
    const categoryId = this.selectedCategoryId();
    if (!categoryId || categoryId === 'all') {
      return this.products();
    }
    return this.products().filter((p) => p.categoryId === categoryId);
  });

  readonly selectedCategoryName = computed<string>(() => {
    const id = this.selectedCategoryId();
    if (id === 'all') {
      return 'All Products';
    }
    return (
      this.categories().find((c) => c.id === id)?.name ?? 'Products'
    );
  });

  /**
   * Alternates between two identical animations so the CSS
   * animation restarts every time the filtered list changes,
   * producing a gentle crossfade-in effect.
   */
  readonly fadeClass = computed<string>(
    () => `fade-zone fade-anim-${this.fadeTick() % 2}`,
  );

  private readonly querySub: Subscription;
  private readonly dataSub = new Subscription();

  constructor() {
    this.querySub = this.route.queryParams.subscribe((params) => {
      const categoryParam =
        typeof params['category'] === 'string' ? params['category'] : null;
      const next = categoryParam && categoryParam.length > 0 ? categoryParam : 'all';
      if (next !== this.selectedCategoryId()) {
        this.selectedCategoryId.set(next);
        this.fadeTick.update((t) => t + 1);
      }
    });
  }

  ngOnInit(): void {
    this.dataSub.add(
      this.productService.getCategories().subscribe((cats) => {
        this.categories.set(cats);
        // Re-map products now that category names are available.
        this.products.update((list) =>
          list.map((p) => ({
            ...p,
            category: this.resolveCategoryName(p.categoryId),
          })),
        );
      }),
    );
    this.dataSub.add(
      this.productService.getProducts().subscribe((products) => {
        this.products.set(
          products.map((p) => ({
            ...p,
            category: this.resolveCategoryName(p.categoryId),
          })),
        );
      }),
    );
  }

  ngOnDestroy(): void {
    this.querySub.unsubscribe();
    this.dataSub.unsubscribe();
  }

  onSelectCategory(categoryId: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: categoryId === 'all' ? null : categoryId,
      },
      queryParamsHandling: 'merge',
    });
  }

  openSpecs(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeSpecs(): void {
    this.selectedProduct.set(null);
  }

  /** Resolves a category id to its display name using the loaded categories. */
  private resolveCategoryName(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.name ?? categoryId;
  }
}