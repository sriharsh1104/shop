import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductCard';

export default function DashboardPage() {
  const { user, logout } = useAuth();
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

  function refreshProducts() {
    productService
      .getAll(activeCategory || undefined)
      .then(({ products }) => setProducts(products))
      .catch((err) => setError(err.message));
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo">Shop</span>
          <span className="header-greeting">Hello, {user?.username}</span>
        </div>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

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

        {!loading && !error && <ProductGrid products={products} onPurchased={refreshProducts} />}
      </main>
    </div>
  );
}
