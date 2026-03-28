import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authFetch, API_BASE } from '../api/client';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  async function loadData() {
    try {
      const [usersRes, postsRes] = await Promise.all([
        authFetch(`${API_BASE}/auth/users`),
        fetch(`${API_BASE}/posts`),
      ]);
      setUsers(await usersRes.json());
      setPosts(await postsRes.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await authFetch(`${API_BASE}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) loadData();
    } catch {}
  }

  async function deleteUser(userId) {
    if (userId === user.id) return;
    try {
      const res = await authFetch(`${API_BASE}/auth/users/${userId}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch {}
  }

  async function deletePost(postId) {
    try {
      const res = await authFetch(`${API_BASE}/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch {}
  }

  if (!isAdmin) {
    return (
      <div className={styles.forbidden}>
        <div className={styles.forbiddenTitle}>Access Denied</div>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  if (loading) return <p className={styles.loading}>Loading admin panel...</p>;

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalPosts = posts.length;

  return (
    <>
      <div className={styles.header}>
        Admin Panel <span className={styles.adminBadge}>ADMIN</span>
      </div>
      <div className={styles.content}>
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Users</div>
            <div className={styles.statValue}>{totalUsers}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Admins</div>
            <div className={styles.statValue}>{totalAdmins}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Posts</div>
            <div className={styles.statValue}>{totalPosts}</div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Users</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userRow}>
                      <div className={styles.userAvatar}>
                        {u.name ? u.name[0].toUpperCase() : 'U'}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={u.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td>
                    {u.id !== user.id && (
                      <>
                        <button
                          className={styles.actionBtn}
                          onClick={() => toggleRole(u.id, u.role || 'user')}
                        >
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          className={styles.dangerBtn}
                          onClick={() => deleteUser(u.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>All Posts</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Author</th>
                <th>Content</th>
                <th>Tag</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>{p.author || 'Unknown'}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.content}
                  </td>
                  <td>
                    {p.tag && (
                      <span style={{ color: 'var(--accent-light)' }}>#{p.tag.replace('ANON', '').trim()}</span>
                    )}
                  </td>
                  <td>
                    <button className={styles.dangerBtn} onClick={() => deletePost(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
