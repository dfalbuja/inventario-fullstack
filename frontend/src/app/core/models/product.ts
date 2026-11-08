export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  stock: number;
}

export type CreateProductRequest = Omit<Product, 'id'>;

export type ProductRequest = Omit<CreateProductRequest, 'stock'>;

export type ProductFilters = {
  name?: string | null;
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
};
