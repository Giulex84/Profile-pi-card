import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi?: any;
  }
}

type PiUser = {
  uid: string;
  username: string;
};

export default function App() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;

    const initPi = () => {
      attempts++;

      if (window.Pi && typeof window.Pi.authenticate === "function") {
        try {
          window.Pi.init({ version: "2.0" });

          window.Pi.authenticate(
            ["username"],
            (auth: any) => {
              setUser({
                uid: auth.user.uid,
                username: auth.user.username,
              });
              setLoading(false);
            },
            () => {
              setError("Authentication cancelled.");
              setLoading(false);
            }
          );
          return;
        } catch {
          // ignore and retry
        }
      }

      if (attempts < 10) {
        setTimeout(initPi, 300);
      } else {
        setError("Pi Browser required.");
        setLoading(false);
      }
    };

    initPi();
  }, []);

  if (loading) {
    return <div style={center}>Loading…</div>;
  }

  if (error) {
    return <div style={center}>{error}</div>;
  }

  if (!user) {
    return <div style={center}>No user.</div>;
  }

  const shareUrl = `${window.location.origin}/u/${user.username}`;

  return (
    <div style={card}>
      <h1>Profile Pi Card</h1>

      <p>
        <strong>Username</strong><br />
        {user.username}
      </p>

      <p>
        <strong>User ID</strong><br />
        {user.uid}
      </p>

      <p>
        <strong>Public profile</strong><br />
        <a href={shareUrl}>{shareUrl}</a>
      </p>

      <p style={{ fontSize: 12, opacity: 0.6 }}>
        You can share this link publicly.
      </p>
    </div>
  );
}

const center: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontSize: 18,
};

const card: React.CSSProperties = {
  maxWidth: 420,
  margin: "40px auto",
  padding: 24,
  border: "1px solid #ddd",
  borderRadius: 12,
  fontFamily: "sans-serif",
};
