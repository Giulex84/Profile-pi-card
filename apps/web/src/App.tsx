// apps/web/src/App.tsx

import { useEffect, useState } from "react";
import { initPiSdk, authenticatePi, PiAuthPayload } from "./pi";

type AppState =
  | "detecting"
  | "pi-required"
  | "ready"
  | "authenticating"
  | "authenticated"
  | "error";

type ActivityType =
  | "event"
  | "task"
  | "community"
  | "beta"
  | "identity"
  | "supporter"
  | "custom";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
};

const STORAGE_KEY = "pi_activity_journal";
const LEGAL_SEEN_KEY = "pi_legal_seen_v1";

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  event: "Event attendance",
  task: "Task completed",
  community: "Community contribution",
  beta: "Beta tester",
  identity: "Identity verification",
  supporter: "Early supporter",
  custom: "Custom entry",
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
  const [auth, setAuth] = useState<PiAuthPayload | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [type, setType] = useState<ActivityType>("event");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const [showLegal, setShowLegal] = useState(false);

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
            loadActivities();
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

  function loadActivities() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setActivities(JSON.parse(raw));
      } catch {
        setActivities([]);
      }
    }
  }

  function saveActivities(next: Activity[]) {
    setActivities(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function handleLogin() {
    setError(null);
    setState("authenticating");

    try {
      const payload = await authenticatePi();
      setAuth(payload);
      setState("authenticated");

      const seen = localStorage.getItem(LEGAL_SEEN_KEY);
      if (!seen) {
        setShowLegal(true);
        localStorage.setItem(LEGAL_SEEN_KEY, "true");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setState("ready");
    }
  }

  function resetForm() {
    setType("event");
    setTitle("");
    setNote("");
    setEditingId(null);
  }

  function submitActivity() {
    if (!title.trim()) return;

    const now = new Date().toISOString();

    if (editingId) {
      saveActivities(
        activities.map((a) =>
          a.id === editingId
            ? { ...a, type, title, note, updatedAt: now }
            : a
        )
      );
    } else {
      saveActivities([
        {
          id: uuid(),
          type,
          title,
          note: note || undefined,
          createdAt: now,
        },
        ...activities,
      ]);
    }

    resetForm();
  }

  function editActivity(a: Activity) {
    setEditingId(a.id);
    setType(a.type);
    setTitle(a.title);
    setNote(a.note || "");
  }

  function deleteActivity(id: string) {
    if (!confirm("Remove this activity from your journal?")) return;
    saveActivities(activities.filter((a) => a.id !== id));
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
        <p style={styles.subtitle}>Your personal Pi activity journal</p>
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
          {showLegal && (
            <section style={styles.card}>
              <h2>Before you start</h2>
              <p>
                Profile Pi Card is a personal utility. Your data stays under
                your control and is stored locally.
              </p>
              <p>
                <strong>Privacy Policy</strong> and{" "}
                <strong>Terms of Service</strong> are available below.
              </p>
              <button
                style={styles.secondaryButton}
                onClick={() => setShowLegal(false)}
              >
                Continue
              </button>
            </section>
          )}

          <section style={styles.profileCard}>
            <strong>@{auth?.user.username}</strong>
            <p style={{ opacity: 0.8 }}>
              {activities.length} activities recorded
            </p>
          </section>

          <section style={styles.card}>
            <h2>{editingId ? "Edit activity" : "Add activity"}</h2>

            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              style={styles.input}
            >
              {Object.keys(ACTIVITY_LABELS).map((k) => (
                <option key={k} value={k}>
                  {ACTIVITY_LABELS[k as ActivityType]}
                </option>
              ))}
            </select>

            <input
              placeholder="Activity title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />

            <textarea
              placeholder="Optional note (for your reference)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.textarea}
            />

            <button style={styles.primaryButton} onClick={submitActivity}>
              {editingId ? "Update entry" : "Save to journal"}
            </button>

            {editingId && (
              <button style={styles.secondaryButton} onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </section>

          <section style={styles.card}>
            <h2>Your activity history</h2>

            {activities.length === 0 && (
              <p>
                Start by adding your first activity to build your journal over
                time.
              </p>
            )}

            {activities.map((a) => (
              <div key={a.id} style={styles.entry}>
                <strong>{a.title}</strong>
                <p style={{ opacity: 0.8 }}>{ACTIVITY_LABELS[a.type]}</p>
                <small>
                  Recorded on {new Date(a.createdAt).toLocaleString()}
                  {a.updatedAt && " · updated"}
                </small>
                {a.note && <p>{a.note}</p>}

                <div style={styles.entryActions}>
                  <button
                    style={styles.linkButton}
                    onClick={() => editActivity(a)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.linkButton}
                    onClick={() => deleteActivity(a.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>

          <footer style={styles.footer}>
            <a href="/PRIVACY_POLICY.md">Privacy Policy</a> ·{" "}
            <a href="/TERMS_OF_SERVICE.md">Terms of Service</a>
          </footer>
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
  subtitle: { opacity: 0.85 },
  card: {
    background: "#141a2a",
    borderRadius: 14,
    padding: "1rem",
    marginBottom: "1rem",
  },
  profileCard: {
    background: "#0b1020",
    borderRadius: 14,
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
    marginTop: "0.5rem",
  },
  entry: {
    background: "#0b1020",
    borderRadius: 10,
    padding: "0.6rem",
    marginBottom: "0.6rem",
  },
  entryActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.4rem",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#facc15",
    padding: 0,
  },
  footer: {
    textAlign: "center",
    fontSize: "0.85rem",
    opacity: 0.8,
    marginBottom: "1rem",
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
