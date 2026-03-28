import { useState, useRef } from 'react';
import { authFetch, API_BASE } from '../api/client';
import styles from '../styles/PostCreate.module.css';

export default function PostCreate({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [anon, setAnon] = useState(false);
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();

  async function handleSubmit() {
    if (!content.trim() && !file) return;
    setPosting(true);

    const formData = new FormData();
    formData.append('content', content);
    let finalTag = tag;
    if (anon) finalTag += ' ANON';
    formData.append('tag', finalTag);
    if (file) formData.append('image', file);

    try {
      const res = await authFetch(`${API_BASE}/posts`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setContent('');
        setTag('');
        setAnon(false);
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
        onPostCreated?.();
      }
    } catch {
      // silently fail
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <input
            className={styles.tagInput}
            type="text"
            placeholder="#tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <label className={styles.fileLabel}>
            {'\uD83D\uDCCE'} Media
            <input
              ref={fileRef}
              className={styles.fileInput}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </label>
          {file && <span className={styles.fileName}>{file.name}</span>}
          <label className={styles.anonLabel}>
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
            Anonymous
          </label>
        </div>
        <button className={styles.postBtn} onClick={handleSubmit} disabled={posting}>
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
