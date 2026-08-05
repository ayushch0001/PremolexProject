export type ProductStatus = 'active' | 'draft';

export interface Specification {
  key: string;
  value: string;
}

export interface Product {
  /** Firestore document ID (assigned by Firestore). */
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId: string | null;
  imageUrl: string | null;
  imageName: string | null;
  specifications: Specification[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by create(). */
export type CreateProductPayload = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/** Payload accepted by update(). */
export type UpdateProductPayload = Partial<CreateProductPayload>;