import { useState, useEffect } from 'react';
import { productService } from '../services';
import { Product } from '../types';
import { AppHeader } from '../components/common/AppHeader';
import { ProductGrid } from '../components/products/ProductCard';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    productService.getCategories().then(({ categories }) => setCategories(categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    productService
      .getAll(activeCategory || undefined)
      .then(({ products }) => setProducts(products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="dashboard">
      <AppHeader />

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <h1>Our Products</h1>
          <p>Discover our curated collection of quality products</p>
        </div>

        <div className="category-filters">
          <button
            className={`filter-chip ${!activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-screen">
            <div className="spinner" />
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && <ProductGrid products={products} />}
      </main>
    </div>
  );
}
