import { useState, useEffect } from 'react';
import { jsonFetch, authFetch, API_BASE } from '../api/client';
import styles from '../styles/CommentSection.module.css';

export default function CommentSection({ postId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    try {
      const res = await fetch(`${API_BASE}/comments/${postId}`);
      const data = await res.json();
      setComments(data);
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await jsonFetch(`${API_BASE}/comments`, {
        method: 'POST',
        body: JSON.stringify({ post_id: postId, comment: text }),
      });
      if (res.ok) {
        setText('');
        loadComments();
      }
    } catch {}
  }

  async function handleDelete(commentId) {
    try {
      const res = await authFetch(`${API_BASE}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) loadComments();
    } catch {}
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {comments.length === 0 ? (
          <p className={styles.empty}>No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className={styles.comment}>
              <div className={styles.commentContent}>
                <span className={styles.commentAuthor}>{c.user_name}:</span>
                <span className={styles.commentText}>{c.comment}</span>
              </div>
              {isAdmin && (
                <button className={styles.deleteComment} onClick={() => handleDelete(c.id)}>
                  &#x2715;
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          placeholder="Write a reply..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className={styles.sendBtn} type="submit">Send</button>
      </form>
    </div>
  );
}
