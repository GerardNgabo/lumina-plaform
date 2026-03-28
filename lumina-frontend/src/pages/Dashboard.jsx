import { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { API_BASE } from '../api/client';
import styles from '../styles/Dashboard.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Dashboard() {
  const [totalPosts, setTotalPosts] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [topTags, setTopTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function fetchData() {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      const posts = await res.json();

      setTotalPosts(posts.length);
      setActiveUsers([...new Set(posts.map((p) => p.user_id))].length);

      const tagsMap = {};
      posts.forEach((p) => {
        if (p.tag) {
          const clean = p.tag.replace('#', '').replace('ANON', '').trim().toUpperCase();
          if (clean) tagsMap[clean] = (tagsMap[clean] || 0) + 1;
        }
      });

      const sorted = Object.entries(tagsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setTopTags(sorted);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  const chartData = {
    labels: topTags.map(([tag]) => '#' + tag),
    datasets: [
      {
        label: 'Reports',
        data: topTags.map(([, count]) => count),
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(52, 211, 153, 0.7)',
          'rgba(110, 231, 183, 0.6)',
          'rgba(167, 243, 208, 0.5)',
          'rgba(209, 250, 229, 0.4)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(52, 211, 153, 1)',
          'rgba(110, 231, 183, 1)',
          'rgba(167, 243, 208, 1)',
          'rgba(209, 250, 229, 1)',
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#262626' },
        ticks: { color: '#a3a3a3', stepSize: 1 },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#a3a3a3' },
      },
    },
  };

  if (loading) return <p className={styles.loading}>Loading dashboard...</p>;

  return (
    <>
      <div className={styles.header}>Dashboard</div>
      <div className={styles.content}>
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Posts</div>
            <div className={styles.statValue}>{totalPosts}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active Users</div>
            <div className={styles.statValue}>{activeUsers}</div>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>Top Trending Issues</h3>
          <div className={styles.chartWrapper}>
            {topTags.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', paddingTop: 40 }}>
                No data yet.
              </p>
            )}
          </div>
        </div>

        <div className={styles.trendingSection}>
          <h3 className={styles.trendingTitle}>Trending Tags</h3>
          <div className={styles.trendingList}>
            {topTags.map(([tag, count]) => (
              <div key={tag} className={styles.trendingItem}>
                <span className={styles.trendingTag}>#{tag}</span>
                <span className={styles.trendingCount}>{count} reports</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
