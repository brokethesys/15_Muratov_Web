import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { usePreloadData } from './hooks/usePreloadData';
import { CountriesPage } from './pages/CountriesPage';
import { HomePage } from './pages/HomePage';
import { PostsPage } from './pages/PostsPage';
import { ProductsPage } from './pages/ProductsPage';

export const App = (): JSX.Element => {
  usePreloadData();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};
