import { useState, useEffect } from 'react';
import { API_BASE } from '../api/client';
import PostCreate from '../components/PostCreate';
import PostCard from '../components/PostCard';
import TrendingSidebar from '../components/TrendingSidebar';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      const data = await res.json();
      setPosts(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.feedCol}>
        <div className={styles.header}>Home</div>
        <PostCreate onPostCreated={loadPosts} />
        <div className={styles.feed}>
          {loading ? (
            <p className={styles.loading}>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className={styles.empty}>No posts yet. Be the first!</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <div className={styles.sidebarCol}>
        <TrendingSidebar posts={posts} />
      </div>
    </div>
  );
}
