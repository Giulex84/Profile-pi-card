import { useEffect, useState } from "react";
import PublicProfile from "./PublicProfile";

declare global {
  interface Window {
    Pi: any;
  }
}

type PiUser = {
  uid: string;
  username: string;
};

export default function App() {
  const [user, setUser] = useState<PiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const publicUser = params.get("user");

  useEffect(() => {
    if (publicUser) {
      setLoading(false);
      return;
    }

    if (!window.Pi) {
      setLoading(false);
      return;
    }

    window.Pi.authenticate(
      ["username"],
      (authResult: any) => {
        setUser({
          uid: authResult.user.uid,
          username: authResult.user.username,
        });
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [publicUser]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 40 }}>Loading…</div>;
  }

  if (publicUser) {
    return <PublicProfile username={publicUser} />;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        Pi Browser authentication required.
      </div>
    );
  }

  const shareUrl = `${window.location.origin}?user=${user.username}`;

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Profile Pi Card</h1>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>User ID:</strong> {user.uid}</p>

      <p>
        <strong>Public link:</strong><br />
        <a href={shareUrl}>{shareUrl}</a>
      </p>
    </div>
  );
}
