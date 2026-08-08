import { Component, inject, signal, computed, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FirestoreDataService, FirestoreSitePage } from '../../../services/firestore-data.service';

type PageKey = 'quality' | 'infrastructure';

@Component({
  selector: 'app-corporate-pages-manager',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './corporate-pages-manager.component.html',
  styleUrls: ['./corporate-pages-manager.component.css'],
})
export class CorporatePagesManagerComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly firestoreService = inject(FirestoreDataService);

  readonly selectedPage = signal<PageKey>('quality');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  /** Reference to the contenteditable editor element. */
  @ViewChild('editor') editorRef?: ElementRef<HTMLDivElement>;

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
  });

  private readonly subscriptions = new Subscription();
  private currentPageKey: PageKey = 'quality';

  readonly pageTitle = computed<string>(() =>
    this.selectedPage() === 'quality' ? 'Quality Page' : 'Infrastructure Page',
  );

  ngOnInit(): void {
    this.loadPage(this.selectedPage());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSelectPage(key: PageKey): void {
    this.selectedPage.set(key);
    this.loadPage(key);
  }

  loadPage(key: PageKey): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.currentPageKey = key;

    this.subscriptions.add(
      this.firestoreService.getSitePage(key).subscribe({
        next: (page: FirestoreSitePage | null) => {
          this.isLoading.set(false);
          this.form.patchValue({
            title: page?.title ?? (key === 'quality' ? 'Quality' : 'Infrastructure'),
            content: page?.content ?? '',
          });
          // Sync the contenteditable editor after a tick.
          setTimeout(() => this.syncEditorFromControl(), 0);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, content } = this.form.value;
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.subscriptions.add(
      this.firestoreService.saveSitePage(this.currentPageKey, { title, content }).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set(`${this.pageTitle()} saved successfully.`);
        },
        error: (err: Error) => {
          this.isSaving.set(false);
          this.errorMessage.set(err.message);
        },
      }),
    );
  }

  // ---- Rich text editor helpers (contenteditable, no external deps) ----

  execCmd(command: string, value?: string): void {
    this.editorRef?.nativeElement.focus();
    document.execCommand(command, false, value);
    this.syncEditorToControl();
  }

  setBlock(tag: string): void {
    this.editorRef?.nativeElement.focus();
    document.execCommand('formatBlock', false, tag);
    this.syncEditorToControl();
  }

  insertLink(): void {
    const url = window.prompt('Enter URL:');
    if (url) {
      this.execCmd('createLink', url);
    }
  }

  onEditorInput(): void {
    this.syncEditorToControl();
  }

  private syncEditorToControl(): void {
    const html = this.editorRef?.nativeElement.innerHTML ?? '';
    this.form.get('content')?.setValue(html);
  }

  private syncEditorFromControl(): void {
    const html = this.form.get('content')?.value ?? '';
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = html;
    }
  }
}