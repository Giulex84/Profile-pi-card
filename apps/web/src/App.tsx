import { useEffect, useMemo, useState } from "react";

type Activity = {
  id: string;
  title: string;
  category: string;
  note?: string;
  createdAt: string;
};

const PRESET_CATEGORIES = [
  "Event participation",
  "Community contribution",
  "Learning",
  "Testing / Feedback",
  "Personal milestone",
  "Other",
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("ppc_activities");
    if (stored) setActivities(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("ppc_activities", JSON.stringify(activities));
  }, [activities]);

  const stats = useMemo(() => {
    if (activities.length === 0) return null;
    const first = activities[activities.length - 1];
    const last = activities[0];
    return {
      first: new Date(first.createdAt).toLocaleDateString(),
      last: new Date(last.createdAt).toLocaleDateString(),
    };
  }, [activities]);

  const connectWithPi = async () => {
    try {
      if (!window.Pi) throw new Error("Pi SDK not available");
      window.Pi.init({ version: "2.0", sandbox: false });
      const auth = await window.Pi.authenticate(["username"], {
        onIncompletePaymentFound: () => {},
      });
      setUser(auth.user);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const addActivity = () => {
    const finalCategory =
      category === "Other" ? customCategory.trim() : category;
    if (!title || !finalCategory) return;

    setActivities([
      {
        id: crypto.randomUUID(),
        title,
        category: finalCategory,
        note,
        createdAt: new Date().toISOString(),
      },
      ...activities,
    ]);

    setTitle("");
    setCategory("");
    setCustomCategory("");
    setNote("");
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Profile Pi Card</h1>
        <p style={styles.subtitle}>
          A quiet place to keep track of your Pi journey.
        </p>
      </header>

      {!user && (
        <section style={styles.centerCard}>
          <p style={styles.helper}>
            This journal grows with you over time.
          </p>
          <button style={styles.primary} onClick={connectWithPi}>
            Connect with Pi
          </button>
        </section>
      )}

      {user && (
        <>
          <section style={styles.identityCard}>
            <strong>@{user.username}</strong>
            <p style={styles.muted}>
              Your Pi identity is connected. Everything here stays personal.
            </p>

            {stats && (
              <p style={styles.time}>
                First entry: {stats.first} · Last update: {stats.last}
              </p>
            )}
          </section>

          <section style={styles.inlineActions}>
            <button style={styles.link} onClick={() => setShowPrivacy(true)}>
              Privacy Policy
            </button>
            <button style={styles.link} onClick={() => setShowTerms(true)}>
              Terms of Service
            </button>
          </section>

          <section style={styles.card}>
            <h2 style={styles.h2}>Add an activity</h2>
            <p style={styles.helper}>
              What did you do recently? This is just for you.
            </p>

            <input
              style={styles.input}
              placeholder="What did you do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
              style={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Choose a category</option>
              {PRESET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {category === "Other" && (
              <input
                style={styles.input}
                placeholder="Describe your category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}

            <textarea
              style={styles.textarea}
              placeholder="Optional notes (why it mattered, what you learned)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button style={styles.primary} onClick={addActivity}>
              Save activity
            </button>
          </section>

          <section style={styles.card}>
            <h2 style={styles.h2}>Your activity journal</h2>

            {activities.length === 0 && (
              <div style={styles.empty}>
                <p style={styles.emptyTitle}>Your journal is empty</p>
                <p style={styles.muted}>
                  Start with something small. You can add more anytime.
                </p>
              </div>
            )}

            {activities.map((a) => (
              <div key={a.id} style={styles.item}>
                <strong>{a.title}</strong>
                <div style={styles.badge}>{a.category}</div>
                {a.note && <p style={styles.note}>{a.note}</p>}
                <small style={styles.muted}>
                  {new Date(a.createdAt).toLocaleString()}
                </small>
              </div>
            ))}
          </section>
        </>
      )}

      {showPrivacy && (
        <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <p>
            Profile Pi Card stores your activities locally on your device.<br />
            No tracking, no sharing, no third-party analytics.
          </p>
        </Modal>
      )}

      {showTerms && (
        <Modal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <p>
            Profile Pi Card is a personal journaling utility.<br />
            It provides no payments, rewards, or guarantees.
          </p>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: any;
  onClose: () => void;
}) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.h2}>{title}</h2>
        <div style={{ overflowY: "auto", maxHeight: "60vh" }}>{children}</div>
        <button style={styles.secondary} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles: any = {
  page: {
    padding: 20,
    background: "#0b0f1a",
    color: "#ffffff",
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  h1: { fontSize: 28, marginBottom: 8 },
  h2: { fontSize: 18, marginBottom: 6 },
  subtitle: { opacity: 0.85, fontSize: 14 },
  helper: { fontSize: 13, opacity: 0.7 },
  muted: { opacity: 0.65, fontSize: 13 },
  time: { marginTop: 6, fontSize: 12, opacity: 0.6 },
  centerCard: {
    background: "#141a2b",
    padding: 24,
    borderRadius: 14,
    textAlign: "center",
  },
  identityCard: {
    background: "#0f1528",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  inlineActions: {
    display: "flex",
    gap: 16,
    marginBottom: 12,
  },
  link: {
    background: "none",
    border: "none",
    color: "#f5c518",
    padding: 0,
    fontSize: 13,
  },
  card: {
    background: "#141a2b",
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  input: {
    padding: 10,
    borderRadius: 10,
    border: "none",
    fontSize: 14,
  },
  textarea: {
    padding: 10,
    borderRadius: 10,
    border: "none",
    fontSize: 14,
    minHeight: 70,
  },
  primary: {
    background: "#f5c518",
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    fontWeight: 600,
    marginTop: 8,
  },
  secondary: {
    background: "#1f2937",
    border: "none",
    borderRadius: 12,
    padding: "8px 14px",
    color: "#fff",
    marginTop: 12,
  },
  item: {
    background: "#0f1528",
    padding: 12,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    display: "inline-block",
    marginTop: 4,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#1f2937",
    fontSize: 12,
    opacity: 0.85,
    width: "fit-content",
  },
  note: { fontSize: 14 },
  empty: { textAlign: "center", padding: 16 },
  emptyTitle: { fontSize: 16, marginBottom: 6 },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    background: "#111827",
    padding: 20,
    borderRadius: 14,
    width: "90%",
    maxWidth: 420,
  },
};
