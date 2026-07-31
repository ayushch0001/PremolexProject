import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  isEditing = signal<boolean>(false);
  isSubmitting = false;
  selectedFile: File | null = null;

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: ['HDPE Pipes', Validators.required],
    pressureRating: ['', Validators.required],
    description: ['', Validators.required],
    stockStatus: ['In Stock', Validators.required],
    inStock: [true]
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async onSubmit() {
    if (this.productForm.valid && this.selectedFile) {
      this.isSubmitting = true;

      try {
        // Upload image to Storage
        const filePath = `products/${Date.now()}_${this.selectedFile.name}`;
        const storageRef = ref(this.storage, filePath);
        await uploadBytes(storageRef, this.selectedFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Save data to Firestore
        const productsCollection = collection(this.firestore, 'products');
        await addDoc(productsCollection, {
          ...this.productForm.value,
          imageUrl: imageUrl,
          createdAt: new Date().toISOString()
        });

        alert('Product Successfully Saved to Firebase!');
        this.productForm.reset({ stockStatus: 'In Stock', inStock: true, category: 'HDPE Pipes' });
        this.selectedFile = null;
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to save product.');
      } finally {
        this.isSubmitting = false;
      }
    } else if (!this.selectedFile) {
      alert('Please select a product image.');
    }
  }
}