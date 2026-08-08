import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { FirebaseDynamicService } from '../firebase-dynamic.service';

export interface StorageUploadResult {
  url: string;
  name: string;
  size: number;
}

/**
 * FirebaseStorageService
 *
 * Uploads and reads files from Firebase Cloud Storage using the **Storage
 * REST v1 API** (`https://firebasestorage.googleapis.com/v0/b/<bucket>/o`).
 *
 * Upload flow (matches the tested `saveImage` cURL):
 *   POST https://firebasestorage.googleapis.com/v0/b/<bucket>/o?name=<path>
 *   Content-Type: <file mime type>
 *   Body: raw file bytes
 *   Authorization: Bearer <Firebase ID token>  (attached by authInterceptor)
 *
 * Read flow (matches the tested `readImages` cURL):
 *   GET https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?alt=media
 */
@Injectable({ providedIn: 'root' })
export class FirebaseStorageService {
  private readonly http = inject(HttpClient);
  private readonly firebaseService = inject(FirebaseDynamicService);

  /**
   * Uploads a file to Firebase Storage under the given path (e.g. `product_images/img1`).
   * Emits an `HttpEvent` stream (Sent -> UploadProgress -> Response) so the UI
   * can show progress, mirroring the mock upload pattern already in the app.
   */
  uploadFile(file: File, path: string): Observable<HttpEvent<StorageUploadResult>> {
    const bucket = this.firebaseService.getConfig().storageBucket;
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(path)}`;

    // Build the final download URL for previews.
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;

    // Emit a "Sent" event first, then the actual upload request.
    const sent$ = of<HttpEvent<StorageUploadResult>>({ type: HttpEventType.Sent }).pipe(delay(80));

    const upload$ = this.http.post<{ name: string; bucket: string }>(url, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      reportProgress: true,
      observe: 'events',
    });

    return sent$.pipe(
      concatMap(() => upload$),
      concatMap((event) => {
        if (event.type === HttpEventType.Response) {
          const result: StorageUploadResult = {
            url: downloadUrl,
            name: file.name,
            size: file.size,
          };
          return of<HttpEvent<StorageUploadResult>>(
            new HttpResponse<StorageUploadResult>({ status: 200, statusText: 'OK', body: result }),
          );
        }
        return of(event as HttpEvent<StorageUploadResult>);
      }),
    );
  }

  /**
   * Reads a file from Firebase Storage by its encoded path.
   * Returns the public download URL (alt=media).
   */
  getDownloadUrl(path: string): string {
    const bucket = this.firebaseService.getConfig().storageBucket;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
  }
}