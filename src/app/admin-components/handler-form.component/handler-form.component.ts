import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-handler-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './handler-form.component.html'
})
export class HandlerFormComponent {
  private fb = inject(FormBuilder);

  handlerForm: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['editor', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.handlerForm.valid) {
      console.log('Handler Registered:', this.handlerForm.value);
      this.handlerForm.reset({ role: 'editor' });
      alert('Handler Successfully Registered');
    }
  }
}