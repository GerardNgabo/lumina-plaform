import styles from '../styles/TrendingSidebar.module.css';

export default function TrendingSidebar({ posts }) {
  const tagsMap = {};
  posts.forEach((p) => {
    if (p.tag) {
      const cleanTag = p.tag.replace('#', '').replace('ANON', '').trim().toUpperCase();
      if (cleanTag) {
        tagsMap[cleanTag] = (tagsMap[cleanTag] || 0) + 1;
      }
    }
  });

  const sorted = Object.entries(tagsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Trending</h3>
      {sorted.length === 0 ? (
        <p className={styles.empty}>No trending topics yet.</p>
      ) : (
        <div className={styles.list}>
          {sorted.map(([tag, count]) => (
            <div key={tag} className={styles.item}>
              <span className={styles.tagName}>#{tag}</span>
              <span className={styles.count}>{count} posts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
