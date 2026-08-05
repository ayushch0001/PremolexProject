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

const PRODUCTS_COLLECTION = 'products';
const BLOGS_COLLECTION = 'blogs';

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
}