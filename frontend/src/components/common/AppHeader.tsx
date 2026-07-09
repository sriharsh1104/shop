import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <Link to="/dashboard" className="logo">Shop</Link>
        <span className="header-greeting">Hello, {user?.username}</span>
      </div>
      <div className="header-right">
        <span className="user-email">{user?.email}</span>
        <Link to="/settings" className="btn btn-ghost btn-sm">Settings</Link>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
