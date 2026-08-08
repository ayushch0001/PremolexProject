import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
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

const PRODUCTS_COLLECTION = 'products';
const BLOGS_COLLECTION = 'blogs';
const SITE_PAGES_COLLECTION = 'site_pages';
const CERTIFICATES_COLLECTION = 'certificates';
const CAREERS_COLLECTION = 'careers';

/**
 * FirestoreDataService
 *
 * Performs CRUD operations against Firebase Firestore using the standard
 * Firebase JS SDK (`firebase/firestore`). All methods return RxJS Observables
 * (via `from()`) so they plug directly into Angular async pipes and tables.
 *
 * The service checks that Firebase is initialized (via FirebaseDynamicService)
 * before any database call; if not, it throws a clear error directing the
 * user to the setup page.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
  private readonly firebaseService = inject(FirebaseDynamicService);

  // --------------------------------------------------------------------------
  // Products
  // --------------------------------------------------------------------------

  /** Fetches all products from the `products` collection (ordered by title). */
  getProducts(): Observable<FirestoreProduct[]> {
    return from(this.fetchProducts());
  }

  /** Fetches a single product by document id. */
  getProductById(id: string): Observable<FirestoreProduct | null> {
    return from(this.fetchProductById(id));
  }

  /** Adds a new product document to the `products` collection. */
  addProduct(productData: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreProduct> {
    return from(this.createProduct(productData));
  }

  /** Updates an existing product document by id. */
  updateProduct(id: string, data: Partial<Omit<FirestoreProduct, 'id' | 'createdAt'>>): Observable<FirestoreProduct> {
    return from(this.updateProductById(id, data));
  }

  /** Deletes a product document by id. */
  deleteProduct(id: string): Observable<void> {
    return from(this.deleteProductById(id));
  }

  // --------------------------------------------------------------------------
  // Blogs
  // --------------------------------------------------------------------------

  /** Fetches all blog posts from the `blogs` collection (ordered by createdAt). */
  getBlogs(): Observable<FirestoreBlog[]> {
    return from(this.fetchBlogs());
  }

  /** Fetches a single blog post by document id. */
  getBlogById(id: string): Observable<FirestoreBlog | null> {
    return from(this.fetchBlogById(id));
  }

  /** Adds a new blog post document to the `blogs` collection. */
  addBlog(blogData: Omit<FirestoreBlog, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreBlog> {
    return from(this.createBlog(blogData));
  }

  /** Updates an existing blog post document by id. */
  updateBlog(id: string, data: Partial<Omit<FirestoreBlog, 'id' | 'createdAt'>>): Observable<FirestoreBlog> {
    return from(this.updateBlogById(id, data));
  }

  /** Deletes a blog post document by id. */
  deleteBlog(id: string): Observable<void> {
    return from(this.deleteBlogById(id));
  }

  // --------------------------------------------------------------------------
  // Site Pages (Quality & Infrastructure)
  // --------------------------------------------------------------------------

  /** Fetches a single site page by document id (e.g. 'quality' | 'infrastructure'). */
  getSitePage(id: string): Observable<FirestoreSitePage | null> {
    return from(this.fetchSitePage(id));
  }

  /**
   * Fetches the content of a site page by its document id.
   * Alias for getSitePage() — returns the full page document.
   */
  getPageContent(pageId: string): Observable<FirestoreSitePage | null> {
    return from(this.fetchSitePage(pageId));
  }

  /**
   * Updates the content of a site page by its document id.
   * Creates the document if it doesn't exist yet (upsert).
   */
  updatePageContent(pageId: string, content: any): Observable<FirestoreSitePage> {
    return from(this.updateSitePageContent(pageId, content));
  }

  /**
   * Saves (creates or updates) a site page under a fixed document id.
   * The `pageKey` is used as the document id for stable upserts.
   */
  saveSitePage(pageKey: 'quality' | 'infrastructure', data: { title: string; content: string }): Observable<FirestoreSitePage> {
    return from(this.saveSitePageByKey(pageKey, data));
  }

  // --------------------------------------------------------------------------
  // Certificates
  // --------------------------------------------------------------------------

  /** Fetches all certificates (ordered by issueYear descending). */
  getCertificates(): Observable<FirestoreCertificate[]> {
    return from(this.fetchCertificates());
  }

  /** Adds a new certificate document to the `certificates` collection. */
  addCertificate(data: Omit<FirestoreCertificate, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreCertificate> {
    return from(this.createCertificate(data));
  }

  /** Updates an existing certificate document by id. */
  updateCertificate(id: string, data: Partial<Omit<FirestoreCertificate, 'id' | 'createdAt'>>): Observable<FirestoreCertificate> {
    return from(this.updateCertificateById(id, data));
  }

  /** Deletes a certificate document by id. */
  deleteCertificate(id: string): Observable<void> {
    return from(this.deleteCertificateById(id));
  }

  // --------------------------------------------------------------------------
  // Careers
  // --------------------------------------------------------------------------

  /** Fetches all job postings (ordered by createdAt descending). */
  getCareers(): Observable<FirestoreCareer[]> {
    return from(this.fetchCareers());
  }

  /** Fetches all job postings — alias for getCareers(). */
  getJobs(): Observable<FirestoreCareer[]> {
    return from(this.fetchCareers());
  }

  /** Adds a new job posting to the `careers` collection. */
  addCareer(data: Omit<FirestoreCareer, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreCareer> {
    return from(this.createCareer(data));
  }

  /** Adds a new job posting — alias for addCareer(). */
  addJob(data: Omit<FirestoreCareer, 'id' | 'createdAt' | 'updatedAt'>): Observable<FirestoreCareer> {
    return from(this.createCareer(data));
  }

  /** Updates an existing job posting by id. */
  updateCareer(id: string, data: Partial<Omit<FirestoreCareer, 'id' | 'createdAt'>>): Observable<FirestoreCareer> {
    return from(this.updateCareerById(id, data));
  }

  /** Updates an existing job posting — alias for updateCareer(). */
  updateJob(id: string, data: Partial<Omit<FirestoreCareer, 'id' | 'createdAt'>>): Observable<FirestoreCareer> {
    return from(this.updateCareerById(id, data));
  }

  /** Deletes a job posting by id. */
  deleteCareer(id: string): Observable<void> {
    return from(this.deleteCareerById(id));
  }

  /** Deletes a job posting — alias for deleteCareer(). */
  deleteJob(id: string): Observable<void> {
    return from(this.deleteCareerById(id));
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  /**
   * Returns the Firestore instance or throws a clear error if Firebase
   * has not been dynamically initialized.
   */
  private requireFirestore(): Firestore {
    const db = this.firebaseService.getFirestoreInstance();
    if (!db || !this.firebaseService.isFirebaseConnected()) {
      throw new Error('Database not connected. Please visit /firebase-setup.');
    }
    return db;
  }

  private async fetchProducts(): Promise<FirestoreProduct[]> {
    const db = this.requireFirestore();
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('title', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreProduct) }));
  }

  private async fetchProductById(id: string): Promise<FirestoreProduct | null> {
    const db = this.requireFirestore();
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...(snap.data() as FirestoreProduct) };
  }

  private async createProduct(
    data: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FirestoreProduct> {
    const db = this.requireFirestore();
    const now = new Date().toISOString();
    const payload = { ...data, createdAt: now, updatedAt: now };
    const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), payload);
    return { id: ref.id, ...payload };
  }

  private async updateProductById(
    id: string,
    data: Partial<Omit<FirestoreProduct, 'id' | 'createdAt'>>,
  ): Promise<FirestoreProduct> {
    const db = this.requireFirestore();
    const ref = doc(db, PRODUCTS_COLLECTION, id);
    const updates = { ...data, updatedAt: new Date().toISOString() };
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Product with id "${id}" not found.`);
    }
    return { id: snap.id, ...(snap.data() as FirestoreProduct) };
  }

  private async deleteProductById(id: string): Promise<void> {
    const db = this.requireFirestore();
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  }

  private async fetchBlogs(): Promise<FirestoreBlog[]> {
    const db = this.requireFirestore();
    const q = query(collection(db, BLOGS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreBlog) }));
  }

  private async fetchBlogById(id: string): Promise<FirestoreBlog | null> {
    const db = this.requireFirestore();
    const ref = doc(db, BLOGS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...(snap.data() as FirestoreBlog) };
  }

  private async createBlog(
    data: Omit<FirestoreBlog, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FirestoreBlog> {
    const db = this.requireFirestore();
    const now = new Date().toISOString();
    const payload = { ...data, createdAt: now, updatedAt: now };
    const ref = await addDoc(collection(db, BLOGS_COLLECTION), payload);
    return { id: ref.id, ...payload };
  }

  private async updateBlogById(
    id: string,
    data: Partial<Omit<FirestoreBlog, 'id' | 'createdAt'>>,
  ): Promise<FirestoreBlog> {
    const db = this.requireFirestore();
    const ref = doc(db, BLOGS_COLLECTION, id);
    const updates = { ...data, updatedAt: new Date().toISOString() };
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Blog post with id "${id}" not found.`);
    }
    return { id: snap.id, ...(snap.data() as FirestoreBlog) };
  }

  private async deleteBlogById(id: string): Promise<void> {
    const db = this.requireFirestore();
    await deleteDoc(doc(db, BLOGS_COLLECTION, id));
  }

  // ---- Site pages ----

  private async fetchSitePage(id: string): Promise<FirestoreSitePage | null> {
    const db = this.requireFirestore();
    const ref = doc(db, SITE_PAGES_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...(snap.data() as FirestoreSitePage) };
  }

  private async saveSitePageByKey(
    pageKey: 'quality' | 'infrastructure',
    data: { title: string; content: string },
  ): Promise<FirestoreSitePage> {
    const db = this.requireFirestore();
    const ref = doc(db, SITE_PAGES_COLLECTION, pageKey);
    const now = new Date().toISOString();
    const payload = { ...data, pageKey, updatedAt: now };

    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, payload);
    } else {
      // Use setDoc with the pageKey as the fixed document id.
      await setDoc(ref, { ...payload, createdAt: now });
    }

    const snap = await getDoc(ref);
    return { id: snap.id, ...(snap.data() as FirestoreSitePage) };
  }

  /**
   * Updates (or creates) a site page document by its id.
   * Used by the public `updatePageContent()` method.
   */
  private async updateSitePageContent(pageId: string, content: any): Promise<FirestoreSitePage> {
    const db = this.requireFirestore();
    const ref = doc(db, SITE_PAGES_COLLECTION, pageId);
    const now = new Date().toISOString();
    const payload = { ...content, updatedAt: now };

    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, { ...payload, createdAt: now });
    }

    const snap = await getDoc(ref);
    return { id: snap.id, ...(snap.data() as FirestoreSitePage) };
  }

  // ---- Certificates ----

  private async fetchCertificates(): Promise<FirestoreCertificate[]> {
    const db = this.requireFirestore();
    const q = query(collection(db, CERTIFICATES_COLLECTION), orderBy('issueYear', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreCertificate) }));
  }

  private async createCertificate(
    data: Omit<FirestoreCertificate, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FirestoreCertificate> {
    const db = this.requireFirestore();
    const now = new Date().toISOString();
    const payload = { ...data, createdAt: now, updatedAt: now };
    const ref = await addDoc(collection(db, CERTIFICATES_COLLECTION), payload);
    return { id: ref.id, ...payload };
  }

  private async updateCertificateById(
    id: string,
    data: Partial<Omit<FirestoreCertificate, 'id' | 'createdAt'>>,
  ): Promise<FirestoreCertificate> {
    const db = this.requireFirestore();
    const ref = doc(db, CERTIFICATES_COLLECTION, id);
    const updates = { ...data, updatedAt: new Date().toISOString() };
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Certificate with id "${id}" not found.`);
    }
    return { id: snap.id, ...(snap.data() as FirestoreCertificate) };
  }

  private async deleteCertificateById(id: string): Promise<void> {
    const db = this.requireFirestore();
    await deleteDoc(doc(db, CERTIFICATES_COLLECTION, id));
  }

  // ---- Careers ----

  private async fetchCareers(): Promise<FirestoreCareer[]> {
    const db = this.requireFirestore();
    const q = query(collection(db, CAREERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreCareer) }));
  }

  private async createCareer(
    data: Omit<FirestoreCareer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FirestoreCareer> {
    const db = this.requireFirestore();
    const now = new Date().toISOString();
    const payload = { ...data, createdAt: now, updatedAt: now };
    const ref = await addDoc(collection(db, CAREERS_COLLECTION), payload);
    return { id: ref.id, ...payload };
  }

  private async updateCareerById(
    id: string,
    data: Partial<Omit<FirestoreCareer, 'id' | 'createdAt'>>,
  ): Promise<FirestoreCareer> {
    const db = this.requireFirestore();
    const ref = doc(db, CAREERS_COLLECTION, id);
    const updates = { ...data, updatedAt: new Date().toISOString() };
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error(`Job posting with id "${id}" not found.`);
    }
    return { id: snap.id, ...(snap.data() as FirestoreCareer) };
  }

  private async deleteCareerById(id: string): Promise<void> {
    const db = this.requireFirestore();
    await deleteDoc(doc(db, CAREERS_COLLECTION, id));
  }
}
