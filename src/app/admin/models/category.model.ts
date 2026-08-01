export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  createdAt: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}