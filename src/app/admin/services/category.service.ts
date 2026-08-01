import { Injectable, signal } from '@angular/core';
import { Category, CategoryTreeNode } from '../models/category.model';

/**
 * Mock CategoryService.
 *
 * Structured to mirror a standard REST API so it can be swapped for a real
 * Node.js/Express backend later. Each method maps 1:1 to an HTTP endpoint:
 *   - getCategories()        -> GET    /api/categories
 *   - createCategory(data)   -> POST   /api/categories
 *   - updateCategory(id, d)  -> PUT    /api/categories/:id
 *   - deleteCategory(id)     -> DELETE /api/categories/:id
 */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly categories = signal<Category[]>([]);

  constructor() {
    this.seed();
  }

  /** Returns the flat list of categories. */
  getCategories(): Category[] {
    return this.categories();
  }

  /** Returns categories arranged as a tree (top-level + nested subcategories). */
  getCategoryTree(): CategoryTreeNode[] {
    const flat = this.categories();
    const map = new Map<string, CategoryTreeNode>();

    flat.forEach((c) =>
      map.set(c.id, { ...c, children: [] }),
    );

    const roots: CategoryTreeNode[] = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /** Returns only top-level categories (for the Parent dropdown). */
  getTopLevelCategories(): Category[] {
    return this.categories().filter((c) => c.parentId === null);
  }

  createCategory(data: Omit<Category, 'id' | 'createdAt'>): Category {
    const category: Category = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.categories.update((list) => [...list, category]);
    return category;
  }

  updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
    let updated: Category | null = null;
    this.categories.update((list) =>
      list.map((c) => {
        if (c.id === id) {
          updated = { ...c, ...data, id, createdAt: c.createdAt };
          return updated;
        }
        return c;
      }),
    );
    return updated;
  }

  deleteCategory(id: string): void {
    // Remove the category and any subcategories that reference it as parent.
    this.categories.update((list) =>
      list.filter((c) => c.id !== id && c.parentId !== id),
    );
  }

  private seed(): void {
    const now = new Date().toISOString();
    this.categories.set([
      {
        id: 'cat-hdpe',
        name: 'HDPE Pipes',
        slug: 'hdpe-pipes',
        description: 'High-density polyethylene piping systems.',
        parentId: null,
        createdAt: now,
      },
      {
        id: 'cat-hdpe-pressure',
        name: 'Pressure Pipes',
        slug: 'hdpe-pressure-pipes',
        description: 'PE100 pressure-rated HDPE pipes.',
        parentId: 'cat-hdpe',
        createdAt: now,
      },
      {
        id: 'cat-hdpe-drainage',
        name: 'Drainage Pipes',
        slug: 'hdpe-drainage-pipes',
        description: 'Corrugated and smooth-wall drainage pipes.',
        parentId: 'cat-hdpe',
        createdAt: now,
      },
      {
        id: 'cat-pvc',
        name: 'PVC Pipes',
        slug: 'pvc-pipes',
        description: 'Rigid unplasticized PVC piping.',
        parentId: null,
        createdAt: now,
      },
      {
        id: 'cat-pvc-conduit',
        name: 'Electrical Conduit',
        slug: 'pvc-electrical-conduit',
        description: 'Flame-retardant conduit for cable protection.',
        parentId: 'cat-pvc',
        createdAt: now,
      },
      {
        id: 'cat-upvc',
        name: 'UPVC Systems',
        slug: 'upvc-systems',
        description: 'Unplasticized PVC profiles and fittings.',
        parentId: null,
        createdAt: now,
      },
      {
        id: 'cat-cpvc',
        name: 'CPVC Solutions',
        slug: 'cpvc-solutions',
        description: 'Chlorinated PVC for high-temperature plumbing.',
        parentId: null,
        createdAt: now,
      },
      {
        id: 'cat-swr',
        name: 'SWR Drainage',
        slug: 'swr-drainage',
        description: 'Soil, waste and rainwater drainage systems.',
        parentId: null,
        createdAt: now,
      },
      {
        id: 'cat-agri',
        name: 'Agriculture Pipes',
        slug: 'agriculture-pipes',
        description: 'Irrigation and farm water supply piping.',
        parentId: null,
        createdAt: now,
      },
      {
        id: 'cat-casing',
        name: 'Casing Pipes',
        slug: 'casing-pipes',
        description: 'Heavy-wall casing for borewell applications.',
        parentId: null,
        createdAt: now,
      },
    ]);
  }
}