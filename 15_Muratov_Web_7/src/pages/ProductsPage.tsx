import { type FormEvent, useState } from 'react';

import { Panel } from '../components/common/Panel';
import { StatusMessage } from '../components/common/StatusMessage';
import { ProductCard } from '../components/products/ProductCard';
import { useAppStore } from '../store/useAppStore';

export const ProductsPage = (): JSX.Element => {
  const products = useAppStore((state) => state.products);
  const productsStatus = useAppStore((state) => state.productsStatus);
  const productsError = useAppStore((state) => state.productsError);
  const loadProducts = useAppStore((state) => state.loadProducts);

  const [query, setQuery] = useState('');

  const statusText =
    productsStatus === 'loading' ? 'Загрузка товаров...' :
    productsStatus === 'error' ? (productsError ?? 'Ошибка загрузки товаров') :
    productsStatus === 'empty' ? 'По запросу ничего не найдено' :
    productsStatus === 'success' ? `Найдено товаров: ${products.length}.` :
    'Введите запрос или нажмите «Показать все»';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await loadProducts(query);
  };

  return (
    <section className="page">
      <h2>API 2: DummyJSON</h2>
      <p className="page__description">Поиск и получение списка товаров (GET).</p>

      <Panel>
        <form className="form form--inline" onSubmit={(event) => { void handleSubmit(event); }}>
          <label>
            Поиск по названию
            <input
              name="query"
              type="text"
              placeholder="например: phone"
              value={query}
              onChange={(event) => { setQuery(event.target.value); }}
            />
          </label>
          <button className="btn" type="submit">Найти</button>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => {
              setQuery('');
              void loadProducts('');
            }}
          >
            Показать все
          </button>
        </form>

        <StatusMessage status={productsStatus} text={statusText} />

        <div className="cards">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Panel>
    </section>
  );
};

