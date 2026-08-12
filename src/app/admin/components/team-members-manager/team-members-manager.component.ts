import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreTeamMember,
} from '../../../services/firestore-data.service';

@Component({
  selector: 'app-team-members-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './team-members-manager.component.html',
  styleUrls: ['./team-members-manager.component.css'],
})
export class TeamMembersManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly showForm = signal(false);
  readonly editingMember = signal<FirestoreTeamMember | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly members = signal<FirestoreTeamMember[]>([]);
  private readonly subscriptions = new Subscription();

  readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: ['', [Validators.required]],
    imageUrl: [null as string | null],
    imageName: [null as string | null],
    message: ['', [Validators.required, Validators.minLength(10)]],
    sortOrder: [0, [Validators.required]],
  });

  readonly rows = computed<FirestoreTeamMember[]>(() => this.members());

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  refresh(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.subscriptions.add(
      this.firestoreService.getTeamMembers().subscribe({
        next: (docs) => {
          this.members.set(docs);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  openAddForm(): void {
    this.editingMember.set(null);
    this.form.reset({
      name: '',
      role: '',
      imageUrl: null,
      imageName: null,
      message: '',
      sortOrder: this.members().length,
    });
    this.showForm.set(true);
  }

  openEditForm(member: FirestoreTeamMember): void {
    this.editingMember.set(member);
    this.form.patchValue({
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl,
      imageName: member.imageName ?? null,
      message: member.message,
      sortOrder: member.sortOrder,
    });
    this.showForm.set(true);
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (typeof FileReader !== 'undefined') {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          this.form.patchValue({
            imageUrl: dataUrl,
            imageName: file.name,
          });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(): void {
    this.form.patchValue({ imageUrl: null, imageName: null });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingMember.set(null);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const member = this.editingMember();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (member?.id) {
      this.subscriptions.add(
        this.firestoreService.updateTeamMember(member.id, value as Partial<Omit<FirestoreTeamMember, 'id' | 'createdAt'>>).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.closeForm();
            this.refresh();
          },
          error: (err: Error) => {
            this.isSaving.set(false);
            this.errorMessage.set(err.message);
          },
        }),
      );
    } else {
      this.subscriptions.add(
        this.firestoreService.addTeamMember(value as Omit<FirestoreTeamMember, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.closeForm();
            this.refresh();
          },
          error: (err: Error) => {
            this.isSaving.set(false);
            this.errorMessage.set(err.message);
          },
        }),
      );
    }
  }

  onDelete(member: FirestoreTeamMember): void {
    if (!member.id) return;
    if (window.confirm(`Delete team member "${member.name}"? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteTeamMember(member.id).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.refresh();
          },
          error: (err: Error) => {
            this.isSaving.set(false);
            this.errorMessage.set(err.message);
          },
        }),
      );
    }
  }
}