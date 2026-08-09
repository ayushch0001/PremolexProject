import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  isSubmitted = false;

  location = 'Raipur, C.G';
  phone = '+91-8817409880';
  email = 'premindustries8@gmail.com';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach((key) => {
        this.contactForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.isSubmitted = true;
      this.contactForm.reset();

      // Reset success message after 4 seconds
      setTimeout(() => {
        this.isSubmitted = false;
      }, 4000);
    }, 1500);
  }
}