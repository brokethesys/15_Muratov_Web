import type { Product } from '../../types/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps): JSX.Element => {
  return (
    <article className="card">
      <h4>{product.title}</h4>
      <p>{product.description}</p>
      <div className="card__meta">
        <span className="tag">Категория: {product.category}</span>
        <span className="tag">Цена: ${product.price}</span>
        <span className="tag">Рейтинг: {product.rating}</span>
        <span className="tag">Остаток: {product.stock}</span>
      </div>
    </article>
  );
};
