import { useEffect, useState } from "react";
import { authenticatePi } from "./pi";
import Loading from "./components/Loading";

type PiUser = {
  username: string;
  uid: string;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PiUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const auth = await authenticatePi();
        setUser({
          username: auth.user.username,
          uid: auth.user.uid,
        });
      } catch (err: any) {
        setError(err.message || "Pi Browser required");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return <Loading text="Initializing Pi authentication..." />;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "40vh" }}>
        <h2>Pi Browser Required</h2>
        <p>This utility works exclusively inside the Pi Browser.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h1>Pi Identity Hub</h1>
      <p>Authenticated successfully</p>
      <p><strong>Username:</strong> {user?.username}</p>
      <p><strong>UID:</strong> {user?.uid}</p>
    </div>
  );
}
