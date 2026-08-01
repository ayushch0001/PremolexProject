import { Injectable, signal } from '@angular/core';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, concatMap } from 'rxjs/operators';
import {
  CreateProductPayload,
  Product,
  ProductStatus,
  Specification,
  UpdateProductPayload,
} from '../models/product.model';
import { CategoryService } from './category.service';

/**
 * Mock upload result returned after a "multipart" file upload completes.
 */
export interface UploadResult {
  url: string;
  name: string;
  size: number;
}

/**
 * Mock ProductService.
 *
 * Structured to mirror a standard REST API so it can be swapped for a real
 * Node.js/Express backend later. Each method maps 1:1 to an HTTP endpoint:
 *   - getProducts()           -> GET    /api/products
 *   - createProduct(data)     -> POST   /api/products
 *   - updateProduct(id, d)    -> PUT    /api/products/:id
 *   - deleteProduct(id)       -> DELETE /api/products/:id
 *   - uploadImage(file)       -> POST   /api/products/upload  (multipart/form-data)
 *
 * `uploadImage` returns an `Observable<HttpEvent<UploadResult>>` so the form
 * can subscribe to progress + response events exactly as it would with a real
 * `HttpClient` multipart request.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly products = signal<Product[]>([]);

  constructor(private readonly categoryService: CategoryService) {
    this.seed();
  }

  /** Returns the flat list of products. */
  getProducts(): Product[] {
    return this.products();
  }

  /** Returns a single product by id, or null. */
  getProductById(id: string): Product | null {
    return this.products().find((p) => p.id === id) ?? null;
  }

  createProduct(data: CreateProductPayload): Product {
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.products.update((list) => [...list, product]);
    return product;
  }

  updateProduct(id: string, data: UpdateProductPayload): Product | null {
    let updated: Product | null = null;
    this.products.update((list) =>
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

  deleteProduct(id: string): void {
    this.products.update((list) => list.filter((p) => p.id !== id));
  }

  /**
   * Mock multipart file upload.
   *
   * Emits a stream of `HttpEvent`s that mimic a real `HttpClient` upload:
   *   1. HttpEventType.Sent            (request started)
   *   2. HttpEventType.UploadProgress  (0% -> 100%, several ticks)
   *   3. HttpEventType.Response        (final UploadResult)
   *
   * In a real backend this would be:
   *   this.http.post<UploadResult>('/api/products/upload', formData, {
   *     reportProgress: true,
   *     observe: 'events',
   *   });
   */
  uploadImage(file: File): Observable<HttpEvent<UploadResult>> {
    const total = file.size || 1;
    const ticks = 5;
    const progressEvents: Observable<HttpEvent<UploadResult>>[] = [];

    for (let i = 1; i <= ticks; i++) {
      const loaded = Math.round((total / ticks) * i);
      progressEvents.push(
        of<HttpEvent<UploadResult>>({
          type: HttpEventType.UploadProgress,
          loaded,
          total,
        }).pipe(delay(120)),
      );
    }

    const finalResult: UploadResult = {
      url: this.buildObjectUrl(file),
      name: file.name,
      size: file.size,
    };

    const responseEvent: Observable<HttpEvent<UploadResult>> = of<HttpEvent<UploadResult>>(
      new HttpResponse<UploadResult>({ status: 200, statusText: 'OK', body: finalResult }),
    ).pipe(delay(120));

    // Sent event first, then progress ticks, then the final response.
    const sent$ = of<HttpEvent<UploadResult>>({ type: HttpEventType.Sent }).pipe(delay(80));
    const progress$ = progressEvents.reduce(
      (acc, ev) => acc.pipe(concatMap(() => ev)),
      of<HttpEvent<UploadResult>>({ type: HttpEventType.Sent }),
    );
    return sent$.pipe(concatMap(() => progress$), concatMap(() => responseEvent));
  }

  /** Build a temporary in-browser URL so the UI can preview the uploaded file. */
  private buildObjectUrl(file: File): string {
    // Guard for SSR environments where URL.createObjectURL is unavailable.
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      return '';
    }
    return URL.createObjectURL(file);
  }

  // --------------------------------------------------------------------- seed

  private seed(): void {
    const now = new Date().toISOString();
    const cats = this.categoryService.getCategories();
    const hdpe = cats.find((c) => c.slug === 'hdpe-pipes');
    const pressure = cats.find((c) => c.slug === 'hdpe-pressure-pipes');
    const drainage = cats.find((c) => c.slug === 'hdpe-drainage-pipes');
    const pvc = cats.find((c) => c.slug === 'pvc-pipes');
    const conduit = cats.find((c) => c.slug === 'pvc-electrical-conduit');

    const spec = (key: string, value: string): Specification => ({ key, value });

    this.products.set([
      {
        id: 'prod-1',
        title: 'HDPE PN10 Pressure Pipe 110mm',
        slug: 'hdpe-pn10-pressure-pipe-110mm',
        shortDescription: 'PE100 high-density pressure pipe for potable water supply.',
        categoryId: hdpe?.id ?? 'cat-hdpe',
        subcategoryId: pressure?.id ?? 'cat-hdpe-pressure',
        imageUrl: null,
        imageName: null,
        specifications: [
          spec('Material', 'HDPE PE100'),
          spec('Pressure Rating', 'PN10'),
          spec('Diameter', '110mm'),
          spec('Standard', 'IS 4984'),
        ],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-2',
        title: 'Corrugated Drainage Pipe 160mm',
        slug: 'corrugated-drainage-pipe-160mm',
        shortDescription: 'Flexible corrugated HDPE pipe for sub-surface drainage.',
        categoryId: hdpe?.id ?? 'cat-hdpe',
        subcategoryId: drainage?.id ?? 'cat-hdpe-drainage',
        imageUrl: null,
        imageName: null,
        specifications: [
          spec('Material', 'HDPE'),
          spec('Type', 'Corrugated'),
          spec('Diameter', '160mm'),
        ],
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-3',
        title: 'PVC Electrical Conduit 25mm',
        slug: 'pvc-electrical-conduit-25mm',
        shortDescription: 'Flame-retardant rigid PVC conduit for cable protection.',
        categoryId: pvc?.id ?? 'cat-pvc',
        subcategoryId: conduit?.id ?? 'cat-pvc-conduit',
        imageUrl: null,
        imageName: null,
        specifications: [
          spec('Material', 'Rigid PVC'),
          spec('Diameter', '25mm'),
          spec('Flame Retardant', 'Yes'),
        ],
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
}

