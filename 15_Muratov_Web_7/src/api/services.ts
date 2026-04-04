import type {
  Country,
  CreatePostPayload,
  PatchPostPayload,
  Post,
  ProductsResponse,
  RegionFilter
} from '../types/api';
import { requestJson } from './http';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const PRODUCTS_URL = 'https://dummyjson.com/products';
const COUNTRIES_BASE_URL = 'https://restcountries.com/v3.1';

export const fetchPosts = async (limit = 8): Promise<Post[]> => {
  return requestJson<Post[]>(`${POSTS_URL}?_limit=${limit}`);
};

export const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  return requestJson<Post>(POSTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(payload)
  });
};

export const patchPostTitle = async (postId: number, payload: PatchPostPayload): Promise<Post> => {
  return requestJson<Post>(`${POSTS_URL}/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(payload)
  });
};

export const deletePost = async (postId: number): Promise<Record<string, never>> => {
  return requestJson<Record<string, never>>(`${POSTS_URL}/${postId}`, {
    method: 'DELETE'
  });
};

export const fetchProducts = async (query: string): Promise<ProductsResponse> => {
  const trimmedQuery = query.trim();
  const endpoint = trimmedQuery
    ? `${PRODUCTS_URL}/search?q=${encodeURIComponent(trimmedQuery)}`
    : `${PRODUCTS_URL}?limit=8`;

  return requestJson<ProductsResponse>(endpoint);
};

export const fetchCountries = async (region: RegionFilter, name: string): Promise<Country[]> => {
  const fields = 'fields=name,capital,region,population,flags';
  const trimmedName = name.trim();

  if (trimmedName) {
    return requestJson<Country[]>(`${COUNTRIES_BASE_URL}/name/${encodeURIComponent(trimmedName)}?${fields}`);
  }

  if (region !== 'all') {
    return requestJson<Country[]>(`${COUNTRIES_BASE_URL}/region/${encodeURIComponent(region)}?${fields}`);
  }

  return requestJson<Country[]>(`${COUNTRIES_BASE_URL}/all?${fields}`);
};
