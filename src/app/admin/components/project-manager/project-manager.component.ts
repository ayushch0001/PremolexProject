import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  FirestoreDataService,
  FirestoreProject,
} from '../../../services/firestore-data.service';

@Component({
  selector: 'app-project-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './project-manager.component.html',
  styleUrls: ['./project-manager.component.css'],
})
export class ProjectManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly showForm = signal(false);
  readonly editingProject = signal<FirestoreProject | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly projects = signal<FirestoreProject[]>([]);
  private readonly subscriptions = new Subscription();

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', [Validators.required]],
    image: ['', [Validators.required]],
  });

  readonly rows = computed<FirestoreProject[]>(() => this.projects());

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
      this.firestoreService.getProjects().subscribe({
        next: (docs) => {
          this.projects.set(docs);
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
    this.editingProject.set(null);
    this.form.reset({
      title: '',
      category: '',
      image: '',
    });
    this.showForm.set(true);
  }

  openEditForm(project: FirestoreProject): void {
    this.editingProject.set(project);
    this.form.patchValue({
      title: project.title,
      category: project.category,
      image: project.image,
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProject.set(null);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const project = this.editingProject();

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (project?.id) {
      this.subscriptions.add(
        this.firestoreService.updateProject(project.id, value as Partial<Omit<FirestoreProject, 'id' | 'createdAt'>>).subscribe({
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
        this.firestoreService.addProject(value as Omit<FirestoreProject, 'id' | 'createdAt' | 'updatedAt'>).subscribe({
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

  onDelete(project: FirestoreProject): void {
    if (!project.id) return;
    if (window.confirm(`Delete project "${project.title}"? This cannot be undone.`)) {
      this.isSaving.set(true);
      this.errorMessage.set(null);

      this.subscriptions.add(
        this.firestoreService.deleteProject(project.id).subscribe({
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