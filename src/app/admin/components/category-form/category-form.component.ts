import { Component, input, output, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);

  /** Existing category data for "Edit" mode; null/undefined means "Add" mode. */
  readonly category = input<Category | null>(null);
  readonly close = output<void>();
  readonly saved = output<Category>();

  readonly isEditMode = computed<boolean>(() => this.category() !== null);

  readonly parentOptions = computed<Category[]>(() => {
    const current = this.category();
    return this.categoryService
      .getTopLevelCategories()
      .filter((c) => c.id !== current?.id);
  });

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: [''],
    parentId: [null],
  });

  ngOnInit(): void {
    const existing = this.category();
    if (existing) {
      this.form.patchValue({
        name: existing.name,
        slug: existing.slug,
        description: existing.description,
        parentId: existing.parentId,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const existing = this.category();

    if (existing) {
      const updated = this.categoryService.updateCategory(existing.id, {
        name: value.name,
        slug: value.slug,
        description: value.description,
        parentId: value.parentId ?? null,
      });
      if (updated) {
        this.saved.emit(updated);
      }
    } else {
      const created = this.categoryService.createCategory({
        name: value.name,
        slug: value.slug,
        description: value.description,
        parentId: value.parentId ?? null,
      });
      this.saved.emit(created);
    }
  }

  onCancel(): void {
    this.close.emit();
  }
}