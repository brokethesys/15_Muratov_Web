import { create } from 'zustand';

import {
  createPost,
  deletePost,
  fetchCountries,
  fetchPosts,
  fetchProducts,
  patchPostTitle
} from '../api/services';
import type {
  AsyncStatus,
  Country,
  CreatePostPayload,
  Post,
  Product,
  RegionFilter
} from '../types/api';

interface AppStoreState {
  posts: Post[];
  hiddenPostIds: number[];
  postsStatus: AsyncStatus;
  postsError: string | null;

  products: Product[];
  productsStatus: AsyncStatus;
  productsError: string | null;

  countries: Country[];
  countriesStatus: AsyncStatus;
  countriesError: string | null;

  preloadStatus: AsyncStatus;
  preloadMessage: string;

  loadPosts: () => Promise<void>;
  createPostAction: (payload: CreatePostPayload) => Promise<Post>;
  patchPostTitleAction: (postId: number, title: string) => Promise<Post>;
  deletePostAction: (postId: number) => Promise<Record<string, never>>;

  loadProducts: (query: string) => Promise<void>;
  loadCountries: (region: RegionFilter, name: string) => Promise<void>;
  preloadAll: () => Promise<void>;
}

const toReadableError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка.';
};

const mapCountriesForView = (countries: Country[], region: RegionFilter): Country[] => {
  const regionFiltered = region === 'all'
    ? countries
    : countries.filter((country) => country.region?.toLowerCase() === region.toLowerCase());

  return [...regionFiltered]
    .sort((a, b) => (a.name?.common ?? '').localeCompare(b.name?.common ?? ''))
    .slice(0, 12);
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  posts: [],
  hiddenPostIds: [],
  postsStatus: 'idle',
  postsError: null,

  products: [],
  productsStatus: 'idle',
  productsError: null,

  countries: [],
  countriesStatus: 'idle',
  countriesError: null,

  preloadStatus: 'idle',
  preloadMessage: 'Предзагрузка ещё не запускалась.',

  loadPosts: async () => {
    set({ postsStatus: 'loading', postsError: null });

    try {
      const posts = await fetchPosts(8);
      const visiblePosts = posts.filter((post) => !get().hiddenPostIds.includes(post.id));

      set({
        posts,
        postsStatus: visiblePosts.length ? 'success' : 'empty',
        postsError: null
      });
    } catch (error) {
      set({
        postsStatus: 'error',
        postsError: toReadableError(error)
      });
    }
  },

  createPostAction: async (payload) => {
    const createdPost = await createPost(payload);

    set((state) => ({
      posts: [createdPost, ...state.posts]
    }));

    return createdPost;
  },

  patchPostTitleAction: async (postId, title) => {
    const updatedPost = await patchPostTitle(postId, { title });

    set((state) => ({
      posts: state.posts.map((post) => (post.id === postId ? { ...post, title: updatedPost.title } : post))
    }));

    return updatedPost;
  },

  deletePostAction: async (postId) => {
    const response = await deletePost(postId);

    set((state) => ({
      hiddenPostIds: state.hiddenPostIds.includes(postId)
        ? state.hiddenPostIds
        : [...state.hiddenPostIds, postId]
    }));

    return response;
  },

  loadProducts: async (query) => {
    set({ productsStatus: 'loading', productsError: null });

    try {
      const data = await fetchProducts(query);
      const products = Array.isArray(data.products) ? data.products : [];

      set({
        products,
        productsStatus: products.length ? 'success' : 'empty',
        productsError: null
      });
    } catch (error) {
      set({
        productsStatus: 'error',
        productsError: toReadableError(error)
      });
    }
  },

  loadCountries: async (region, name) => {
    set({ countriesStatus: 'loading', countriesError: null });

    try {
      const data = await fetchCountries(region, name);
      const countries = mapCountriesForView(data, region);

      set({
        countries,
        countriesStatus: countries.length ? 'success' : 'empty',
        countriesError: null
      });
    } catch (error) {
      set({
        countriesStatus: 'error',
        countriesError: toReadableError(error)
      });
    }
  },

  preloadAll: async () => {
    const currentStatus = get().preloadStatus;
    if (currentStatus === 'loading' || currentStatus === 'success') {
      return;
    }

    set({
      preloadStatus: 'loading',
      preloadMessage: 'Выполняется предзагрузка данных...'
    });

    const [postsResult, productsResult, countriesResult] = await Promise.allSettled([
      fetchPosts(8),
      fetchProducts(''),
      fetchCountries('all', '')
    ]);

    const nextState: Partial<AppStoreState> = {};
    const errors: string[] = [];

    if (postsResult.status === 'fulfilled') {
      nextState.posts = postsResult.value;
      nextState.postsStatus = postsResult.value.length ? 'success' : 'empty';
      nextState.postsError = null;
    } else {
      nextState.postsStatus = 'error';
      nextState.postsError = toReadableError(postsResult.reason);
      errors.push(`Posts: ${toReadableError(postsResult.reason)}`);
    }

    if (productsResult.status === 'fulfilled') {
      const products = Array.isArray(productsResult.value.products) ? productsResult.value.products : [];
      nextState.products = products;
      nextState.productsStatus = products.length ? 'success' : 'empty';
      nextState.productsError = null;
    } else {
      nextState.productsStatus = 'error';
      nextState.productsError = toReadableError(productsResult.reason);
      errors.push(`Products: ${toReadableError(productsResult.reason)}`);
    }

    if (countriesResult.status === 'fulfilled') {
      const countries = mapCountriesForView(countriesResult.value, 'all');
      nextState.countries = countries;
      nextState.countriesStatus = countries.length ? 'success' : 'empty';
      nextState.countriesError = null;
    } else {
      nextState.countriesStatus = 'error';
      nextState.countriesError = toReadableError(countriesResult.reason);
      errors.push(`Countries: ${toReadableError(countriesResult.reason)}`);
    }

    if (errors.length) {
      nextState.preloadStatus = 'error';
      nextState.preloadMessage = `Предзагрузка завершена с ошибками: ${errors.join(' | ')}`;
    } else {
      nextState.preloadStatus = 'success';
      nextState.preloadMessage = 'Предзагрузка выполнена успешно.';
    }

    set(nextState);
  }
}));

