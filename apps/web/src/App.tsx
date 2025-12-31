import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

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
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PiUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.Pi) {
      setError("Pi Browser not detected.");
      setLoading(false);
      return;
    }

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
      (err: any) => {
        setError("Authentication failed.");
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return <div style={styles.center}>Loading…</div>;
  }

  if (error) {
    return <div style={styles.center}>{error}</div>;
  }

  if (!user) {
    return <div style={styles.center}>No user.</div>;
  }

  return <PublicProfile username={user.username} />;
}

const styles = {
  center: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
};
