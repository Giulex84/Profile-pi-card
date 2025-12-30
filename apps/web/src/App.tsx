

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi?: any;
  }
}

type PiUser = {
  uid: string;
  username?: string;
};

export default function App() {
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initPi = async () => {
      try {
        if (!window.Pi) {
          throw new Error("Pi SDK not available");
        }

        window.Pi.init({
          version: "2.0",
          sandbox: false,
        });

        const authResult = await window.Pi.authenticate(
          ["username"],
          () => {}
        );

        setPiUser({
          uid: authResult.user.uid,
          username: authResult.user.username,
        });
      } catch (err: any) {
        setError("Unable to authenticate with Pi Network.");
      } finally {
        setLoading(false);
      }
    };

    initPi();
  }, []);

  if (loading) {
    return <div style={styles.center}>Loading…</div>;
  }

  if (error) {
    return <div style={styles.center}>{error}</div>;
  }

  if (!piUser) {
    return <div style={styles.center}>Authentication required.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pi Profile Card</h1>
      <p style={styles.subtitle}>
        A public profile you fully control.
      </p>

      <div style={styles.card}>
        <div style={styles.row}>
          <span style={styles.label}>Pi UID</span>
          <span style={styles.value}>{piUser.uid}</span>
        </div>

        {piUser.username && (
          <div style={styles.row}>
            <span style={styles.label}>Username</span>
            <span style={styles.value}>{piUser.username}</span>
          </div>
        )}
      </div>

      <p style={styles.footer}>
        This profile is managed through a third-party Pi Network application.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "32px 16px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#111",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: 500,
    color: "#444",
  },
  value: {
    fontFamily: "monospace",
    fontSize: 13,
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
};
