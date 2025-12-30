// apps/web/src/pages/PublicProfile.tsx

import React, { useEffect, useState } from "react";
import { loadPublicProfile } from "../utils/api";

type Profile = {
  displayName: string;
  bio: string;
  published: boolean;
};

export default function PublicProfile({ slug }: { slug: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPublicProfile(slug)
      .then((data) => {
        if (!data || !data.published) {
          setError(true);
        } else {
          setProfile(data);
        }
      })
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return <div style={styles.center}>Profile not available.</div>;
  }

  if (!profile) {
    return <div style={styles.center}>Loading…</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.name}>{profile.displayName}</h1>
      <p style={styles.bio}>{profile.bio}</p>
      <p style={styles.disclaimer}>
        This profile is published by the user via a third-party Pi Network app.
      </p>
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
  name: {
    fontSize: 26,
    fontWeight: 600,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: "#333",
  },
  disclaimer: {
    marginTop: 24,
    fontSize: 12,
    color: "#666",
  },
};
