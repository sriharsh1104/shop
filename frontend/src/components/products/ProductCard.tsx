import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';

export function ProductCard({
  product,
}: {
  product: Product;
  onPurchased?: () => void;
}) {
  const navigate = useNavigate();

  function handleBuy() {
    if (product.stock < 1) return;
    navigate(`/checkout?productId=${product.id}&qty=1`);
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-category">{product.category}</span>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-meta">
          <span className="product-rating">★ {product.rating}</span>
          <span className="product-stock">{product.stock} in stock</span>
        </div>
        <div className="product-footer">
          <span className="product-price">₹{product.price.toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleBuy}
            disabled={product.stock < 1}
          >
            {product.stock < 1 ? 'Out of Stock' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
}: {
  products: Product[];
}) {
  if (products.length === 0) {
    return <div className="empty-state">No products found.</div>;
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
