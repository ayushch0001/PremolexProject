import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { FirebaseDynamicService } from '../firebase-dynamic.service';

/** Base shape that all Firestore documents extend. */
export interface FirestoreDocument {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Product document shape stored in the `products` collection. */
export interface FirestoreProduct extends FirestoreDocument {
  title: string;
  slug: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId: string | null;
  imageUrl: string | null;
  imageName: string | null;
  specifications: { key: string; value: string }[];
  status: 'active' | 'draft';
}

/** Blog post document shape stored in the `blogs` collection. */
export interface FirestoreBlog extends FirestoreDocument {
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  featuredImageName: string | null;
  status: 'published' | 'draft';
  publishedAt: string | null;
}

/** Corporate page (Quality / Infrastructure) stored in the `site_pages` collection. */
export interface FirestoreSitePage extends FirestoreDocument {
  pageKey: 'quality' | 'infrastructure';
  title: string;
  content: string;
}

/** Certificate document shape stored in the `certificates` collection. */
export interface FirestoreCertificate extends FirestoreDocument {
  title: string;
  description: string;
  issueYear: number;
  imageUrl: string | null;
  imageName: string | null;
}

/** Job posting stored in the `careers` collection. */
export interface FirestoreCareer extends FirestoreDocument {
  title: string;
  department: string;
  location: string;
  shortDescription: string;
  requirements: string;
  status: 'open' | 'closed';
}

/** Category stored in the `categories` collection. */
export interface FirestoreCategory extends FirestoreDocument {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
}

/** Project item stored in the `projects` collection (homepage gallery + public pages). */
export interface FirestoreProject extends FirestoreDocument {
  title: string;
  category: string;
  image: string;
}

/** Job application submitted from the public careers page. */
export interface FirestoreJobApplication extends FirestoreDocument {
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string;
  resumeUrl: string | null;
  status: 'new' | 'reviewed' | 'contacted' | 'rejected' | 'hired';
  notes: string;
}

/** Contact query submitted from the home page contact form. */
export interface FirestoreContactQuery extends FirestoreDocument {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'reviewed' | 'contacted' | 'closed';
  notes: string;
}

// ---------------------------------------------------------------------------
// Firestore REST API types
// ---------------------------------------------------------------------------

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  timestampValue?: string;
  mapValue?: { fields?: Record<string, FirestoreValue> };
  arrayValue?: { values?: FirestoreValue[] };
}

interface FirestoreRESTDocument {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

interface FirestoreListResponse {
  documents?: FirestoreRESTDocument[];
}

interface FirestoreWriteRequest {
  fields: Record<string, FirestoreValue>;
}

const PRODUCTS_COLLECTION = 'products';
const BLOGS_COLLECTION = 'blogs';
const SITE_PAGES_COLLECTION = 'site_pages';
const CERTIFICATES_COLLECTION = 'certificates';
const CAREERS_COLLECTION = 'careers';
const CATEGORIES_COLLECTION = 'categories';
const PROJECTS_COLLECTION = 'projects';
const JOB_APPLICATIONS_COLLECTION = 'job_applications';
const CONTACT_QUERIES_COLLECTION = 'contact_queries';

/**
 * FirestoreDataService
 *
 * Performs CRUD operations against Firebase Firestore using the **Firestore
 * REST v1 API** (`https://firestore.googleapis.com/v1/...`) — the same tested
 * cURL endpoints used in the Postman collection.
 *
 * All methods return RxJS Observables so they plug directly into Angular async
 * pipes and tables. The `Authorization: Bearer <token>` header is attached
 * automatically by the global `authInterceptor` (the Firebase ID token stored
 * after login).
 */
@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
  private readonly http = inject(HttpClient);
  private readonly firebaseService = inject(FirebaseDynamicService);

  // --------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------

  /** Fetches all products from the `products` collection (sorted by title). */
  getProducts(): Observable<FirestoreProduct[]> {
    return this.listCollection(PRODUCTS_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreProduct>(doc))
          .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')),
      ),
    );
  }

  /** Fetches a single product by document id (null if not found). */
  getProductById(id: string): Observable<FirestoreProduct | null> {
    return this.getDoc(PRODUCTS_COLLECTION, id).pipe(
      map((doc) => (doc ? this.fromDoc<FirestoreProduct>(doc) : null)),
    );
  }

  /** Adds a new product document to the `products` collection. */
  addProduct(
    productData: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<FirestoreProduct> {
    const payload = this.withTimestamps(productData);
    return this.createDoc(PRODUCTS_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreProduct>(doc)),
    );
  }

  /** Updates an existing product document by id. */
  updateProduct(
    id: string,
    data: Partial<Omit<FirestoreProduct, 'id' | 'createdAt'>>,
  ): Observable<FirestoreProduct> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(PRODUCTS_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreProduct>(doc)),
    );
  }

  /** Deletes a product document by id. */
  deleteProduct(id: string): Observable<void> {
    return this.deleteDoc(PRODUCTS_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Blogs
  // --------------------------------------------------------------------------

  /** Fetches all blog posts from the `blogs` collection (newest first). */
  getBlogs(): Observable<FirestoreBlog[]> {
    return this.listCollection(BLOGS_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreBlog>(doc))
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
      ),
    );
  }

  /** Fetches a single blog post by document id (null if not found). */
  getBlogById(id: string): Observable<FirestoreBlog | null> {
    return this.getDoc(BLOGS_COLLECTION, id).pipe(
      map((doc) => (doc ? this.fromDoc<FirestoreBlog>(doc) : null)),
    );
  }

  /** Adds a new blog post document to the `blogs` collection. */
  addBlog(blogData: Omit<FirestoreBlog, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreBlog> {
    const payload = this.withTimestamps(blogData);
    return this.createDoc(BLOGS_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreBlog>(doc)),
    );
  }

  /** Updates an existing blog post document by id. */
  updateBlog(
    id: string,
    data: Partial<Omit<FirestoreBlog, 'id' | 'createdAt'>>,
  ): Observable<FirestoreBlog> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(BLOGS_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreBlog>(doc)),
    );
  }

  /** Deletes a blog post document by id. */
  deleteBlog(id: string): Observable<void> {
    return this.deleteDoc(BLOGS_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Site Pages (Quality & Infrastructure)
  // --------------------------------------------------------------------------

  /** Fetches a single site page by document id (e.g. 'quality' | 'infrastructure'). */
  getSitePage(id: string): Observable<FirestoreSitePage | null> {
    return this.getDoc(SITE_PAGES_COLLECTION, id).pipe(
      map((doc) => (doc ? this.fromDoc<FirestoreSitePage>(doc) : null)),
    );
  }

  /**
   * Fetches the content of a site page by its document id.
   * Alias for getSitePage() — returns the full page document.
   */
  getPageContent(pageId: string): Observable<FirestoreSitePage | null> {
    return this.getSitePage(pageId);
  }

  /**
   * Updates the content of a site page by its document id.
   * Creates the document if it doesn't exist yet (upsert via PATCH).
   */
  updatePageContent(pageId: string, content: any): Observable<FirestoreSitePage> {
    const payload = this.withUpdatedAt(content);
    return this.updateDoc(SITE_PAGES_COLLECTION, pageId, payload).pipe(
      map((doc) => this.fromDoc<FirestoreSitePage>(doc)),
    );
  }

  /**
   * Saves (creates or updates) a site page under a fixed document id.
   * The `pageKey` is used as the document id for stable upserts.
   */
  saveSitePage(
    pageKey: 'quality' | 'infrastructure',
    data: { title: string; content: string },
  ): Observable<FirestoreSitePage> {
    const payload = this.withUpdatedAt({ ...data, pageKey });
    return this.updateDoc(SITE_PAGES_COLLECTION, pageKey, payload).pipe(
      map((doc) => this.fromDoc<FirestoreSitePage>(doc)),
    );
  }

  // --------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------

  /** Fetches all categories (parent categories first, sorted by name). */
  getCategories(): Observable<FirestoreCategory[]> {
    return this.listCollection(CATEGORIES_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreCategory>(doc))
          .sort((a, b) => {
            // Top-level categories first (parentId === null), then by name.
            if (!a.parentId && b.parentId) return -1;
            if (a.parentId && !b.parentId) return 1;
            return (a.name ?? '').localeCompare(b.name ?? '');
          }),
      ),
    );
  }

  /** Fetches a single category by document id (null if not found). */
  getCategoryById(id: string): Observable<FirestoreCategory | null> {
    return this.getDoc(CATEGORIES_COLLECTION, id).pipe(
      map((doc) => (doc ? this.fromDoc<FirestoreCategory>(doc) : null)),
    );
  }

  /** Adds a new category document to the `categories` collection. */
  addCategory(
    data: Omit<FirestoreCategory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<FirestoreCategory> {
    const payload = this.withTimestamps(data);
    return this.createDoc(CATEGORIES_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreCategory>(doc)),
    );
  }

  /** Updates an existing category document by id. */
  updateCategory(
    id: string,
    data: Partial<Omit<FirestoreCategory, 'id' | 'createdAt'>>,
  ): Observable<FirestoreCategory> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(CATEGORIES_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreCategory>(doc)),
    );
  }

  /** Deletes a category document by id. */
  deleteCategory(id: string): Observable<void> {
    return this.deleteDoc(CATEGORIES_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Projects (Gallery)
  // --------------------------------------------------------------------------

  /** Fetches all project items for the gallery (sorted by title). */
  getProjects(): Observable<FirestoreProject[]> {
    return this.listCollection(PROJECTS_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreProject>(doc))
          .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '')),
      ),
    );
  }

  /** Adds a new project item to the `projects` collection. */
  addProject(
    data: Omit<FirestoreProject, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<FirestoreProject> {
    const payload = this.withTimestamps(data);
    return this.createDoc(PROJECTS_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreProject>(doc)),
    );
  }

  /** Deletes a project item by id. */
  deleteProject(id: string): Observable<void> {
    return this.deleteDoc(PROJECTS_COLLECTION, id);
  }

  /** Updates an existing project item by id. */
  updateProject(
    id: string,
    data: Partial<Omit<FirestoreProject, 'id' | 'createdAt'>>,
  ): Observable<FirestoreProject> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(PROJECTS_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreProject>(doc)),
    );
  }

  // --------------------------------------------------------------------------
  // Job Applications
  // --------------------------------------------------------------------------

  /** Fetches all job applications (newest first). */
  getJobApplications(): Observable<FirestoreJobApplication[]> {
    return this.listCollection(JOB_APPLICATIONS_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreJobApplication>(doc))
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
      ),
    );
  }

  /** Adds a new job application to the `job_applications` collection. */
  addJobApplication(
    data: Omit<FirestoreJobApplication, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<FirestoreJobApplication> {
    const payload = this.withTimestamps(data);
    return this.createDoc(JOB_APPLICATIONS_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreJobApplication>(doc)),
    );
  }

  /** Updates an existing job application by id. */
  updateJobApplication(
    id: string,
    data: Partial<Omit<FirestoreJobApplication, 'id' | 'createdAt'>>,
  ): Observable<FirestoreJobApplication> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(JOB_APPLICATIONS_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreJobApplication>(doc)),
    );
  }

  /** Deletes a job application by id. */
  deleteJobApplication(id: string): Observable<void> {
    return this.deleteDoc(JOB_APPLICATIONS_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Contact Queries
  // --------------------------------------------------------------------------

  /** Fetches all contact queries (newest first). */
  getContactQueries(): Observable<FirestoreContactQuery[]> {
    return this.listCollection(CONTACT_QUERIES_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreContactQuery>(doc))
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
      ),
    );
  }

  /** Adds a new contact query to the `contact_queries` collection. */
  addContactQuery(
    data: Omit<FirestoreContactQuery, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<FirestoreContactQuery> {
    const payload = this.withTimestamps(data);
    return this.createDoc(CONTACT_QUERIES_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreContactQuery>(doc)),
    );
  }

  /** Updates an existing contact query by id. */
  updateContactQuery(
    id: string,
    data: Partial<Omit<FirestoreContactQuery, 'id' | 'createdAt'>>,
  ): Observable<FirestoreContactQuery> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(CONTACT_QUERIES_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreContactQuery>(doc)),
    );
  }

  /** Deletes a contact query by id. */
  deleteContactQuery(id: string): Observable<void> {
    return this.deleteDoc(CONTACT_QUERIES_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Certificates
  // --------------------------------------------------------------------------

  /** Fetches all certificates (sorted by issueYear descending). */
  getCertificates(): Observable<FirestoreCertificate[]> {
    return this.listCollection(CERTIFICATES_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreCertificate>(doc))
          .sort((a, b) => (b.issueYear ?? 0) - (a.issueYear ?? 0)),
      ),
    );
  }

  /** Adds a new certificate document to the `certificates` collection. */
  addCertificate(
    data: Omit<FirestoreCertificate, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<FirestoreCertificate> {
    const payload = this.withTimestamps(data);
    return this.createDoc(CERTIFICATES_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreCertificate>(doc)),
    );
  }

  /** Updates an existing certificate document by id. */
  updateCertificate(
    id: string,
    data: Partial<Omit<FirestoreCertificate, 'id' | 'createdAt'>>,
  ): Observable<FirestoreCertificate> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(CERTIFICATES_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreCertificate>(doc)),
    );
  }

  /** Deletes a certificate document by id. */
  deleteCertificate(id: string): Observable<void> {
    return this.deleteDoc(CERTIFICATES_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Careers
  // --------------------------------------------------------------------------

  /** Fetches all job postings (newest first). */
  getCareers(): Observable<FirestoreCareer[]> {
    return this.listCollection(CAREERS_COLLECTION).pipe(
      map((docs) =>
        docs
          .map((doc) => this.fromDoc<FirestoreCareer>(doc))
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
      ),
    );
  }

  /** Fetches all job postings — alias for getCareers(). */
  getJobs(): Observable<FirestoreCareer[]> {
    return this.getCareers();
  }

  /** Adds a new job posting to the `careers` collection. */
  addCareer(data: Omit<FirestoreCareer, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreCareer> {
    const payload = this.withTimestamps(data);
    return this.createDoc(CAREERS_COLLECTION, payload).pipe(
      map((doc) => this.fromDoc<FirestoreCareer>(doc)),
    );
  }

  /** Adds a new job posting — alias for addCareer(). */
  addJob(data: Omit<FirestoreCareer, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreCareer> {
    return this.addCareer(data);
  }

  /** Updates an existing job posting by id. */
  updateCareer(
    id: string,
    data: Partial<Omit<FirestoreCareer, 'id' | 'createdAt'>>,
  ): Observable<FirestoreCareer> {
    const payload = this.withUpdatedAt(data);
    return this.updateDoc(CAREERS_COLLECTION, id, payload).pipe(
      map((doc) => this.fromDoc<FirestoreCareer>(doc)),
    );
  }

  /** Updates an existing job posting — alias for updateCareer(). */
  updateJob(id: string, data: Partial<Omit<FirestoreCareer, 'id' | 'createdAt'>>): Observable<FirestoreCareer> {
    return this.updateCareer(id, data);
  }

  /** Deletes a job posting by id. */
  deleteCareer(id: string): Observable<void> {
    return this.deleteDoc(CAREERS_COLLECTION, id);
  }

  /** Deletes a job posting — alias for deleteCareer(). */
  deleteJob(id: string): Observable<void> {
    return this.deleteDoc(CAREERS_COLLECTION, id);
  }

  // --------------------------------------------------------------------------
  // Private REST helpers
  // --------------------------------------------------------------------------

  private getBaseUrl(): string {
    const projectId = this.firebaseService.getConfig().projectId;
    return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  }

  private docUrl(collection: string, id: string): string {
    return `${this.getBaseUrl()}/${collection}/${id}`;
  }

  private collectionUrl(collection: string): string {
    return `${this.getBaseUrl()}/${collection}`;
  }

  private listCollection(collection: string): Observable<FirestoreRESTDocument[]> {
    return this.http.get<FirestoreListResponse>(this.collectionUrl(collection)).pipe(
      map((res) => res?.documents ?? []),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 400) {
          // Collection may not exist yet — return an empty list.
          return of([]);
        }
        throw err;
      }),
    );
  }

  private getDoc(collection: string, id: string): Observable<FirestoreRESTDocument | null> {
    return this.http.get<FirestoreRESTDocument>(this.docUrl(collection, id)).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(null);
        }
        throw err;
      }),
    );
  }

  private createDoc(collection: string, data: Record<string, unknown>): Observable<FirestoreRESTDocument> {
    const body: FirestoreWriteRequest = { fields: this.toFirestoreFields(data) };
    return this.http.post<FirestoreRESTDocument>(this.collectionUrl(collection), body);
  }

  private updateDoc(
    collection: string,
    id: string,
    data: Record<string, unknown>,
  ): Observable<FirestoreRESTDocument> {
    const fields = this.toFirestoreFields(data);
    const mask = Object.keys(fields)
      .map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`)
      .join('&');
    const body: FirestoreWriteRequest = { fields };
    return this.http.patch<FirestoreRESTDocument>(`${this.docUrl(collection, id)}?${mask}`, body);
  }

  private deleteDoc(collection: string, id: string): Observable<void> {
    return this.http.delete<void>(this.docUrl(collection, id));
  }

  private withTimestamps<T extends Record<string, unknown>>(data: T): T & { createdAt: string; updatedAt: string } {
    const now = new Date().toISOString();
    return { ...data, createdAt: now, updatedAt: now };
  }

  private withUpdatedAt<T extends Record<string, unknown>>(data: T): T & { updatedAt: string } {
    return { ...data, updatedAt: new Date().toISOString() };
  }

  /** Converts a Firestore REST document into a plain typed object (with id + timestamps). */
  private fromDoc<T extends FirestoreDocument>(doc: FirestoreRESTDocument): T {
    const raw = doc.fields
      ? (this.fromFirestoreValue({ mapValue: { fields: doc.fields } }) as Record<string, unknown>)
      : {};
    const id = doc.name?.split('/').pop() ?? '';
    const result: Record<string, unknown> = { ...raw, id };
    if (!result['createdAt'] && doc.createTime) {
      result['createdAt'] = doc.createTime;
    }
    if (!result['updatedAt'] && doc.updateTime) {
      result['updatedAt'] = doc.updateTime;
    }
    return result as T;
  }

  /** Converts a plain JS object into Firestore `fields` format. */
  private toFirestoreFields(obj: Record<string, unknown>): Record<string, FirestoreValue> {
    const fields: Record<string, FirestoreValue> = {};
    for (const [key, value] of Object.entries(obj)) {
      fields[key] = this.toFirestoreValue(value);
    }
    return fields;
  }

  private toFirestoreValue(value: unknown): FirestoreValue {
    if (value === null || value === undefined) {
      return { nullValue: null };
    }
    if (typeof value === 'string') {
      return { stringValue: value };
    }
    if (typeof value === 'boolean') {
      return { booleanValue: value };
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return { integerValue: String(value) };
      }
      return { doubleValue: value };
    }
    if (Array.isArray(value)) {
      return { arrayValue: { values: value.map((v) => this.toFirestoreValue(v)) } };
    }
    if (typeof value === 'object') {
      const fields: Record<string, FirestoreValue> = {};
      for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
        fields[key] = this.toFirestoreValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(value) };
  }

  /** Converts a Firestore value back into a plain JS value. */
  private fromFirestoreValue(value: FirestoreValue): unknown {
    if ('stringValue' in value) {
      return value.stringValue;
    }
    if ('integerValue' in value) {
      return Number(value.integerValue);
    }
    if ('doubleValue' in value) {
      return value.doubleValue;
    }
    if ('booleanValue' in value) {
      return value.booleanValue;
    }
    if ('nullValue' in value) {
      return null;
    }
    if ('timestampValue' in value) {
      return value.timestampValue;
    }
    if ('arrayValue' in value) {
      return (value.arrayValue?.values ?? []).map((v) => this.fromFirestoreValue(v));
    }
    if ('mapValue' in value) {
      const out: Record<string, unknown> = {};
      for (const [key, v] of Object.entries(value.mapValue?.fields ?? {})) {
        out[key] = this.fromFirestoreValue(v);
      }
      return out;
    }
    return null;
  }
}