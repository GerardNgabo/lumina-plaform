import { useState } from 'react';
import { SERVER_URL } from '../api/client';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import styles from '../styles/PostCard.module.css';

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);

  const isAnon = post.tag && post.tag.includes('ANON');
  const displayName = isAnon ? 'Anonymous Student' : post.author;
  const displayInitials = isAnon ? '?' : (post.author ? post.author[0].toUpperCase() : 'U');
  const cleanTag = post.tag ? post.tag.replace('ANON', '').trim() : '';

  const isVideo = post.image_url && /\.(mp4|webm|ogg|mov)$/i.test(post.image_url);

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <div className={styles.avatar}>{displayInitials}</div>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{displayName}</span>
            {cleanTag && <span className={styles.tag}>#{cleanTag}</span>}
          </div>
          <div className={styles.timestamp}>
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
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

      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}
