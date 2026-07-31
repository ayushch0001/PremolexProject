import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-handler-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './handler-form.component.html'
})
export class HandlerFormComponent {
  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);

  isSubmitting = false;

  handlerForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['editor', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  async onSubmit() {
    if (this.handlerForm.valid) {
      this.isSubmitting = true;

      try {
        const handlersCollection = collection(this.firestore, 'handlers');
        await addDoc(handlersCollection, {
          fullName: this.handlerForm.value.fullName,
          email: this.handlerForm.value.email,
          role: this.handlerForm.value.role,
          // WARNING: Storing plain text passwords in Firestore is not secure for production.
          password: this.handlerForm.value.password,
          createdAt: new Date().toISOString()
        });

        alert('Handler Successfully Registered in Firebase!');
        this.handlerForm.reset({ role: 'editor' });
      } catch (error) {
        console.error('Error registering handler:', error);
        alert('Failed to register handler.');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}