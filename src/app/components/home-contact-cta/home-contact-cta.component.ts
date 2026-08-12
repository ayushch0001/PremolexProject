import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ScrollAnimateDirective } from '../../directives/scroll-animate.directive';
import {
  FirestoreDataService,
  FirestoreContactQuery,
} from '../../services/firestore-data.service';

@Component({
  selector: 'app-home-contact-cta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ScrollAnimateDirective],
  templateUrl: './home-contact-cta.component.html',
  styleUrls: ['./home-contact-cta.component.css'],
})
export class HomeContactCTAComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  contactForm: FormGroup;
  isSubmitting = false;
  isSubmitted = false;
  submitError: string | null = null;

  private readonly subscriptions = new Subscription();

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {}

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
    this.submitError = null;

    const query: Omit<FirestoreContactQuery, 'id' | 'createdAt' | 'updatedAt'> = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message,
      status: 'new',
      notes: '',
    };

    this.subscriptions.add(
      this.firestoreService.addContactQuery(query).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.isSubmitted = true;
          this.contactForm.reset();

          // Reset success message after 4 seconds
          setTimeout(() => {
            this.isSubmitted = false;
          }, 4000);
        },
        error: (err: Error) => {
          this.isSubmitting = false;
          this.submitError = err.message;
        },
      }),
    );
  }
}