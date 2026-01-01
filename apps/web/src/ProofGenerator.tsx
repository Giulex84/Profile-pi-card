import { useState } from "react";

type Props = {
  user: {
    uid: string;
    username: string;
  };
};

export default function ProofGenerator({ user }: Props) {
  const [proof, setProof] = useState<string | null>(null);

  const generateProof = () => {
    const timestamp = new Date().toISOString();
    const uidHash = hash(user.uid);
    const proofId = `PI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payload = `
PI IDENTITY PROOF
----------------------------
User: @${user.username}
UID hash: ${uidHash}
Action: Identity Verification
Timestamp: ${timestamp}
Proof ID: ${proofId}
`.trim();

    setProof(payload);
  };

  return (
    <main style={container}>
      <h1>Pi Identity Proof</h1>

      <p style={subtitle}>
        Generate a signed identity proof using your Pi account.
      </p>

      {!proof && (
        <button style={button} onClick={generateProof}>
          Generate Proof
        </button>
      )}

      {proof && (
        <div style={proofBox}>
          <pre>{proof}</pre>

          <button
            style={{ ...button, marginTop: 16 }}
            onClick={() => navigator.clipboard.writeText(proof)}
          >
            Copy Proof
          </button>
        </div>
      )}

      <footer style={footer}>
        This proof is generated using Pi authentication.
      </footer>
    </main>
  );
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16);
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  padding: 32,
  textAlign: "center",
  fontFamily: "system-ui",
};

const subtitle: React.CSSProperties = {
  fontSize: 16,
  opacity: 0.8,
  marginBottom: 24,
};

const button: React.CSSProperties = {
  padding: "12px 20px",
  fontSize: 16,
  borderRadius: 8,
  border: "none",
  background: "#6c2bd9",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const proofBox: React.CSSProperties = {
  marginTop: 24,
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 8,
  textAlign: "left",
  maxWidth: 520,
  marginInline: "auto",
};

const footer: React.CSSProperties = {
  marginTop: 40,
  fontSize: 12,
  opacity: 0.6,
};
