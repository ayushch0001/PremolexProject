import { Component, input, model } from '@angular/core';
import { ProductCategory } from '../../models/product.model';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  templateUrl: './category-sidebar.component.html',
  styleUrls: ['./category-sidebar.component.css'],
})
export class CategorySidebarComponent {
  readonly categories = input.required<ProductCategory[]>();
  readonly selectedCategoryId = model.required<string>();

  selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
  }
}