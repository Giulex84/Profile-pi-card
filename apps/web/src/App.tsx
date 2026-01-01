// apps/web/src/App.tsx

import { useEffect, useState } from "react";
import { initPiSdk, authenticatePi } from "./pi";

type AppState =
  | "detecting"
  | "pi-required"
  | "ready"
  | "authenticating"
  | "authenticated"
  | "error";

type VerifiedAction = {
  id: string;
  title: string;
  category: string;
  note?: string;
  createdAt: string;
};

const STORAGE_KEY = "pi_verified_actions";

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
  const [user, setUser] = useState<any>(null);

  const [actions, setActions] = useState<VerifiedAction[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function detectPi() {
      const timeoutMs = 3000;
      const intervalMs = 100;
      let elapsed = 0;

      while (elapsed < timeoutMs) {
        if (typeof window !== "undefined" && (window as any).Pi) {
          try {
            initPiSdk();
            loadActions();
            if (!cancelled) setState("ready");
            return;
          } catch (err: any) {
            if (!cancelled) {
              setError(err.message || "Pi init failed");
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

  function loadActions() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setActions(JSON.parse(raw));
      } catch {
        setActions([]);
      }
    }
  }

  function saveActions(next: VerifiedAction[]) {
    setActions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function handleLogin() {
    setError(null);
    setState("authenticating");

    try {
      const auth = await authenticatePi();
      setUser(auth.user);
      setState("authenticated");
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
      setState("ready");
    }
  }

  function addAction() {
    if (!title || !category) return;

    const next: VerifiedAction = {
      id: uuid(),
      title,
      category,
      note,
      createdAt: new Date().toISOString(),
    };

    saveActions([next, ...actions]);
    setTitle("");
    setCategory("");
    setNote("");
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(actions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pi-verified-actions.json";
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
        <p>Please open this dApp inside Pi Browser.</p>
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
        <p>Pi Verified Actions</p>
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

          {error && <p style={styles.error}>{error}</p>}
        </section>
      )}

      {state === "authenticated" && (
        <>
          <section style={styles.card}>
            <h2>New Verified Action</h2>

            <input
              placeholder="Action title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />

            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.input}
            />

            <textarea
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.textarea}
            />

            <button style={styles.primaryButton} onClick={addAction}>
              Add Action
            </button>
          </section>

          <section style={styles.card}>
            <h2>Action History</h2>

            {actions.length === 0 && <p>No actions yet.</p>}

            {actions.map((a) => (
              <div key={a.id} style={styles.action}>
                <strong>{a.title}</strong>
                <span>{a.category}</span>
                {a.note && <p>{a.note}</p>}
                <small>{new Date(a.createdAt).toLocaleString()}</small>
              </div>
            ))}

            {actions.length > 0 && (
              <button style={styles.secondaryButton} onClick={exportJSON}>
                Export JSON
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
  header: {
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  card: {
    background: "#141a2a",
    borderRadius: 12,
    padding: "1rem",
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.6rem",
    marginBottom: "0.6rem",
    borderRadius: 8,
    border: "none",
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
    borderRadius: 10,
    border: "none",
    background: "#facc15",
    color: "#000",
    fontWeight: 600,
  },
  secondaryButton: {
    width: "100%",
    padding: "0.6rem",
    borderRadius: 10,
    border: "none",
    background: "#1f2937",
    color: "#fff",
    marginTop: "0.8rem",
  },
  action: {
    background: "#0b1020",
    borderRadius: 8,
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
  error: {
    color: "#f87171",
    marginTop: "0.5rem",
  },
};
