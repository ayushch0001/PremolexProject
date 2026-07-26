import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html'
})
export class CategoryFormComponent {
  private fb = inject(FormBuilder);

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });

  onSubmit() {
    if (this.categoryForm.valid) {
      console.log('Category Created:', this.categoryForm.value);
      this.categoryForm.reset();
      alert('Category Successfully Created');
    }
  }
}