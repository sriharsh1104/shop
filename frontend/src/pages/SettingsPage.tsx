import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, addressService, orderService } from '../services';
import { AppHeader } from '../components/common/AppHeader';
import { Input, Button } from '../components/common/FormElements';
import type { Address, AddressInput, Order } from '../types';

type Tab = 'profile' | 'addresses' | 'orders';

const emptyAddress: AddressInput = {
  label: 'Home',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  latitude: null,
  longitude: null,
  isDefault: false,
};

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as { tab?: Tab } | null)?.tab || 'profile';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressMsg, setAddressMsg] = useState('');
  const [addressError, setAddressError] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersMsg] = useState(
    (location.state as { success?: string } | null)?.success || ''
  );

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'addresses') loadAddresses();
    if (tab === 'orders') loadOrders();
  }, [tab]);

  async function loadAddresses() {
    try {
      const { addresses: list } = await addressService.list();
      setAddresses(list);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Failed to load addresses');
    }
  }

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const { orders: list } = await orderService.getMyOrders();
      setOrders(list);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileMsg('');
    try {
      const res = await userService.updateProfile({ username, phone });
      setUser(res.user);
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setProfileLoading(false);
    }
  }

  function startEditAddress(address: Address) {
    setEditingId(address.id);
    setAddressForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      latitude: address.latitude,
      longitude: address.longitude,
      isDefault: address.isDefault,
    });
  }

  function resetAddressForm() {
    setEditingId(null);
    setAddressForm(emptyAddress);
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setAddressError('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setAddressError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddressForm((prev) => ({ ...prev, latitude, longitude }));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};
          setAddressForm((prev) => ({
            ...prev,
            city: addr.city || addr.town || addr.village || prev.city,
            state: addr.state || prev.state,
            pincode: addr.postcode || prev.pincode,
            line1: data.display_name?.split(',').slice(0, 2).join(', ') || prev.line1,
          }));
          setAddressMsg('Location captured');
        } catch {
          setAddressMsg('Coordinates saved. Fill address details manually.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setAddressError('Unable to get your location. Please allow location access.');
        setLocating(false);
      }
    );
  }

  async function handleAddressSubmit(e: FormEvent) {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError('');
    setAddressMsg('');
    try {
      if (editingId) {
        await addressService.update(editingId, addressForm);
        setAddressMsg('Address updated');
      } else {
        await addressService.create(addressForm);
        setAddressMsg('Address saved');
      }
      resetAddressForm();
      await loadAddresses();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await addressService.delete(id);
      if (editingId === id) resetAddressForm();
      await loadAddresses();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Failed to delete address');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await addressService.setDefault(id);
      await loadAddresses();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Failed to set default');
    }
  }

  return (
    <div className="dashboard">
      <AppHeader />
      <main className="dashboard-main settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            Back to shop
          </button>
        </div>

        <div className="settings-tabs">
          {(['profile', 'addresses', 'orders'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`settings-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'profile' ? 'Profile' : t === 'addresses' ? 'Addresses' : 'Orders'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <section className="settings-card">
            <h2>Profile details</h2>
            <form onSubmit={handleProfileSave} className="auth-form">
              {profileError && <div className="alert alert-error">{profileError}</div>}
              {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
              <Input label="Email" type="email" value={user?.email || ''} disabled />
              <Input
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="submit" loading={profileLoading}>Save profile</Button>
            </form>
          </section>
        )}

        {tab === 'addresses' && (
          <section className="settings-grid">
            <div className="settings-card">
              <h2>{editingId ? 'Edit address' : 'Add address'}</h2>
              <form onSubmit={handleAddressSubmit} className="auth-form">
                {addressError && <div className="alert alert-error">{addressError}</div>}
                {addressMsg && <div className="alert alert-success">{addressMsg}</div>}
                <Input
                  label="Label"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="Home, Work..."
                  required
                />
                <Input
                  label="Address line 1"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  required
                />
                <Input
                  label="Address line 2"
                  value={addressForm.line2 || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                />
                <Input
                  label="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  required
                />
                <Input
                  label="Pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  required
                  maxLength={6}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-full"
                  onClick={useCurrentLocation}
                  disabled={locating}
                >
                  {locating ? 'Getting location...' : 'Use current location'}
                </button>
                {(addressForm.latitude != null && addressForm.longitude != null) && (
                  <p className="dev-hint">
                    Location: {addressForm.latitude.toFixed(5)}, {addressForm.longitude.toFixed(5)}
                  </p>
                )}
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  Set as default delivery address
                </label>
                <div className="form-actions">
                  <Button type="submit" loading={addressLoading}>
                    {editingId ? 'Update address' : 'Save address'}
                  </Button>
                  {editingId && (
                    <button type="button" className="btn btn-ghost" onClick={resetAddressForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="settings-card">
              <h2>Saved addresses</h2>
              {addresses.length === 0 ? (
                <p className="empty-state">No addresses saved yet.</p>
              ) : (
                <div className="address-list">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="address-card">
                      <div className="address-card-header">
                        <strong>{addr.label}</strong>
                        {addr.isDefault && <span className="badge-default">Default</span>}
                      </div>
                      <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                      {addr.latitude != null && (
                        <p className="address-coords">
                          {addr.latitude.toFixed(4)}, {addr.longitude?.toFixed(4)}
                        </p>
                      )}
                      <div className="address-actions">
                        {!addr.isDefault && (
                          <button className="link-btn" onClick={() => handleSetDefault(addr.id)}>
                            Set default
                          </button>
                        )}
                        <button className="link-btn" onClick={() => startEditAddress(addr)}>
                          Edit
                        </button>
                        <button className="link-btn danger" onClick={() => handleDeleteAddress(addr.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === 'orders' && (
          <section className="settings-card">
            <h2>Order history</h2>
            {ordersMsg && <div className="alert alert-success">{ordersMsg}</div>}
            {ordersLoading ? (
              <div className="loading-screen"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <p className="empty-state">No orders yet.</p>
            ) : (
              <div className="order-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <strong>{order.productName}</strong>
                      <span className={`order-status status-${order.status}`}>{order.status.replace('_', ' ')}</span>
                    </div>
                    <p>Qty: {order.quantity} · ₹{order.totalPrice.toFixed(2)}</p>
                    <p className="order-address">
                      Deliver to: {order.shippingAddress.line1}, {order.shippingAddress.city}
                    </p>
                    <p className="order-date">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
