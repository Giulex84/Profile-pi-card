import { useEffect, useState } from "react";

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
      <h1>Profile Pi Card</h1>
      <p style={styles.subtitle}>
        Your personal Pi activity journal — private, simple, under your control.
      </p>

      {!user && (
        <button style={styles.primary} onClick={connectWithPi}>
          Connect with Pi
        </button>
      )}

      {user && (
        <>
          <div style={styles.card}>
            <strong>@{user.username}</strong>
            <p style={{ opacity: 0.8 }}>
              Your Pi identity is connected. Activities remain private to you.
            </p>
          </div>

          <div style={styles.actions}>
            <button onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
            <button onClick={() => setShowTerms(true)}>Terms of Service</button>
          </div>

          <div style={styles.card}>
            <h2>Add an activity</h2>
            <p style={styles.helper}>
              Record something you did related to Pi — for your own reference.
            </p>

            <input
              placeholder="What did you do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <select
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
                placeholder="Describe your category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}

            <textarea
              placeholder="Optional notes (why it mattered, what you learned, etc.)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button style={styles.primary} onClick={addActivity}>
              Save activity
            </button>
          </div>

          <div style={styles.card}>
            <h2>Your activity journal</h2>

            {activities.length === 0 && (
              <div style={styles.empty}>
                <p>
                  Nothing here yet.
                  <br />
                  This journal is private and always under your control.
                </p>
                <p style={{ opacity: 0.7 }}>
                  Start by adding your first activity whenever you’re ready.
                </p>
              </div>
            )}

            {activities.map((a) => (
              <div key={a.id} style={styles.item}>
                <strong>{a.title}</strong>
                <div style={{ opacity: 0.8 }}>{a.category}</div>
                {a.note && <p>{a.note}</p>}
                <small>{new Date(a.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </>
      )}

      {showPrivacy && (
        <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <p>
            Profile Pi Card respects your privacy.<br />
            Activities are stored locally on your device.<br />
            No tracking, no sharing, no third-party analytics.
          </p>
        </Modal>
      )}

      {showTerms && (
        <Modal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <p>
            Profile Pi Card is a personal journaling utility.<br />
            It does not process payments, rewards, or guarantees.<br />
            Use the app at your own discretion.
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
        <h2>{title}</h2>
        <div style={{ overflowY: "auto", maxHeight: "60vh" }}>{children}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    padding: 20,
    color: "#fff",
    background: "#0b0f1a",
    minHeight: "100vh",
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 20,
  },
  helper: {
    fontSize: 14,
    opacity: 0.7,
  },
  primary: {
    background: "#f5c518",
    padding: "10px 16px",
    border: "none",
    fontWeight: "bold",
    marginTop: 8,
  },
  card: {
    background: "#141a2b",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  item: {
    borderBottom: "1px solid #222",
    padding: "8px 0",
  },
  empty: {
    padding: 12,
    textAlign: "center",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    background: "#111",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxWidth: 500,
  },
};
