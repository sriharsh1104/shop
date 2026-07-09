import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, orderService, paymentService, addressService } from '../services';
import { AppHeader } from '../components/common/AppHeader';
import { Button } from '../components/common/FormElements';
import type { Product, Address } from '../types';

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('productId') || '';
  const quantity = parseInt(searchParams.get('qty') || '1', 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!productId) {
        setError('Product not specified');
        setLoading(false);
        return;
      }
      try {
        const [productRes, addressRes] = await Promise.all([
          productService.getById(productId),
          addressService.list(),
        ]);
        setProduct(productRes.product);
        setAddresses(addressRes.addresses);
        const defaultAddr = addressRes.addresses.find((a) => a.isDefault);
        setSelectedAddressId(defaultAddr?.id || addressRes.addresses[0]?.id || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load checkout');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  async function handlePay() {
    if (!product || !selectedAddressId) {
      setError('Please select a delivery address');
      return;
    }

    setPaying(true);
    setError('');
    try {
      const { order } = await orderService.createOrder(product.id, quantity, selectedAddressId);
      const payment = await paymentService.create(order.id);
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Shop',
        description: product.name,
        order_id: payment.razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/settings', { state: { tab: 'orders', success: 'Payment successful! Order placed.' } });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: '#4f46e5' },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <AppHeader />
        <div className="loading-screen"><div className="spinner" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="dashboard">
        <AppHeader />
        <main className="dashboard-main">
          <div className="alert alert-error">{error || 'Product not found'}</div>
        </main>
      </div>
    );
  }

  const total = product.price * quantity;

  return (
    <div className="dashboard">
      <AppHeader />
      <main className="dashboard-main checkout-page">
        <h1>Checkout</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="checkout-grid">
          <section className="settings-card">
            <h2>Order summary</h2>
            <div className="checkout-product">
              <img src={product.image} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <p>Qty: {quantity}</p>
                <p className="product-price">₹{total.toFixed(2)}</p>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <h2>Delivery address</h2>
            {addresses.length === 0 ? (
              <div>
                <p className="empty-state">No saved addresses. Add one in Settings first.</p>
                <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
                  Go to Settings
                </button>
              </div>
            ) : (
              <div className="address-select-list">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`address-select-card ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div>
                      <strong>{addr.label}</strong>
                      {addr.isDefault && <span className="badge-default">Default</span>}
                      <p>{addr.line1}, {addr.city} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <Button
              className="btn-full"
              loading={paying}
              disabled={addresses.length === 0}
              onClick={handlePay}
            >
              Pay ₹{total.toFixed(2)} with Razorpay
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
