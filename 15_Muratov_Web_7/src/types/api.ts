export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  userId: number;
}

export interface PatchPostPayload {
  title: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
}

export interface ProductsResponse {
  products: Product[];
}

export interface Country {
  name: {
    common: string;
  };
  capital?: string[];
  region?: string;
  population?: number;
  flags: {
    png?: string;
    svg?: string;
  };
}

export type RegionFilter = 'all' | 'europe' | 'asia' | 'africa' | 'americas' | 'oceania';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';
