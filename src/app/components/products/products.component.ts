import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirestoreDataService, FirestoreProduct } from '../../services/firestore-data.service';

interface FeaturedProduct {
  name: string;
  image: string;
  status: string;
  specs: { label: string; value: string }[];
}

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  private readonly firestoreService = inject(FirestoreDataService);

  private readonly allProducts = signal<FirestoreProduct[]>([]);
  private readonly subscriptions = new Subscription();

  /** The first 3 active products, mapped to the template's expected shape. */
  readonly products = computed<FeaturedProduct[]>(() =>
    this.allProducts()
      .filter((p) => p.status === 'active')
      .slice(0, 3)
      .map((p) => ({
        name: p.title,
        image: p.imageUrl ?? '',
        status: 'In Stock',
        specs: (p.specifications ?? []).map((s) => ({ label: s.key, value: s.value })),
      })),
  );

  ngOnInit(): void {
    this.subscriptions.add(
      this.firestoreService.getProducts().subscribe({
        next: (docs) => {
          this.allProducts.set(docs);
        },
        error: (err) => {
          console.error('[ProductsComponent] Failed to load products:', err);
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}