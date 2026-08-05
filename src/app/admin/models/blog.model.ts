export type BlogStatus = 'published' | 'draft';

export interface BlogPost {
  /** Firestore document ID (assigned by Firestore). */
  id?: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  featuredImageUrl: string | null;
  featuredImageName: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload accepted by create(). */
export type CreateBlogPostPayload = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;

/** Payload accepted by update(). */
export type UpdateBlogPostPayload = Partial<CreateBlogPostPayload>;