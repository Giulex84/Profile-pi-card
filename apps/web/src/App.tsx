import { useEffect, useState } from "react";

type Activity = {
  id: string;
  title: string;
  category: string;
  note?: string;
  createdAt: string;
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
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
    if (!title || !category) return;

    setActivities([
      {
        id: crypto.randomUUID(),
        title,
        category,
        note,
        createdAt: new Date().toISOString(),
      },
      ...activities,
    ]);

    setTitle("");
    setCategory("");
    setNote("");
  };

  return (
    <div style={styles.page}>
      <h1>Profile Pi Card</h1>
      <p>Your personal Pi activity journal</p>

      {!user && (
        <button style={styles.primary} onClick={connectWithPi}>
          Connect with Pi
        </button>
      )}

      {user && (
        <>
          <div style={styles.card}>
            <strong>@{user.username}</strong>
            <p>Pi identity connected</p>
          </div>

          <div style={styles.actions}>
            <button onClick={() => setShowPrivacy(true)}>Privacy Policy</button>
            <button onClick={() => setShowTerms(true)}>Terms of Service</button>
          </div>

          <div style={styles.card}>
            <h2>Add Activity</h2>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <textarea
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button style={styles.primary} onClick={addActivity}>
              Save activity
            </button>
          </div>

          <div style={styles.card}>
            <h2>Your activities</h2>
            {activities.length === 0 && <p>No activities yet.</p>}
            {activities.map((a) => (
              <div key={a.id} style={styles.item}>
                <strong>{a.title}</strong>
                <small>{a.category}</small>
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
            Profile Pi Card respects your privacy.  
            Data is stored locally on your device.  
            No tracking, no sharing, no third-party analytics.
          </p>
        </Modal>
      )}

      {showTerms && (
        <Modal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <p>
            This app is a personal utility tool.  
            No payments, no rewards, no guarantees.  
            Use at your own discretion.
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
  primary: {
    background: "#f5c518",
    padding: "10px 16px",
    border: "none",
    fontWeight: "bold",
  },
  card: {
    background: "#141a2b",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
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
