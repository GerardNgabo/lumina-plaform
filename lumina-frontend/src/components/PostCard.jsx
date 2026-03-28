import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL, authFetch, API_BASE } from '../api/client';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import styles from '../styles/PostCard.module.css';

export default function PostCard({ post, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { isAdmin } = useAuth();

  const isAnon = post.tag && post.tag.includes('ANON');
  const displayName = isAnon ? 'Anonymous Student' : post.author;
  const displayInitials = isAnon ? '?' : (post.author ? post.author[0].toUpperCase() : 'U');
  const cleanTag = post.tag ? post.tag.replace('ANON', '').trim() : '';
  const isVideo = post.image_url && /\.(mp4|webm|ogg|mov)$/i.test(post.image_url);

  async function handleDelete() {
    try {
      const res = await authFetch(`${API_BASE}/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleted(true);
        onDelete?.();
      }
    } catch {}
  }

  if (deleted) return null;

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.avatar}>{displayInitials}</div>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{displayName}</span>
            {post.author_role === 'admin' && !isAnon && (
              <span className={styles.adminBadge}>ADMIN</span>
            )}
            {cleanTag && <span className={styles.tag}>#{cleanTag}</span>}
          </div>
          <div className={styles.timestamp}>
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
        {isAdmin && (
          <button className={styles.deleteBtn} onClick={handleDelete} title="Delete post">
            &#x2715;
          </button>
        )}
      </div>

      {post.content && <p className={styles.content}>{post.content}</p>}

      {post.image_url && !isVideo && (
        <img
          className={styles.media}
          src={`${SERVER_URL}${post.image_url}`}
          alt=""
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}

      {isVideo && (
        <video className={styles.media} controls>
          <source src={`${SERVER_URL}${post.image_url}`} type="video/mp4" />
        </video>
      )}

      <div className={styles.actions}>
        <LikeButton postId={post.id} />
        <button className={styles.commentBtn} onClick={() => setShowComments(!showComments)}>
          {'\uD83D\uDCAC'} Reply
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} isAdmin={isAdmin} />}
    </div>
  );
}
