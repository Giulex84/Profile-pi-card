import { useState } from "react";

declare global {
  interface Window {
    Pi?: any;
  }
}

export default function PublicProfile() {
  const [username, setUsername] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const loginWithPi = async () => {
    try {
      const scopes = ["username"];
      const auth = await window.Pi.authenticate(scopes, () => {});
      setUsername(auth.user.username);
      setClaimed(true);
    } catch (e) {
      alert("Pi login failed");
    }
  };

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
      {!claimed && (
        <>
          <p>Claim your Pi Profile Card</p>
          <button
            onClick={loginWithPi}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#6c2bd9",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Login with Pi
          </button>
        </>
      )}

      {claimed && (
        <>
          <h2>@{username}</h2>

          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 20,
              background: "#4caf50",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              marginTop: 8,
            }}
          >
            Verified Pi User
          </div>

          <p style={{ marginTop: 16, fontSize: 14, color: "#666" }}>
            This profile is claimed via Pi Network.
          </p>
        </>
      )}
    </div>
  );
}
