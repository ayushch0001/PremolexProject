import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog-form.component.html'
})
export class BlogFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  // Declare the form, but initialize it in ngOnInit
  blogForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    // Initializing here ensures the DOM and Angular are perfectly synced
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  async onBlogSubmit(): Promise<void> {
    // Prevent submission if form is invalid or image is missing
    if (this.blogForm.invalid) {
      this.blogForm.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      alert('Please select a cover image before publishing.');
      return;
    }

    this.isSubmitting = true;

    try {
      const filePath = `blogs/${Date.now()}_${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);

      await uploadBytes(storageRef, this.selectedFile);
      const imageUrl = await getDownloadURL(storageRef);

      const blogsCollection = collection(this.firestore, 'blogs');
      await addDoc(blogsCollection, {
        ...this.blogForm.value, // Cleaner way to pass all form values
        imageUrl: imageUrl,
        createdAt: new Date().toISOString()
      });

      alert('Blog Successfully Published to Firebase!');
      this.blogForm.reset();
      this.selectedFile = null;

    } catch (error) {
      console.error('Error uploading to Firebase:', error);
      alert('Failed to publish the blog. Check your console for details.');
    } finally {
      this.isSubmitting = false;
    }
  }
}