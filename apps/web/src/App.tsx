// apps/web/src/App.tsx

import React, { useEffect, useState } from "react";
import ProfileEditor from "./components/ProfileEditor";
import ProfileCard from "./components/ProfileCard";
import { loadProfile, saveProfile, clearProfile } from "./utils/storage";
import { saveProfileRemote } from "./utils/api";
import PublicProfile from "./pages/PublicProfile";

declare global {
  interface Window {
    Pi?: any;
  }
}

type PiUser = {
  uid: string;
  username?: string;
};

type Profile = {
  displayName: string;
  bio: string;
  published: boolean;
};

export default function App() {
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [profile, setProfile] = useState<Profile>({
    displayName: "",
    bio: "",
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const path = window.location.pathname;
  if (path.startsWith("/p/")) {
    const slug = path.replace("/p/", "");
    return <PublicProfile slug={slug} />;
  }

  useEffect(() => {
    const initPi = async () => {
      try {
        if (!window.Pi) throw new Error();

        window.Pi.init({ version: "2.0", sandbox: false });

        const authResult = await window.Pi.authenticate(
          ["username"],
          () => {}
        );

        setPiUser({
          uid: authResult.user.uid,
          username: authResult.user.username,
        });

        const stored = loadProfile();
        setProfile(
          stored || {
            displayName: authResult.user.username || "Pi User",
            bio: "",
            published: false,
          }
        );
      } catch {
        setError("Unable to authenticate with Pi Network.");
      } finally {
        setLoading(false);
      }
    };

    initPi();
  }, []);

  useEffect(() => {
    saveProfile(profile);
    if (profile.published) {
      saveProfileRemote(profile);
    }
  }, [profile]);

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

      <ProfileEditor profile={profile} onChange={setProfile} />

      <ProfileCard profile={profile} />

      <button style={styles.delete} onClick={clearProfile}>
        Delete local profile data
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 420,
    margin: "0 auto",
    padding: "32px 16px",
    fontFamily: "system-ui, sans-serif",
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
    marginBottom: 24,
    textAlign: "center",
  },
  delete: {
    marginTop: 24,
    background: "transparent",
    border: "1px solid #e5e7eb",
    padding: "8px 12px",
    fontSize: 12,
    cursor: "pointer",
  },
};
