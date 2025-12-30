// apps/web/src/components/ProfileCard.tsx

import React from "react";

type Profile = {
  displayName: string;
  bio: string;
  published: boolean;
};

export default function ProfileCard({ profile }: { profile: Profile }) {
  if (!profile.published) {
    return (
      <div style={styles.notice}>
        Your profile is currently private.
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.name}>{profile.displayName}</h2>
      <p style={styles.bio}>{profile.bio}</p>
      <p style={styles.disclaimer}>
        This profile is published by the user via a third-party Pi Network app.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  name: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#333",
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: "#666",
  },
  notice: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    padding: 16,
  },
};
