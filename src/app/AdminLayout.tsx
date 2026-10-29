import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuthStore } from '@/features/auth/stores/authStore';

const LINKS = [
  { to: '/orders', text: 'Orders' },
  { to: '/shipments', text: 'Shipments' },
  { to: '/payments', text: 'Payments' },
  { to: '/courier-receipts', text: 'Courier receipts' },
  { to: '/parts', text: 'Parts' },
  { to: '/catalog', text: 'Catalog' },
];

export const AdminLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <p className="sidebar-brand">MotoXpress Admin</p>
        <nav aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.text}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <p>{user?.name}</p>
          <button type="button" className="link-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>

      <ToastContainer position="bottom-right" autoClose={4000} newestOnTop pauseOnHover theme="colored" />
    </div>
  );
};
