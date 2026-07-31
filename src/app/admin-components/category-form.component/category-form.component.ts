import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html'
})
export class CategoryFormComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);

  isSubmitting = false;

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });

  async onSubmit() {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;

      try {
        const categoriesCollection = collection(this.firestore, 'categories');
        await addDoc(categoriesCollection, {
          ...this.categoryForm.value,
          createdAt: new Date().toISOString()
        });

        alert('Category Successfully Created in Firebase!');
        this.categoryForm.reset();
      } catch (error) {
        console.error('Error saving category:', error);
        alert('Failed to create category.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}