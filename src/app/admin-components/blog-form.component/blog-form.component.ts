import { Component, inject } from '@angular/core';
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
export class BlogFormComponent {
  private fb = inject(FormBuilder);

  // Inject Firebase services
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  selectedFile: File | null = null;
  isSubmitting = false;

  blogForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    content: ['', [Validators.required, Validators.minLength(50)]]
  });

  // 1. Capture the image file when the user selects it
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // 2. Submit data to Firebase
  async onBlogSubmit() {
    if (this.blogForm.valid && this.selectedFile) {
      this.isSubmitting = true;

      try {
        // Step A: Upload Image to Firebase Storage
        const filePath = `blogs/${Date.now()}_${this.selectedFile.name}`;
        const storageRef = ref(this.storage, filePath);

        await uploadBytes(storageRef, this.selectedFile);
        const imageUrl = await getDownloadURL(storageRef);

        // Step B: Save Text Data + Image URL to Cloud Firestore
        const blogsCollection = collection(this.firestore, 'blogs');
        await addDoc(blogsCollection, {
          title: this.blogForm.value.title,
          author: this.blogForm.value.author,
          content: this.blogForm.value.content,
          imageUrl: imageUrl, // The public link to the image
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

    } else if (!this.selectedFile) {
      alert('Please select a cover image before publishing.');
    }
  }
}