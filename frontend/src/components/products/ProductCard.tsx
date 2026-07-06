import { useState } from 'react';
import { Product } from '../../types';
import { orderService } from '../../services';

export function ProductCard({
  product,
  onPurchased,
}: {
  product: Product;
  onPurchased?: () => void;
}) {
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState('');

  async function handleBuy() {
    if (product.stock < 1) return;
    setBuying(true);
    setMessage('');
    try {
      const { message: successMsg } = await orderService.buy(product.id, 1);
      setMessage(successMsg);
      onPurchased?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBuying(false);
    }
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
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleBuy}
            disabled={buying || product.stock < 1}
          >
            {buying ? 'Buying...' : product.stock < 1 ? 'Out of Stock' : 'Buy Now'}
          </button>
        </div>
        {message && <p className="product-buy-msg">{message}</p>}
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  onPurchased,
}: {
  products: Product[];
  onPurchased?: () => void;
}) {
  if (products.length === 0) {
    return <div className="empty-state">No products found.</div>;
  }

  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onPurchased={onPurchased} />
      ))}
    </div>
  );
}
