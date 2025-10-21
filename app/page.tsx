import { cookies, headers } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
  // Access cookies and headers server-side
  const cookieStore = await cookies();

  const deploymentCookie = cookieStore.get('__vdpl');
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || 'development';
  const vercelEnv = process.env.VERCEL_ENV || 'development';

  return (
    <main>
      <div style={styles.container}>
        <h1 style={styles.title}>Custom Skew Protection Demo</h1>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🛡️ Skew Protection Status</h2>
          <div style={styles.info}>
            <div style={styles.infoRow}>
              <strong>Deployment ID:</strong>
              <code>{deploymentId}</code>
            </div>
            <div style={styles.infoRow}>
              <strong>Environment:</strong>
              <code>{vercelEnv}</code>
            </div>
            <div style={styles.infoRow}>
              <strong>__vdpl Cookie:</strong>
              <code>{deploymentCookie?.value || 'Not set (will be set on next request)'}</code>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📋 How It Works</h2>
          <ol style={styles.list}>
            <li>Middleware intercepts all requests</li>
            <li>Sets <code>__vdpl</code> cookie to current deployment ID</li>
            <li>All subsequent requests (HTML, assets, API) use the same cookie</li>
            <li>Vercel routes all requests to the same deployment</li>
            <li>Users don&apos;t experience version skew during rollouts</li>
          </ol>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🧪 Test It Out</h2>
          <div style={styles.buttonGroup}>
            <Link href="/api/deployment-info" style={styles.button}>
              Check API Deployment
            </Link>
            <Link href="/test" style={styles.button}>
              Visit Test Page
            </Link>
          </div>
          <p style={styles.hint}>
            Both should show the same deployment ID as this page
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚀 Deployment Info</h2>
          <div style={styles.codeBlock}>
            <pre>{JSON.stringify({
              deploymentId,
              environment: vercelEnv,
              cookieSet: !!deploymentCookie,
              timestamp: new Date().toISOString(),
            }, null, 2)}</pre>
          </div>
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
  info: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
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
  list: {
    paddingLeft: '1.5rem',
    lineHeight: 1.8,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
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
  hint: {
    fontSize: '0.9rem',
    color: '#666',
    fontStyle: 'italic' as const,
  },
  codeBlock: {
    backgroundColor: '#f4f4f4',
    padding: '1rem',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '0.85rem',
  },
};

export const dynamic = 'force-dynamic';