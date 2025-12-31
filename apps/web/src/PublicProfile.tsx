import { useEffect, useState } from "react";

export default function PublicProfile() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Username mock pubblico (finché non colleghiamo backend)
    // In review Pi è ACCETTATO
    setTimeout(() => {
      setUsername("Giulex84");
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <p>Loading public profile...</p>;
  }

  return (
    <div
      style={{
        marginTop: 40,
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 12,
        maxWidth: 360,
        marginInline: "auto",
      }}
    >
      <h2 style={{ marginBottom: 8 }}>@{username}</h2>

      {/* BADGE */}
      <div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 20,
          background: "#f5c518",
          color: "#000",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Pi Pioneer
      </div>

      <p style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
        This is a public Pi profile card.
      </p>
    </div>
  );
}
