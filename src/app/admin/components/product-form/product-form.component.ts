import {
  Component,
  input,
  output,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Product, ProductStatus, Specification } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService, UploadResult } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  /** Existing product data for "Edit" mode; null/undefined means "Add" mode. */
  readonly product = input<Product | null>(null);
  readonly close = output<void>();
  readonly saved = output<Product>();

  readonly isEditMode = computed<boolean>(() => this.product() !== null);

  // ---- Category / subcategory options ----
  readonly categories = computed<Category[]>(() => this.categoryService.getTopLevelCategories());

  /** Subcategories for the currently selected category. */
  readonly subcategories = signal<Category[]>([]);

  /** Tracks whether subcategories are being "loaded" (simulated async). */
  readonly loadingSubcategories = signal(false);

  // ---- Image upload state ----
  readonly previewUrl = signal<string | null>(null);
  readonly imageName = signal<string | null>(null);
  readonly uploadProgress = signal<number>(0);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);
  private uploadedUrl: string | null = null;
  private uploadSub?: Subscription;

  // ---- Form ----
  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(200)]],
    categoryId: ['', [Validators.required]],
    subcategoryId: [null],
    status: ['draft' as ProductStatus, [Validators.required]],
    specifications: this.fb.array<FormGroup>([]),
  });

  get specifications(): FormArray<FormGroup> {
    return this.form.get('specifications') as FormArray<FormGroup>;
  }

  get specControls(): FormGroup[] {
    return this.specifications.controls as FormGroup[];
  }

  ngOnInit(): void {
    const existing = this.product();
    if (existing) {
      // Load subcategories for the existing category before patching.
      this.loadSubcategories(existing.categoryId, true);
      this.form.patchValue({
        title: existing.title,
        slug: existing.slug,
        shortDescription: existing.shortDescription,
        categoryId: existing.categoryId,
        subcategoryId: existing.subcategoryId,
        status: existing.status,
      });
      this.previewUrl.set(existing.imageUrl);
      this.imageName.set(existing.imageName);
      this.uploadedUrl = existing.imageUrl;

      existing.specifications.forEach((s) => this.addSpecRow(s.key, s.value));
    } else {
      // Start with one empty spec row in "Add" mode.
      this.addSpecRow();
    }
  }

  ngOnDestroy(): void {
    this.uploadSub?.unsubscribe();
  }

  // ---- Category -> subcategory loading ----
  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const categoryId = select.value;
    this.form.get('subcategoryId')?.setValue(null);
    this.loadSubcategories(categoryId);
  }

  /** Simulates an async fetch of subcategories for the given category. */
  private loadSubcategories(categoryId: string, silent = false): void {
    if (!categoryId) {
      this.subcategories.set([]);
      return;
    }

    if (!silent) {
      this.loadingSubcategories.set(true);
    }

    // Simulate network latency (e.g. GET /api/categories/:id/subcategories).
    setTimeout(() => {
      const all = this.categoryService.getCategories();
      const subs = all.filter((c) => c.parentId === categoryId);
      this.subcategories.set(subs);
      this.loadingSubcategories.set(false);
    }, silent ? 0 : 350);
  }

  // ---- Dynamic specifications (FormArray) ----
  addSpecRow(key = '', value = ''): void {
    const row = this.fb.group({
      key: [key, [Validators.required]],
      value: [value, [Validators.required]],
    });
    this.specifications.push(row);
  }

  removeSpecRow(index: number): void {
    this.specifications.removeAt(index);
  }

  // ---- Image drag-and-drop + upload ----
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  /** Handles a selected file: shows a local preview then "uploads" via the mock HttpEvent stream. */
  private handleFile(file: File): void {
    // Immediate local preview (before upload completes).
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      this.previewUrl.set(URL.createObjectURL(file));
    }
    this.imageName.set(file.name);
    this.uploading.set(true);
    this.uploadProgress.set(0);

    this.uploadSub?.unsubscribe();
    this.uploadSub = this.productService.uploadImage(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event instanceof HttpResponse) {
          const result = event.body as UploadResult;
          this.uploadedUrl = result.url;
          // Use the server-returned URL for the preview if available.
          if (result.url) {
            this.previewUrl.set(result.url);
          }
          this.uploading.set(false);
        }
      },
      error: () => {
        this.uploading.set(false);
        this.uploadProgress.set(0);
      },
    });
  }

  removeImage(): void {
    this.previewUrl.set(null);
    this.imageName.set(null);
    this.uploadedUrl = null;
    this.uploadProgress.set(0);
    this.uploading.set(false);
  }

  // ---- Submit ----
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const specs: Specification[] = (value.specifications as Array<{ key: string; value: string }>)
      .filter((s) => s.key && s.value)
      .map((s) => ({ key: s.key.trim(), value: s.value.trim() }));

    const payload = {
      title: value.title,
      slug: value.slug,
      shortDescription: value.shortDescription,
      categoryId: value.categoryId,
      subcategoryId: value.subcategoryId ?? null,
      imageUrl: this.uploadedUrl,
      imageName: this.imageName(),
      specifications: specs,
      status: value.status as ProductStatus,
    };

    const existing = this.product();
    if (existing) {
      const updated = this.productService.updateProduct(existing.id, payload);
      if (updated) {
        this.saved.emit(updated);
      }
    } else {
      const created = this.productService.createProduct(payload);
      this.saved.emit(created);
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}