import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jsonFetch, API_BASE } from '../api/client';
import PostCard from '../components/PostCard';
import styles from '../styles/Profile.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadUserPosts();
  }, [user]);

  async function loadUserPosts() {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      const data = await res.json();
      const mine = data.filter((p) => p.user_id === user?.id);
      setPosts(mine);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveName() {
    if (!newName.trim()) return;
    try {
      const res = await jsonFetch(`${API_BASE}/auth/update`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        updateUser({ ...user, name: newName });
        setEditing(false);
        setNewName('');
      }
    } catch {}
  }

  const initials = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      <div className={styles.header}>Profile</div>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.name}>{user?.name}</div>
        <div className={styles.email}>{user?.email}</div>
        {editing ? (
          <div className={styles.editForm}>
            <input
              className={styles.editInput}
              placeholder="New display name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button className={styles.saveBtn} onClick={handleSaveName}>Save</button>
            <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        ) : (
          <button className={styles.editBtn} onClick={() => { setEditing(true); setNewName(user?.name || ''); }}>
            Edit Profile
          </button>
        )}
      </div>
      <div className={styles.sectionTitle}>My Posts</div>
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty}>You haven't posted anything yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </>
  );
}
