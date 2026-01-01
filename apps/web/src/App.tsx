// apps/web/src/App.tsx

import { useEffect, useState } from "react";
import { initPiSdk, authenticatePi } from "./pi";
import { buildPiAuthPayload, PiAuthPayload } from "./pi-auth";

type AppState =
  | "detecting"
  | "pi-required"
  | "ready"
  | "authenticating"
  | "authenticated"
  | "error";

type ProofType =
  | "event"
  | "task"
  | "community"
  | "beta"
  | "identity"
  | "supporter";

type Proof = {
  id: string;
  type: ProofType;
  title: string;
  note?: string;
  createdAt: string;
};

const STORAGE_KEY = "pi_proofs";

const PROOF_TEMPLATES: Record<ProofType, string> = {
  event: "Event Attendance",
  task: "Task Completed",
  community: "Community Contribution",
  beta: "Beta Tester",
  identity: "Identity Verification",
  supporter: "Early Supporter",
};

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function App() {
  const [state, setState] = useState<AppState>("detecting");
  const [error, setError] = useState<string | null>(null);
  const [authPayload, setAuthPayload] = useState<PiAuthPayload | null>(null);

  const [proofs, setProofs] = useState<Proof[]>([]);
  const [selectedType, setSelectedType] = useState<ProofType | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function detectPi() {
      const timeoutMs = 3000;
      const intervalMs = 100;
      let elapsed = 0;

      while (elapsed < timeoutMs) {
        if ((window as any).Pi) {
          try {
            initPiSdk();
            loadProofs();
            if (!cancelled) setState("ready");
            return;
          } catch (err: any) {
            if (!cancelled) {
              setError(err.message);
              setState("error");
            }
            return;
          }
        }
        await new Promise((r) => setTimeout(r, intervalMs));
        elapsed += intervalMs;
      }

      if (!cancelled) setState("pi-required");
    }

    detectPi();
    return () => {
      cancelled = true;
    };
  }, []);

  function loadProofs() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProofs(JSON.parse(raw));
      } catch {
        setProofs([]);
      }
    }
  }

  function saveProofs(next: Proof[]) {
    setProofs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function handleLogin() {
    setError(null);
    setState("authenticating");

    try {
      const authResult = await authenticatePi();
      const payload = buildPiAuthPayload(authResult);

      // ⬇️ BACKEND HANDOFF (pronto)
      console.log("SEND TO BACKEND:", payload);

      setAuthPayload(payload);
      setState("authenticated");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setState("ready");
    }
  }

  function addProof() {
    if (!selectedType) return;

    const next: Proof = {
      id: uuid(),
      type: selectedType,
      title: PROOF_TEMPLATES[selectedType],
      note: note || undefined,
      createdAt: new Date().toISOString(),
    };

    saveProofs([next, ...proofs]);
    setSelectedType(null);
    setNote("");
  }

  function exportJSON() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            user: authPayload?.user,
            proofs,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pi-profile-card.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (state === "detecting") {
    return <Centered>Detecting Pi Browser…</Centered>;
  }

  if (state === "pi-required") {
    return (
      <Centered>
        <h2>Pi Browser Required</h2>
        <p>Please open this app inside Pi Browser.</p>
      </Centered>
    );
  }

  if (state === "error") {
    return (
      <Centered>
        <h2>Error</h2>
        <p>{error}</p>
      </Centered>
    );
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>Profile Pi Card</h1>
        <p style={styles.subtitle}>
          Your Pi identity card with reusable activity proofs.
        </p>
      </header>

      {state !== "authenticated" && (
        <section style={styles.card}>
          <button
            style={styles.primaryButton}
            onClick={handleLogin}
            disabled={state === "authenticating"}
          >
            {state === "authenticating"
              ? "Connecting…"
              : "Connect with Pi"}
          </button>
        </section>
      )}

      {state === "authenticated" && (
        <>
          <section style={styles.profileCard}>
            <div>
              <strong>@{authPayload?.user.username}</strong>
              <p style={{ opacity: 0.8 }}>{proofs.length} proofs</p>
            </div>
            <div style={styles.badge}>PI VERIFIED</div>
          </section>

          <section style={styles.card}>
            <h2>Add Proof</h2>

            <div style={styles.grid}>
              {(Object.keys(PROOF_TEMPLATES) as ProofType[]).map((k) => (
                <button
                  key={k}
                  style={{
                    ...styles.templateButton,
                    borderColor:
                      selectedType === k ? "#facc15" : "transparent",
                  }}
                  onClick={() => setSelectedType(k)}
                >
                  {PROOF_TEMPLATES[k]}
                </button>
              ))}
            </div>

            {selectedType && (
              <>
                <textarea
                  placeholder="Optional note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={styles.textarea}
                />
                <button style={styles.primaryButton} onClick={addProof}>
                  Save Proof
                </button>
              </>
            )}
          </section>

          <section style={styles.card}>
            <h2>Your Proofs</h2>

            {proofs.map((p) => (
              <div key={p.id} style={styles.proof}>
                <strong>{p.title}</strong>
                {p.note && <p>{p.note}</p>}
                <small>{new Date(p.createdAt).toLocaleString()}</small>
              </div>
            ))}

            {proofs.length > 0 && (
              <button style={styles.secondaryButton} onClick={exportJSON}>
                Export Profile Card
              </button>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Centered({ children }: { children: any }) {
  return (
    <div style={styles.centered}>
      <div style={styles.card}>{children}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#0b0f1a",
    color: "#fff",
    padding: "1rem",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: { textAlign: "center", marginBottom: "1rem" },
  subtitle: { opacity: 0.85, fontSize: "0.95rem" },
  card: {
    background: "#141a2a",
    borderRadius: 14,
    padding: "1rem",
    marginBottom: "1rem",
  },
  profileCard: {
    background: "linear-gradient(135deg, #1f2937, #0b1020)",
    borderRadius: 16,
    padding: "1rem",
    marginBottom: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    background: "#facc15",
    color: "#000",
    padding: "0.4rem 0.6rem",
    borderRadius: 10,
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.6rem",
    marginBottom: "0.8rem",
  },
  templateButton: {
    background: "#0b1020",
    borderRadius: 10,
    padding: "0.6rem",
    border: "2px solid transparent",
    color: "#fff",
    textAlign: "center",
  },
  textarea: {
    width: "100%",
    padding: "0.6rem",
    marginBottom: "0.6rem",
    borderRadius: 8,
    border: "none",
    minHeight: 60,
  },
  primaryButton: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: 12,
    border: "none",
    background: "#facc15",
    color: "#000",
    fontWeight: 600,
  },
  secondaryButton: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: 12,
    border: "none",
    background: "#1f2937",
    color: "#fff",
    marginTop: "0.8rem",
  },
  proof: {
    background: "#0b1020",
    borderRadius: 10,
    padding: "0.6rem",
    marginBottom: "0.5rem",
  },
  centered: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b0f1a",
    color: "#fff",
    padding: "1rem",
  },
};
