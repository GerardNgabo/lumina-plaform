import { useState, useEffect } from 'react';
import { authFetch, API_BASE } from '../api/client';
import styles from '../styles/LikeButton.module.css';

export default function LikeButton({ postId }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchCount();
  }, [postId]);

  async function fetchCount() {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/likes`);
      const data = await res.json();
      setCount(data.count);
    } catch {}
  }

  async function toggle() {
    try {
      const res = await authFetch(`${API_BASE}/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        setLiked((prev) => !prev);
        fetchCount();
      }
    } catch {}
  }

  return (
    <button className={liked ? styles.liked : styles.button} onClick={toggle}>
      {liked ? '\u2764\uFE0F' : '\u2661'} <span className={styles.count}>{count}</span>
    </button>
  );
}
