import { Component, inject, signal, computed } from '@angular/core';
import { Category, CategoryTreeNode } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CategoryFormComponent],
  templateUrl: './category-manager.component.html',
  styleUrls: ['./category-manager.component.css'],
})
export class CategoryManagerComponent {
  private readonly categoryService = inject(CategoryService);

  readonly tree = signal<CategoryTreeNode[]>([]);
  readonly expandedIds = signal<Set<string>>(new Set());

  readonly showForm = signal(false);
  readonly editingCategory = signal<Category | null>(null);

  readonly totalCategories = computed<number>(() => {
    const count = (nodes: CategoryTreeNode[]): number =>
      nodes.reduce((sum, node) => sum + 1 + count(node.children), 0);
    return count(this.tree());
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.tree.set(this.categoryService.getCategoryTree());
  }

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleExpand(id: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  openAddForm(): void {
    this.editingCategory.set(null);
    this.showForm.set(true);
  }

  openEditForm(category: Category): void {
    this.editingCategory.set(category);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingCategory.set(null);
  }

  onSaved(): void {
    this.closeForm();
    this.refresh();
  }

  onDelete(category: CategoryTreeNode): void {
    const subCount = category.children.length;
    const message =
      subCount > 0
        ? `Delete "${category.name}" and its ${subCount} subcategor${subCount === 1 ? 'y' : 'ies'}? This cannot be undone.`
        : `Delete "${category.name}"? This cannot be undone.`;

    if (window.confirm(message)) {
      this.categoryService.deleteCategory(category.id);
      this.refresh();
    }
  }
}