import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function TestPage() {
  const cookieStore = await cookies();
  const deploymentCookie = cookieStore.get('__vdpl');
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || 'development';

  return (
    <main>
      <div style={styles.container}>
        <h1 style={styles.title}>Test Page</h1>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✅ Skew Protection Verification</h2>
          <p style={styles.text}>
            This page should show the same deployment ID as the home page,
            proving that the <code>__vdpl</code> cookie is working correctly.
          </p>

          <div style={styles.info}>
            <div style={styles.infoRow}>
              <strong>Current Deployment:</strong>
              <code>{deploymentId}</code>
            </div>
            <div style={styles.infoRow}>
              <strong>Pinned to Deployment:</strong>
              <code>{deploymentCookie?.value || 'Not set'}</code>
            </div>
            <div style={styles.infoRow}>
              <strong>Match Status:</strong>
              <code style={{
                color: deploymentCookie?.value === deploymentId ? 'green' : 'orange'
              }}>
                {deploymentCookie?.value === deploymentId ? '✓ Matched' : '⚠ Mismatch'}
              </code>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔄 Navigation Test</h2>
          <p style={styles.text}>
            Navigate between pages to verify the cookie persists and all pages
            are served from the same deployment.
          </p>
          <Link href="/" style={styles.button}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    width: '100%',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '2rem',
    textAlign: 'center' as const,
    color: '#111',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#222',
  },
  text: {
    lineHeight: 1.6,
    marginBottom: '1rem',
  },
  info: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginTop: '1rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  button: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
  },
};
