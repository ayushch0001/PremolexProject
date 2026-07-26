import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);

  isEditing = signal<boolean>(false);

  productForm: FormGroup = this.fb.group({
    id: [null],
    name: ['', Validators.required],
    category: ['HDPE Pipes', Validators.required],
    pressureRating: ['', Validators.required],
    description: ['', Validators.required],
    stockStatus: ['In Stock', Validators.required],
    inStock: [true]
  });

  onSubmit() {
    if (this.productForm.valid) {
      const action = this.isEditing() ? 'Updated' : 'Added';
      console.log(`Product ${action}:`, this.productForm.value);
      this.productForm.reset({ stockStatus: 'In Stock', inStock: true, category: 'HDPE Pipes' });
      this.isEditing.set(false);
      alert(`Product Successfully ${action}`);
    }
  }
}