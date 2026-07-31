export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  subtitle: string;
  categoryId: string;
  category: string;
  imageUrl: string;
  specifications: ProductSpecification[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}