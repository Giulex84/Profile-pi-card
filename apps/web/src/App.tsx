import { useEffect, useState } from "react";
import { isPiBrowser, authenticatePi } from "./pi";
import PiOnly from "./components/PiOnly";
import Loading from "./components/Loading";
import IdentityCard from "./components/IdentityCard";

type PiUser = {
  username: string;
  uid: string;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PiUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!isPiBrowser()) {
        setLoading(false);
        return;
      }

      try {
        const auth = await authenticatePi();
        setUser({
          username: auth.user.username,
          uid: auth.user.uid,
        });
      } catch (err: any) {
        setError(err.message || "Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (!isPiBrowser()) return <PiOnly />;

  if (loading) return <Loading text="Initializing Pi authentication..." />;

  if (error)
    return (
      <div style={{ textAlign: "center", marginTop: "40vh" }}>
        <p>Error: {error}</p>
      </div>
    );

  if (!user)
    return <Loading text="Waiting for Pi authentication..." />;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Pi Identity Hub</h1>
      <p>Authenticated via Pi Network</p>
      <IdentityCard username={user.username} uid={user.uid} />
    </div>
  );
}
