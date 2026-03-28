import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Layout.module.css';

export default function Layout() {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navItems = [
    { to: '/', icon: '\u2302', label: 'Home' },
    { to: '/dashboard', icon: '\u2261', label: 'Dashboard' },
    { to: '/profile', icon: '\u263A', label: 'Profile' },
    ...(isAdmin ? [{ to: '/admin', icon: '\u2699', label: 'Admin' }] : []),
  ];

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>LUMINA</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.navIcon}>{'\u2192'}</span>
          Logout
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => isActive ? styles.bottomNavLinkActive : styles.bottomNavLink}
            >
              <span>{item.icon}</span>
              <span className={styles.bottomNavLabel}>{item.label}</span>
            </NavLink>
          ))}
          <button
            className={styles.bottomNavLink}
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span>{'\u2192'}</span>
            <span className={styles.bottomNavLabel}>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
