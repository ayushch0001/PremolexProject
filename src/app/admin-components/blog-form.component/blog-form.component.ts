import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog-form.component.html'
})
export class BlogFormComponent {
  private fb = inject(FormBuilder);

  blogForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    content: ['', [Validators.required, Validators.minLength(50)]]
  });

  onSubmit() {
    if (this.blogForm.valid) {
      console.log('Blog Posted:', this.blogForm.value);
      this.blogForm.reset();
      alert('Blog Successfully Posted');
    }
  }
}