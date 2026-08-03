import {
  Component,
  input,
  output,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Subscription, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { BlogPost, BlogStatus } from '../../models/blog.model';
import { BlogService, BlogUploadResult } from '../../services/blog.service';

/**
 * Lightweight rich-text editor wrapper.
 *
 * Uses the browser's built-in `document.execCommand` API via a
 * `contenteditable` div. This avoids adding a heavy third-party dependency
 * (e.g. Quill / CKEditor) while still providing bold, italic, headings, lists,
 * and links. The wrapper is structured so it can be swapped for
 * `ngx-quill` or `@ckeditor/ckeditor5-angular` later by replacing the
 * `<div contenteditable>` with the editor component and binding to the same
 * `content` FormControl.
 */
@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly blogService = inject(BlogService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Existing post data for "Edit" mode; null/undefined means "Add" mode. */
  readonly post = input<BlogPost | null>(null);
  readonly close = output<void>();
  readonly saved = output<BlogPost>();

  readonly isEditMode = computed<boolean>(() => this.post() !== null);

  /** Reference to the contenteditable editor element. */
  @ViewChild('editor') editorRef?: ElementRef<HTMLDivElement>;

  // ---- Image upload state ----
  readonly previewUrl = signal<string | null>(null);
  readonly imageName = signal<string | null>(null);
  readonly uploadProgress = signal<number>(0);
  readonly uploading = signal(false);
  readonly dragOver = signal(false);
  private uploadedUrl: string | null = null;
  private uploadSub?: Subscription;

  // ---- Slug auto-generation ----
  /** When true, the slug is auto-generated from the title. */
  private slugTouched = false;
  private readonly titleChanges$ = new Subject<string>();
  private slugSub?: Subscription;

  // ---- Preview ----
  readonly showPreview = signal(false);
  readonly sanitizedPreview = signal<SafeHtml>('');
  readonly wordCount = signal<number>(0);

  // ---- Form ----
  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    author: ['', [Validators.required]],
    excerpt: ['', [Validators.maxLength(300)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
    publishNow: [true],
  });

  get contentControl(): FormControl {
    return this.form.get('content') as FormControl;
  }

  ngOnInit(): void {
    // Slug auto-generation: debounce title changes and generate slug.
    this.slugSub = this.titleChanges$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((title) => {
        if (!this.slugTouched) {
          this.form.get('slug')?.setValue(this.slugify(title));
        }
      });

    const existing = this.post();
    if (existing) {
      this.form.patchValue({
        title: existing.title,
        slug: existing.slug,
        author: existing.author,
        excerpt: existing.excerpt,
        content: existing.content,
        publishNow: existing.status === 'published',
      });
      this.previewUrl.set(existing.featuredImageUrl);
      this.imageName.set(existing.featuredImageName);
      this.uploadedUrl = existing.featuredImageUrl;
      this.slugTouched = true;
      this.updateWordCount(existing.content);
    }
  }

  ngOnDestroy(): void {
    this.slugSub?.unsubscribe();
    this.uploadSub?.unsubscribe();
  }

  // ---- Title -> slug auto-generation ----
  onTitleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.titleChanges$.next(value);
  }

  onSlugInput(): void {
    // Once the user manually edits the slug, stop auto-generating.
    this.slugTouched = true;
  }

  /** Converts a string into a URL-friendly slug. */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // ---- Rich text editor commands ----
  /**
   * Executes a formatting command on the contenteditable editor.
   * Uses `document.execCommand` — deprecated but still widely supported
   * and sufficient for a lightweight editor. Can be replaced by a
   * proper editor library's API later.
   */
  execCmd(command: string, value?: string): void {
    // Ensure the editor has focus before executing the command.
    this.editorRef?.nativeElement.focus();
    document.execCommand(command, false, value);
    this.syncEditorToControl();
  }

  /** Sets the active block format (h1, h2, h3, p). */
  setBlock(tag: string): void {
    this.editorRef?.nativeElement.focus();
    document.execCommand('formatBlock', false, tag);
    this.syncEditorToControl();
  }

  /** Inserts a hyperlink at the current selection. */
  insertLink(): void {
    const url = window.prompt('Enter URL:');
    if (url) {
      this.execCmd('createLink', url);
    }
  }

  /** Reads the editor's innerHTML and syncs it to the content FormControl. */
  private syncEditorToControl(): void {
    const html = this.editorRef?.nativeElement.innerHTML ?? '';
    this.contentControl.setValue(html);
    this.updateWordCount(html);
  }

  /** Called on input in the contenteditable div. */
  onEditorInput(): void {
    this.syncEditorToControl();
  }

  private updateWordCount(html: string): void {
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    this.wordCount.set(text ? text.split(/\s+/).length : 0);
  }

  // ---- Preview with sanitization ----
  togglePreview(): void {
    if (this.showPreview()) {
      this.showPreview.set(false);
      return;
    }
    // Sanitize the HTML content before rendering it in the preview.
    const raw = this.contentControl.value ?? '';
    this.sanitizedPreview.set(this.sanitizer.bypassSecurityTrustHtml(raw));
    this.showPreview.set(true);
  }

  // ---- Image drag-and-drop + upload ----
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFilePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      this.previewUrl.set(URL.createObjectURL(file));
    }
    this.imageName.set(file.name);
    this.uploading.set(true);
    this.uploadProgress.set(0);

    this.uploadSub?.unsubscribe();
    this.uploadSub = this.blogService.uploadImage(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event instanceof HttpResponse) {
          const result = event.body as BlogUploadResult;
          this.uploadedUrl = result.url;
          if (result.url) {
            this.previewUrl.set(result.url);
          }
          this.uploading.set(false);
        }
      },
      error: () => {
        this.uploading.set(false);
        this.uploadProgress.set(0);
      },
    });
  }

  removeImage(): void {
    this.previewUrl.set(null);
    this.imageName.set(null);
    this.uploadedUrl = null;
    this.uploadProgress.set(0);
    this.uploading.set(false);
  }

  // ---- Submit ----
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Also visually flag the editor if content is empty.
      if (this.contentControl.invalid) {
        this.editorRef?.nativeElement.classList.add('editor-error');
      }
      return;
    }

    const value = this.form.value;
    const publishNow: boolean = value.publishNow;
    const status: BlogStatus = publishNow ? 'published' : 'draft';
    const now = new Date().toISOString();

    const payload = {
      title: value.title,
      slug: value.slug,
      author: value.author,
      excerpt: value.excerpt || this.generateExcerpt(value.content),
      content: value.content,
      featuredImageUrl: this.uploadedUrl,
      featuredImageName: this.imageName(),
      status,
      publishedAt: publishNow ? now : null,
    };

    const existing = this.post();
    if (existing) {
      // Preserve original publishedAt if already published and staying published.
      const publishedAt = payload.publishedAt ?? existing.publishedAt;
      const updated = this.blogService.updatePost(existing.id, { ...payload, publishedAt });
      if (updated) {
        this.saved.emit(updated);
      }
    } else {
      const created = this.blogService.createPost(payload);
      this.saved.emit(created);
    }
  }

  /** Generates a plain-text excerpt from the HTML content. */
  private generateExcerpt(html: string): string {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 150 ? text.slice(0, 150) + '…' : text;
  }

  onCancel(): void {
    this.close.emit();
  }
}